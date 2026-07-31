import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "../config/supabase";
import { friendlyAuthError } from "@/supabase";

export type User = {
  userId: string;
  token: string;
  email: string;
  fullName: string;
  companyName: string;
  planName: string;
  role: "ceo" | "staff";
  companyId: string;
};

export type RegisterResult = {
  success: boolean;
  uid?: string;
  error?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    name: string,
    companyName: string,
    plan: string | number,
  ) => Promise<RegisterResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  register: async () => ({ success: false }),
  logout: async () => {},
});

/**
 * Loads the application-specific information associated with a Supabase user.
 */
async function mapSessionToUser(
  session: NonNullable<
    Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]
  >,
): Promise<User> {
  const supabaseUser = session.user;

  console.log("🔍 [DEBUG] 1. Session User ID:", supabaseUser.id);
  console.log("🔍 [DEBUG] 2. Access Token Present:", !!session.access_token);

  // --- TEST A: Fetch ONLY profile without joins ---
  const { data: rawProfile, error: rawProfileError } = await supabase
    .from("profile")
    .select("*")
    .eq("user_id", supabaseUser.id)
    .maybeSingle();

  console.log("🔍 [DEBUG] 3. Simple Profile Query Result:", rawProfile);
  console.log("🔍 [DEBUG] 4. Simple Profile Query Error:", rawProfileError);

  if (!rawProfile) {
    console.error(
      "❌ [DEBUG] Simple profile query returned null. This is 100% an RLS issue on the 'profile' table!",
    );
  }

  // --- TEST B: Fetch profile WITH company join ---
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select(
      `
      role,
      company_id,
      full_name,
      company (
        name,
        plan_id
      )
    `,
    )
    .eq("user_id", supabaseUser.id)
    .maybeSingle();

  console.log("🔍 [DEBUG] 5. Joined Profile Result:", profile);
  console.log("🔍 [DEBUG] 6. Joined Profile Error:", profileError);

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    throw new Error(
      `No profile found for user_id: ${supabaseUser.id}. Check RLS policies on 'profile' and 'company'.`,
    );
  }

  const company = Array.isArray(profile?.company)
    ? profile.company[0]
    : profile?.company;

  let planName = "";

  if (company?.plan_id !== null && company?.plan_id !== undefined) {
    const { data: plan, error: planError } = await supabase
      .from("subscription_plan")
      .select("name")
      .eq("id", company.plan_id)
      .maybeSingle();

    console.log("🔍 [DEBUG] 7. Subscription Plan Query Result:", plan);
    console.log("🔍 [DEBUG] 8. Subscription Plan Query Error:", planError);

    if (planError) {
      throw planError;
    }

    planName = plan?.name ?? "";
  }

  return {
    userId: supabaseUser.id,
    token: session.access_token,
    email: supabaseUser.email ?? "",
    fullName: profile.full_name ?? "",
    companyName: company?.name ?? "",
    planName,
    role: (profile.role as "ceo" | "staff") ?? "staff",
    companyId: profile.company_id ?? "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Listen to all authentication events (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Handle Sign Out or missing session
      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Handle Sign In / Initial Session / Token Refresh
      try {
        const appUser = await mapSessionToUser(session);
        if (mounted) {
          setUser(appUser);
        }
      } catch (error) {
        console.error("Auth mapping error:", error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.session) {
        throw error || new Error("No session returned from Supabase.");
      }

      // Note: `onAuthStateChange` handles mapping and setting the `user` state.
      return true;
    } catch (error) {
      console.error("Login error:", friendlyAuthError(error));
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    companyName: string,
    plan: string | number,
  ): Promise<RegisterResult> => {
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email,
          password,
          companyName,
          fullName: name,
          subscriptionPlan: plan,
        },
      });

      if (error) {
        throw error;
      }

      // Log the user in after registration
      const loginSucceeded = await login(email, password);

      if (!loginSucceeded) {
        return {
          success: true,
          uid: data?.user?.id ?? "",
          error: "Account created, but automatic login failed",
        };
      }

      return {
        success: true,
        uid: data?.user?.id ?? "",
      };
    } catch (error) {
      console.error("Registration error:", error);

      return {
        success: false,
        error: friendlyAuthError(error),
      };
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      // Note: `onAuthStateChange` catches "SIGNED_OUT" and resets `user` to null and `loading` to false.
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

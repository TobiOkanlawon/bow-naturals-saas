import { AuthApiError } from "@supabase/supabase-js";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function friendlyAuthError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Something went wrong. Please try again.";
  }

  // Handle Supabase-specific auth errors
  if (error instanceof AuthApiError) {
    switch (error.message) {
      case "Invalid login credentials":
        return "Invalid email or password.";

      case "Email not confirmed":
        return "Please verify your email address before logging in.";

      case "User already registered":
        return "That email is already registered. Try logging in instead.";

      case "Password should be at least 6 characters.":
      case "Password should be at least 6 characters":
        return "Password should be at least 6 characters.";

      case "Signup is disabled":
        return "New account registration is currently disabled.";

      default:
        return error.message || "Something went wrong. Please try again.";
    }
  }

  // Network issues
  if (
    error.message.includes("fetch") ||
    error.message.includes("network") ||
    error.message.includes("Failed to fetch")
  ) {
    return "Unable to connect. Check your internet connection and try again.";
  }

  return "Something went wrong. Please try again.";
}

export async function mapSupabaseUser(
  supabaseUser: SupabaseUser,
): Promise<User> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", supabaseUser.id)
    .single();

  if (error) throw error;

  return {
    id: supabaseUser.id,
    name: profile.name ?? "",
    email: supabaseUser.email ?? "",
    role: (profile.role as "ceo" | "staff") ?? "staff",
  };
}

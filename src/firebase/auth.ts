import { User } from "@/context/AuthContext";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  getIdTokenResult,
  type User as FirebaseUser,
  type AuthError,
} from "firebase/auth";

export async function mapFirebaseUser(
  firebaseUser: FirebaseUser,
): Promise<User> {
  const token = await getIdTokenResult(firebaseUser);
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName ?? "",
    email: firebaseUser.email ?? "",
    role: (token.claims.role as "ceo" | "staff") ?? "staff",
  };
}

export async function friendlyAuthError(error: unknown): Promise<string> {
  const code = (error as AuthError)?.code ?? "";
  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already registered. Try logging in instead.";
    case "auth/invalid-email":
      return "That email address looks invalid.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

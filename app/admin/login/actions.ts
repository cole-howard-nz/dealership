"use server";

import { signIn } from "../../lib/auth";
import { AuthError } from "next-auth";

interface ActionState {
  error: string | null;
}

export async function signInAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "An error occurred. Please try again." };
      }
    }
    // signIn redirects on success which throws a NEXT_REDIRECT "error"
    throw error;
  }
}

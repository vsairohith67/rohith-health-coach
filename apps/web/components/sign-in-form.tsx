"use client";

import { useActionState } from "react";
import { requestSignInLink, type SignInState } from "../app/sign-in/actions";

const initialState: SignInState = { message: "" };

export function SignInForm() {
  const [state, action, pending] = useActionState(
    requestSignInLink,
    initialState,
  );

  return (
    <form action={action}>
      <label htmlFor="email">Email address</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        maxLength={254}
        required
      />
      <button type="submit" disabled={pending}>
        {pending ? "Requesting link…" : "Send secure sign-in link"}
      </button>
      <p className="auth-message" aria-live="polite">
        {state.message}
      </p>
    </form>
  );
}

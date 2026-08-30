export const PRIVATE_SIGN_IN_RESPONSE =
  "If this email is authorized, a sign-in link will be sent.";

export type PasswordlessClient = {
  auth: {
    signInWithOtp(input: {
      email: string;
      options: {
        shouldCreateUser: false;
        emailRedirectTo: string;
      };
    }): Promise<unknown>;
  };
};

export async function requestPrivateSignInLink(
  client: PasswordlessClient,
  email: string,
  emailRedirectTo: string,
): Promise<string> {
  try {
    await client.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo,
      },
    });
  } catch {
    // Auth errors are intentionally not reflected to the caller because doing
    // so would disclose whether a private identity exists.
  }
  return PRIVATE_SIGN_IN_RESPONSE;
}

import Link from "next/link";
import { SignInForm } from "../../components/sign-in-form";
import { isDemoMode } from "../../lib/runtime-mode";

export default async function SignInPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ status?: string }> }>) {
  const { status } = await searchParams;
  const demoMode = isDemoMode();
  return (
    <main className="auth-page">
      <section>
        <span className="brand auth-brand">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>
            Rohith
            <br />
            Health Coach
          </span>
        </span>
        <h1>Private access</h1>
        <p>
          Health information is never rendered before an authenticated session.
          Public sign-up is disabled by default.
        </p>
        {status === "invalid" ? (
          <p className="auth-message" role="alert">
            Sign-in could not be completed. Request a new link.
          </p>
        ) : null}
        <SignInForm />
        {demoMode ? <Link href="/today">Open isolated Demo Mode</Link> : null}
        <small>Informational health analytics · not medical advice</small>
      </section>
    </main>
  );
}

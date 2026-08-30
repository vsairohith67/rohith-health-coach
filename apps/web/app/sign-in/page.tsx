import Link from "next/link";

export default function SignInPage() {
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
        <form>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <button type="submit">Send secure sign-in link</button>
        </form>
        <Link href="/today">Open isolated Demo Mode</Link>
        <small>Informational health analytics · not medical advice</small>
      </section>
    </main>
  );
}

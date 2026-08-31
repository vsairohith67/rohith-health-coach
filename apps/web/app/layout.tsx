import type { Metadata, Viewport } from "next";
import "./styles.css";
import { ServiceWorkerRegistration } from "../components/service-worker-registration";

export const metadata: Metadata = {
  title: {
    default: "Rohith Health Coach",
    template: "%s · Rohith Health Coach",
  },
  description:
    "Private, deterministic personal health analytics with source freshness and evidence.",
  applicationName: "Rohith Health Coach",
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  icons: [{ rel: "icon", url: "/icon.svg", type: "image/svg+xml" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6ef" },
    { media: "(prefers-color-scheme: dark)", color: "#101a20" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}

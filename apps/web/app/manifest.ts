import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rohith Health Coach",
    short_name: "Health Coach",
    description: "Private deterministic health analytics.",
    start_url: "/today",
    scope: "/",
    display: "standalone",
    background_color: "#f8f6ef",
    theme_color: "#0c6765",
    orientation: "any",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

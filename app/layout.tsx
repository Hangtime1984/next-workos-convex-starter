import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import "./globals.css";
import { RootProviders } from "@/components/providers";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Next WorkOS Convex Starter",
    template: "%s | Next WorkOS Convex Starter",
  },
  description:
    "Enterprise SaaS starter for Next.js, Vercel, Convex, shadcn/ui, and WorkOS AuthKit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${plexMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AuthKitProvider>
          <RootProviders>{children}</RootProviders>
        </AuthKitProvider>
      </body>
    </html>
  );
}

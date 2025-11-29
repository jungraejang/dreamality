import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "@/components/auth/user-nav";
import { NavTabs } from "@/components/nav-tabs";
import { EightBitProvider } from "@/components/eight-bit-provider";
import { EightBitToggle } from "@/components/eight-bit-toggle";

export const metadata: Metadata = {
  title: "Dreamality - AI Image Generation",
  description: "Generate stunning images with AI",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body>
        <EightBitProvider>
          <header className="border-b bg-background">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Link href="/">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#f95738] to-[#009dff] bg-clip-text text-transparent hover:opacity-80 transition-opacity cursor-pointer eight-bit-title">
                  Dreamality
                </h1>
              </Link>
              <div className="flex items-center gap-2">
                <EightBitToggle />
                <UserNav user={user} />
              </div>
            </div>
          </header>
          {user && (
            <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
              <div className="container mx-auto px-4 py-2 flex justify-center">
                <NavTabs />
              </div>
            </nav>
          )}
          <main className="bg-background min-h-screen">{children}</main>
        </EightBitProvider>
      </body>
    </html>
  );
}

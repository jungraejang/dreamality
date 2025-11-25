import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "@/components/auth/user-nav";

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
    <html lang="en">
      <body>
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Dreamality</h1>
            <UserNav user={user} />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

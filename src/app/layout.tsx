import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "BeATUS Console",
  description: "Internal CRM & operations app for SIA BeATUS",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-muted/30">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

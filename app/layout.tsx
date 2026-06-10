import type { Metadata } from "next";
import "./globals.css"; // rename index.css → globals.css
import { Providers } from "@/app/Providers";

export const metadata: Metadata = { title: "Your App" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

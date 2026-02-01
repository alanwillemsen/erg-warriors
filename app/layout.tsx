import type { Metadata } from "next";
import { Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { APP_NAME } from "@/lib/config";

// Clean, modern font: Barlow Condensed
const barlowCondensed = Barlow_Condensed({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Cambridge Rowing Club Grand Standings - Track and compare rowing meters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${barlowCondensed.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

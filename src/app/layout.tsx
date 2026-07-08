import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The LUX Hotel",
  description: "Cinematic 5-Star Hotel Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning={true}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-background text-foreground`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var theme=localStorage.getItem('theme');var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var nextTheme=theme==='light'||theme==='dark'?theme:(prefersDark?'dark':'light');document.documentElement.classList.toggle('dark', nextTheme==='dark');document.documentElement.style.colorScheme=nextTheme;}catch(e){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}})();`}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

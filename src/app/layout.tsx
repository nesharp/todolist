import type { Metadata } from "next";
import { Onest, JetBrains_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { getSavedThemePreference } from "@/lib/preferences";
import { APP_THEMES } from "@/lib/theme-presets";

import "./globals.css";

const onest = Onest({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "My Task Manager — Stylish Todo List",
  description: "A convenient tool for managing daily tasks with theme customization.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const savedTheme = await getSavedThemePreference();

  return (
    <html
      lang="en"
      className={`${onest.variable} ${jetBrainsMono.variable} h-full antialiased`}
      data-theme={savedTheme}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme={savedTheme}
          themes={[...APP_THEMES]}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

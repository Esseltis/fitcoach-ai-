import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitCoach AI – Wybierz trenera, osiągaj cele",
  description:
    "Znajdź trenera, wykup współpracę i korzystaj z planów treningowych, diety i czatu w jednym panelu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased">{children}</body>
    </html>
  );
}


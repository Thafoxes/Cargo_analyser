import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skyload Analyzer | Cargo Space Intelligence",
  description: "Advanced cargo weight analysis and optimization for air freight operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="cyber-grid scanlines min-h-screen">
        {children}
      </body>
    </html>
  );
}


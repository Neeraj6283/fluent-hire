import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voxa AI",
  description:
    "An AI-powered SaaS platform for creating, conducting, and evaluating voice-based interviews.",
  openGraph: {
    title: "Voxa AI",
    description: "An AI-powered SaaS platform for creating, conducting, and evaluating voice-based interviews.",
    type: "website",
    images: [
      {
        url: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/878b063d-7017-4492-bab6-352266dbea72/id-preview-ffdddf95--d91d4547-8e2d-4c19-8e83-b0f5fe979215.lovable.app-1778238687222.png",
      },
    ],
  },
  twitter: {
    card: "summary",
    site: "@Lovable",
    title: "Voxa AI",
    description: "An AI-powered SaaS platform for creating, conducting, and evaluating voice-based interviews.",
    images: ["https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/878b063d-7017-4492-bab6-352266dbea72/id-preview-ffdddf95--d91d4547-8e2d-4c19-8e83-b0f5fe979215.lovable.app-1778238687222.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster duration={2500} closeButton />
      </body>
    </html>
  );
}

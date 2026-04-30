import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "RE-ERP | Real Estate Management",
  description: "Real Estate ERP System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "DM Sans, sans-serif",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Awnash Admin",
  description: "Login to Awnash admin dashboard",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  );
} 
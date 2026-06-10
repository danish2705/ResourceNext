"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/useAuth";
import LoginPage from "@/pages/Login";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace("/"); // ← goes to Dashboard
  }, [isAuthenticated, router]);

  return <LoginPage />;
}

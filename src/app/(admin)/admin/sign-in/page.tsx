import { AdminLoginForm } from "@/features/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị | Roamly",
};

export default function AdminSignInPage() {
  return <AdminLoginForm />;
}

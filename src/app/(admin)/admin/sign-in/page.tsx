import { AdminLoginForm } from "@/features/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị | Roamly",
};

export default function AdminSignInPage() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <AdminLoginForm />
    </>
  );
}

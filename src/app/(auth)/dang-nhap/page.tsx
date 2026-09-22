import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập | Roamly",
  description:
    "Đăng nhập tài khoản Roamly để quản lý hành trình, đặt phòng và dịch vụ du lịch của bạn.",
};

export default function DangNhapPage() {
  return <LoginForm />;
}

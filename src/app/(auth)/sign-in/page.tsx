import { LoginForm } from "@/features/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | Roamly",
  description:
    "Đăng nhập tài khoản Roamly để quản lý hành trình, đặt phòng và dịch vụ du lịch của bạn.",
};

export default function SignInPage() {
  return <LoginForm />;
}

import { RegisterForm } from "@/features/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tạo tài khoản mới | Roamly",
  description:
    "Đăng ký tài khoản Roamly để trải nghiệm tour, đặt phòng và dịch vụ du lịch tiện lợi.",
};

export default function SignUpPage() {
  return <RegisterForm />;
}

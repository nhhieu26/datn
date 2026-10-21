import { ChatPageContent } from "@/features/customer/chat";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roamly AI — Roamly",
  description:
    "Trò chuyện với Roamly AI để được gợi ý lịch trình, điểm đến và kinh nghiệm du lịch.",
};

export default function ChatPage() {
  return <ChatPageContent />;
}

import { ProfileForm } from "@/features/provider/profiles";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roamly - Chỉnh sửa Hồ sơ Doanh nghiệp | Kênh Đối tác",
};

const baliExplorerImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC20YTWUMhivL0mOdAZfvMp-6L3_ujqUcDTzjC57u7gIzEQFsnZEJnJfmUE06yEoTLoLwyuAilEo5r-QDL2uH7_X0zwIRxdhC8Ngi_ZoyCxWemtPDguumW03QeWvoR0uepp4l0Spyp5KfL1GJ2Lnk6mTasDuWb4DvTMyv0LPrbepWUDgMUvV83vHmuVr-RU0PhWWAkf4DEac9u7w8B7Aj48-E1NKKfQkstyScqt6HGTlHDj0iw7zCPB";

// ponytail: mock edit data, wire to API when profile endpoints exist
const initialValues = {
  businessName: "Bali Explorer Co.",
  businessType: "tour" as const,
  taxCode: "0123456789",
  address: "Jl. Raya Ubud No.88, Ubud, Gianyar, Bali, Indonesia",
  description:
    "Bali Explorer Co. là đơn vị lữ hành địa phương có trụ sở tại Ubud, Bali, chuyên cung cấp các trải nghiệm du lịch bền vững và đậm chất bản địa. Chúng tôi mang đến hành trình văn hoá độc đáo, khám phá thiên nhiên và tour sinh thái được dẫn dắt bởi hướng dẫn viên giàu kinh nghiệm.",
  legalDocUrl: "https://drive.google.com/file/d/abc123xyz",
  websiteUrl: "https://baliexplorer.co",
  logo: baliExplorerImage,
};

const rejection = {
  reason:
    "Mã số thuế chưa trùng khớp với giấy phép đăng ký kinh doanh được đính kèm. Vui lòng kiểm tra lại hình ảnh giấy tờ pháp lý hoặc cập nhật đúng MST doanh nghiệp trước khi gửi lại thẩm định.",
  timestamp: "14:32 • 28/10/2024",
};

export default function EditProfilePage() {
  return (
    <main className="flex-1 overflow-y-auto px-8 py-7">
      <ProfileForm
        availableBusinessTypes={["tour", "hotel", "restaurant"]}
        initialValues={initialValues}
        mode="edit"
        rejection={rejection}
      />
    </main>
  );
}

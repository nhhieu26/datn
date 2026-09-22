import { z } from "zod";

export const businessTypeSchema = z.enum(["tour", "hotel", "restaurant"]);

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || z.string().url().safeParse(value).success, {
    message: "Đường dẫn không hợp lệ",
  });

export const createProviderProfileSchema = z.object({
  businessName: z.string().trim().min(1, "Vui lòng nhập tên doanh nghiệp"),
  businessType: businessTypeSchema,
  taxCode: z.string().trim().min(1, "Vui lòng nhập mã số thuế"),
  address: z.string().trim().min(1, "Vui lòng nhập địa chỉ"),
  description: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mô tả")
    .max(1000, "Mô tả tối đa 1000 ký tự"),
  licenseUrl: optionalUrlSchema,
  website: optionalUrlSchema,
});

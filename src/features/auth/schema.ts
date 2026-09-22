import { z } from "zod";
import { createUserSchema } from "@/entities/user";

export const registerFormSchema = createUserSchema
  .extend({
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirm_password"],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import type {
  Role,
  BusinessType,
  ApprovalStatus,
  Prisma,
} from "../src/generated/prisma/client";

type ProfileSeed = {
  businessName: string;
  businessType: BusinessType;
  taxCode?: string;
  licenseUrl?: string;
  website?: string;
  address?: string;
  description?: string;
  photoUrl?: string;
  approvalStatus?: ApprovalStatus;
};

type UserSeed = {
  email: string;
  phone: string;
  fullname: string;
  role: Role;
  onboardingCompleted?: boolean;
  preferences?: Prisma.InputJsonValue;
  profiles?: ProfileSeed[];
};

const PASSWORD = "Password123";

const USERS: UserSeed[] = [
  {
    email: "customer1@example.com",
    phone: "0900000101",
    fullname: "Nguyễn Văn Khách",
    role: "customer",
    onboardingCompleted: true,
    preferences: { tags: ["Biển", "Nghỉ dưỡng"], provinces: ["Đà Nẵng"] },
  },
  {
    email: "customer2@example.com",
    phone: "0900000102",
    fullname: "Trần Thị Khách",
    role: "customer",
    preferences: { tags: ["Núi", "Phượt"] },
  },
  {
    email: "provider1@example.com",
    phone: "0900000111",
    fullname: "Lê Văn Tour",
    role: "provider",
    profiles: [
      {
        businessName: "Tour Biển Xanh",
        businessType: "tour",
        taxCode: "0100000011",
        address: "12 Trần Phú, Đà Nẵng",
        description: "Tour biển đảo Đà Nẵng - Hội An.",
        approvalStatus: "approved",
      },
      {
        businessName: "Khách sạn Biển Xanh",
        businessType: "hotel",
        address: "34 Võ Nguyên Giáp, Đà Nẵng",
        approvalStatus: "pending",
      },
    ],
  },
  {
    email: "provider2@example.com",
    phone: "0900000112",
    fullname: "Phạm Thị Ẩm Thực",
    role: "provider",
    profiles: [
      {
        businessName: "Nhà hàng Hương Việt",
        businessType: "restaurant",
        address: "56 Nguyễn Huệ, Huế",
        description: "Đặc sản miền Trung.",
        approvalStatus: "approved",
      },
      {
        businessName: "Tour Cố Đô",
        businessType: "tour",
        address: "78 Lê Lợi, Huế",
        approvalStatus: "pending",
      },
      {
        businessName: "Homestay Cố Đô",
        businessType: "hotel",
        address: "90 Bến Nghé, Huế",
        approvalStatus: "rejected",
      },
    ],
  },
  {
    email: "provider3@example.com",
    phone: "0900000113",
    fullname: "Hoàng Văn Nghỉ Dưỡng",
    role: "provider",
    profiles: [
      {
        businessName: "Resort Núi Rừng",
        businessType: "hotel",
        address: "1 Đồi Thông, Đà Lạt",
        description: "Nghỉ dưỡng giữa rừng thông.",
        approvalStatus: "approved",
      },
    ],
  },
];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const phone = process.env.ADMIN_PHONE;

  if (!email || !password || !phone) {
    console.log(
      "⚠ Bỏ qua tạo tài khoản quản trị (thiếu ADMIN_EMAIL/ADMIN_PASSWORD/ADMIN_PHONE trong .env)."
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      phone,
      fullname: "Quản trị viên",
      role: "admin",
      password: passwordHash,
      onboardingCompleted: true,
    },
    update: {
      phone,
      role: "admin",
      password: passwordHash,
      onboardingCompleted: true,
    },
  });

  console.log(`✓ Quản trị viên <${email}> (admin)`);
}

export async function seedUsers() {
  await seedAdmin();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        phone: u.phone,
        fullname: u.fullname,
        role: u.role,
        password: passwordHash,
        onboardingCompleted: u.onboardingCompleted ?? false,
        preferences: u.preferences ?? {},
      },
      update: {
        phone: u.phone,
        fullname: u.fullname,
        role: u.role,
        password: passwordHash,
        onboardingCompleted: u.onboardingCompleted ?? false,
        preferences: u.preferences ?? {},
      },
    });

    for (const p of u.profiles ?? []) {
      await prisma.providerProfile.upsert({
        where: {
          userId_businessType: {
            userId: user.id,
            businessType: p.businessType,
          },
        },
        create: {
          userId: user.id,
          businessName: p.businessName,
          businessType: p.businessType,
          taxCode: p.taxCode,
          licenseUrl: p.licenseUrl,
          website: p.website,
          address: p.address,
          description: p.description,
          photoUrl: p.photoUrl,
          approvalStatus: p.approvalStatus ?? "not_submitted",
        },
        update: {
          businessName: p.businessName,
          taxCode: p.taxCode,
          licenseUrl: p.licenseUrl,
          website: p.website,
          address: p.address,
          description: p.description,
          photoUrl: p.photoUrl,
          approvalStatus: p.approvalStatus ?? "not_submitted",
        },
      });
    }

    console.log(
      `✓ ${u.fullname} <${u.email}> (${u.role}, ${u.profiles?.length ?? 0} profile)`
    );
  }

  const profileCount = USERS.reduce(
    (n, u) => n + (u.profiles?.length ?? 0),
    0
  );
  console.log(`\nSeeded ${USERS.length} users and ${profileCount} profiles.`);
}

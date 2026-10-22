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
  paypalPayerId: string;
  payoutEmail: string;
  paypalLinkedAt: Date | string;
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
    email: "messi@roamly.com",
    phone: "0900000101",
    fullname: "Lionel Messi",
    role: "customer",
    onboardingCompleted: true,
    preferences: { tags: ["Biển", "Nghỉ dưỡng"], provinces: ["Hải Phòng"] },
  },
  {
    email: "ronaldo@roamly.com",
    phone: "0900000102",
    fullname: "Cristiano Ronaldo",
    role: "customer",
    preferences: {
      tags: ["Thiên nhiên", "Phượt"],
      provinces: ["Ninh Bình"],
    },
  },
  {
    email: "neymar@roamly.com",
    phone: "0900000111",
    fullname: "Neymar Jr.",
    role: "provider",
    profiles: [
      {
        businessName: "Tour Biển Đảo Hải Phòng",
        businessType: "tour",
        taxCode: "0100000011",
        address: "12 Lạch Tray, Ngô Quyền, Hải Phòng",
        description: "Tour biển đảo Cát Bà - Lan Hạ, Hải Phòng.",
        approvalStatus: "approved",
        paypalPayerId: "2VRLAHRXJ7FK6",
        payoutEmail: "neymar@roamly.com",
        paypalLinkedAt: "2026-10-05 12:13:44.18",
      },
      {
        businessName: "Khách sạn Cát Bà",
        businessType: "hotel",
        address: "34 Hà Sen, Cát Bà, Hải Phòng",
        approvalStatus: "pending",
        paypalPayerId: "2VRLAHRXJ7FK6",
        payoutEmail: "neymar@roamly.com",
        paypalLinkedAt: "2026-10-05 12:13:44.18",
      },
    ],
  },
  {
    email: "debruyne@roamly.com",
    phone: "0900000112",
    fullname: "Kevin De Bruyne",
    role: "provider",
    profiles: [
      {
        businessName: "Nhà hàng Hương Quê Ninh Bình",
        businessType: "restaurant",
        address: "56 Trần Hưng Đạo, Ninh Bình",
        description: "Đặc sản dê núi và cơm cháy Ninh Bình.",
        approvalStatus: "approved",
        paypalPayerId: "H2XD7V5XQKFA2",
        payoutEmail: "debruyne@roamly.com",
        paypalLinkedAt: "2026-10-05 12:13:44.18",
      },
      {
        businessName: "Tour Cố Đô Hoa Lư",
        businessType: "tour",
        address: "78 Hoa Lư, Ninh Bình",
        approvalStatus: "pending",
        paypalPayerId: "H2XD7V5XQKFA2",
        payoutEmail: "debruyne@roamly.com",
        paypalLinkedAt: "2026-10-05 12:13:44.18",
      },
      {
        businessName: "Homestay Tam Cốc",
        businessType: "hotel",
        address: "90 Tam Cốc, Hoa Lư, Ninh Bình",
        approvalStatus: "rejected",
        paypalPayerId: "H2XD7V5XQKFA2",
        payoutEmail: "debruyne@roamly.com",
        paypalLinkedAt: "2026-10-05 12:13:44.18",
      },
    ],
  },
  {
    email: "haaland@roamly.com",
    phone: "0900000113",
    fullname: "Erling Haaland",
    role: "provider",
    profiles: [
      {
        businessName: "Resort Tràng An Xanh",
        businessType: "hotel",
        address: "1 Trường Yên, Hoa Lư, Ninh Bình",
        description: "Nghỉ dưỡng giữa núi đá vôi và đồng lúa Ninh Bình.",
        approvalStatus: "approved",
        paypalPayerId: "W9X69Z7QL46YJ",
        payoutEmail: "haaland@roamly.com",
        paypalLinkedAt: "2026-10-05 12:13:44.18",
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
      "⚠ Bỏ qua tạo tài khoản quản trị (thiếu ADMIN_EMAIL/ADMIN_PASSWORD/ADMIN_PHONE trong .env).",
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
          paypalPayerId: p.paypalPayerId,
          payoutEmail: p.payoutEmail,
          paypalLinkedAt: new Date(p.paypalLinkedAt),
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
          paypalPayerId: p.paypalPayerId,
          payoutEmail: p.payoutEmail,
          paypalLinkedAt: new Date(p.paypalLinkedAt),
        },
      });
    }

    console.log(
      `✓ ${u.fullname} <${u.email}> (${u.role}, ${u.profiles?.length ?? 0} profile)`,
    );
  }

  const profileCount = USERS.reduce((n, u) => n + (u.profiles?.length ?? 0), 0);
  console.log(`\nSeeded ${USERS.length} users and ${profileCount} profiles.`);
}

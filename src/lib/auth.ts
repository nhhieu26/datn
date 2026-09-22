import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/entities/user";
import { findByEmail } from "@/entities/user/repo";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password, role } = parsed.data;

        const user = await findByEmail(email);
        if (!user) return null;
        if (user.status !== "active") return null;
        if (user.role !== role) return null;

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.fullname,
          role: user.role,
          status: user.status,
          onboardingCompleted: user.onboardingCompleted,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.onboardingCompleted = user.onboardingCompleted;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.status = token.status as string;
      session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      return session;
    },
  },
});

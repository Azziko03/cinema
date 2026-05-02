import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import type { User as PrismaUser } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email и пароль обязательны");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Неверный email или пароль");
        }

        // ЗАПРЕТ ВХОДА ДЛЯ АДМИНОВ ЧЕРЕЗ ОБЫЧНУЮ ФОРМУ
        if (user.role === "admin") {
          throw new Error("Доступ запрещен");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Неверный email или пароль");
        }

        if (user.status !== "active") {
          throw new Error("Аккаунт заблокирован");
        }

        // Проверка верификации email
        if (!user.emailVerified) {
          throw new Error("Email не подтвержден. Проверьте почту.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          image: user.image,
        };
      },
    }),
    // Отдельный provider для админов с 2FA через Telegram
    Credentials({
      id: "admin-credentials",
      name: "admin-credentials",
      credentials: {
        userId: { label: "User ID", type: "text" },
        verified: { label: "Verified", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.userId || credentials?.verified !== "true") {
          throw new Error("Неверные данные авторизации");
        }

        const user = await prisma.user.findUnique({
          where: { id: credentials.userId as string },
        });

        if (!user || user.role !== "admin") {
          throw new Error("Пользователь не найден или не является администратором");
        }

        if (user.status !== "active") {
          throw new Error("Аккаунт заблокирован");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (existingUser) {
            // Обновляем Google ID и аватар если их нет
            if (!existingUser.googleId) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  googleId: account.providerAccountId,
                  image: user.image,
                },
              });
            }
            // Добавляем данные пользователя в объект user для JWT
            user.id = existingUser.id;
            (user as any).role = existingUser.role;
          } else {
            // Создаем нового пользователя
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                fullName: user.name || "Пользователь",
                googleId: account.providerAccountId,
                image: user.image,
                role: "user",
                status: "active",
                emailVerified: true, // Google OAuth автоматически верифицирует email
              },
            });
            // Добавляем данные нового пользователя
            user.id = newUser.id;
            (user as any).role = newUser.role;
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // При первом входе добавляем данные пользователя в токен
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin" | "controller";
      }
      return session;
    },
  },
});

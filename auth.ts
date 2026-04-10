import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "username", type: "text" },
        password: { label: "password", type: "password" },
        loginType: { label: "loginType", type: "text" }, // "student" | "teacher"
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null

        const loginType = String(credentials.loginType ?? "")
        const identifier = String(credentials.identifier)
        const password = String(credentials.password)

        const user = await prisma.user.findUnique({
          where: { username: identifier },
        })

        if (!user) return null

        const isStudentLogin = loginType === "student"
        const roleAllowedForType = isStudentLogin
          ? user.role === "STUDENT"
          : user.role === "TEACHER" || user.role === "STAFF" || user.role === "ADMIN"

        if (!roleAllowedForType) return null

        const passwordMatch = await bcrypt.compare(password, user.passwordHash)
        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          username: user.username,
          role: user.role,
          image: user.avatar,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.username = (user as any).username
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
})


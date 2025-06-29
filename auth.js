import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { login } from "@lib/actions/user.prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt", // Using JWT sessions
  },
  pages: {
    signIn: "/login",
    signUp: "/sign-up",
  },
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    // Credentials Provider for email/password login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const user = await login(credentials);
          if (!user) {
            return null;
          }
          return user;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google sign-in
      if (account?.provider === "google") {
        try {
          // Check if user exists in your database
          // If not, create a new user with Google profile data
          // You'll need to implement this logic based on your database structure

          // Example:
          // const existingUser = await getUserByEmail(user.email)
          // if (!existingUser) {
          //   await createUserFromGoogle({
          //     email: user.email,
          //     name: user.name,
          //     image: user.image,
          //     googleId: account.providerAccountId
          //   })
          // }

          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }

      // Handle credentials sign-in
      if (account?.provider === "credentials") {
        return user ? true : false;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Handle initial sign in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.username = user.username;
        token.email = user.email;
        token.image = user.image || user.picture;
        token.kingdom = user.kingdom;
        token.bio = user.bio;
        token.about = user.about;
        token.department = user.department;
        token.level = user.level;
        token.gender = user.gender;

        // Store provider info
        if (account) {
          token.provider = account.provider;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
        session.user.username = token.username;
        session.user.kingdom = token.kingdom;
        session.user.about = token.about;
        session.user.bio = token.bio;
        session.user.department = token.department;
        session.user.level = token.level;
        session.user.gender = token.gender;
        session.user.provider = token.provider;
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      // Log successful sign-ins
      console.log(`User ${user.email} signed in with ${account.provider}`);
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.AUTH_SECRET,
});

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  login,
  getUserByEmail,
  createUserFromGoogle,
  getUserById,
} from "@lib/actions/user-actions";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signUp: "/sign-up",
  },
  providers: [
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
      if (account?.provider === "google") {
        try {
          console.log("Google sign-in initiated");
          const existingUser = await getUserByEmail(user.email);

          if (!existingUser) {
            console.log("User doesnt exist at the db");
            // Create new user from Google profile
            const newUser = await createUserFromGoogle({
              email: user.email,
              name: user.name,
              picture: user.image,

              googleId: account.providerAccountId,
            });

            if (newUser) {
              console.log("New User created  at the db");
              // Set user data for JWT
              user.id = newUser.id.toString();
              user.username = newUser.username;
              user.needsOnboarding = true;
              user.bio = newUser.bio;
              user.department = null;
              user.gender = newUser.gender;
            }
          } else {
            console.log("User already exist at the db");
            // User exists, set their data
            user.id = existingUser.id;
            user.name = existingUser.name;
            user.email = existingUser.email;
            user.image = existingUser.picture;
            user.username = existingUser.username;
            user.about = existingUser.about;
            user.department = existingUser.department?.name;
            user.level = existingUser.level?.name;
            user.gender = existingUser.gender;
            user.needsOnboarding = existingUser.needsOnboarding;
          }

          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }

      if (account?.provider === "credentials") {
        return user ? true : false;
      }

      return true;
    },

    // Handle JWT token creation & update
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session?.user) {
        // This runs when client calls update() with session data
        // Update token fields from the updated session user
        token.username = session.user.username;
        token.about = session.user.about;
        token.department = session.user.department;
        token.gender = session.user.gender;
        token.needsOnboarding = session.user.needsOnboarding;
        // Add other fields you want to sync here
      } else if (user) {
        // Initial sign-in: populate token from user object
        token.id = user.id;
        token.name = user.name;
        token.username = user.username;
        token.email = user.email;
        token.image = user.image || user.picture;
        token.about = user.about;
        token.department = user.department;
        token.gender = user.gender;
        token.needsOnboarding = user.needsOnboarding;

        if (account) {
          token.provider = account.provider;
        }
      }

      // console.log("token", token);
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
        session.user.username = token.username;
        session.user.about = token.about;
        session.user.department = token.department;
        session.user.gender = token.gender;
        session.user.provider = token.provider;
        session.user.needsOnboarding = token.needsOnboarding;
      }

      console.log("Session data:", session);
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log(`User ${user.email} signed in with ${account?.provider}`);
    },
  },
  // debug: process.env.NODE_ENV === "development",
  secret: process.env.AUTH_SECRET,
});

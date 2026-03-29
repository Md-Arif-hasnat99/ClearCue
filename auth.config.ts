import type { NextAuthConfig } from "next-auth";

const invalidateSessionOnRestart =
  process.env.NODE_ENV !== "production" &&
  process.env.AUTH_INVALIDATE_ON_RESTART !== "false";

const authProcessGlobal = globalThis as typeof globalThis & {
  __clearCueAuthBootTimeSeconds__?: number;
};

const serverBootTimeSeconds =
  authProcessGlobal.__clearCueAuthBootTimeSeconds__ ??
  Math.floor(Date.now() / 1000);

if (!authProcessGlobal.__clearCueAuthBootTimeSeconds__) {
  authProcessGlobal.__clearCueAuthBootTimeSeconds__ = serverBootTimeSeconds;
}

const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      if (invalidateSessionOnRestart && !user) {
        const tokenIssuedAt = typeof token.iat === "number" ? token.iat : 0;

        if (tokenIssuedAt > 0 && tokenIssuedAt < serverBootTimeSeconds) {
          return {};
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (
        session.user &&
        typeof token.id === "string" &&
        typeof token.email === "string"
      ) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

export default authConfig;

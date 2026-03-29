"use client";

import { SessionProvider } from "next-auth/react";

type SessionProviderClientProps = {
  children: React.ReactNode;
};

export default function SessionProviderClient({ children }: SessionProviderClientProps) {
  return <SessionProvider>{children}</SessionProvider>;
}

"use client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  basePath: "/api/auth",   // সবসময় যে origin-এ পেজ আছে, ঠিক সেই origin
});
export const { signIn, signOut, useSession } = authClient;
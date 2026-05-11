import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "https://zholy.app",
  plugins: [
    twoFactorClient(),
    organizationClient(),
  ],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  useActiveOrganization,
  useListOrganizations,
} = authClient;

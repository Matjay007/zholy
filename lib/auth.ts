import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins/two-factor";
import { organization } from "better-auth/plugins/organization";

import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  baseURL: process.env.BETTER_AUTH_URL ?? "https://zholy.app",
  secret: process.env.BETTER_AUTH_SECRET!,

  // ── Email + Password ─────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your ZHOLY password",
        html: `<p>Click <a href="${url}">here</a> to reset your password. Expires in 1 hour.</p>`,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your ZHOLY email",
        html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
      });
    },
  },

  // ── Social Providers ─────────────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    apple: {
      clientId:     process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
  },

  // ── Plugins ──────────────────────────────────────────────────────────────
  plugins: [
    twoFactor({
      issuer: "ZHOLY",
      otpOptions: { period: 30, digits: 6 },
    }),
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 3,
      membershipLimit: 100,
      sendInvitationEmail: async (data) => {
        const inviteUrl = `${process.env.BETTER_AUTH_URL}/accept-invite/${data.id}`;
        await sendEmail({
          to: data.email,
          subject: `You're invited to join ${data.organization.name} on ZHOLY`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
              <h2 style="color:#1C1D22">You've been invited to ZHOLY</h2>
              <p>${data.inviter.user.name ?? data.inviter.user.email} invited you to join
                 <strong>${data.organization.name}</strong> on ZHOLY.</p>
              <p>
                <a href="${inviteUrl}"
                   style="display:inline-block;background:#4CE9E9;color:#1C1D22;padding:12px 28px;
                          border-radius:6px;text-decoration:none;font-weight:700;font-size:15px;">
                  Accept Invitation
                </a>
              </p>
              <p style="color:#999;font-size:12px;">This invite expires in 48 hours.</p>
            </div>
          `,
        });
      },
    }),
  ],
});

// ── Email helper ─────────────────────────────────────────────────────────────
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "noreply@zholy.app",
    to,
    subject,
    html,
  });
}

export type Session = typeof auth.$Infer.Session;

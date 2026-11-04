import { z } from "zod";

export const CONTACT_MIN_SUBMIT_MS = 1500;

/**
 * Shared client/server schema. `company` is a hidden honeypot and `startedAt`
 * provides a lightweight time-based bot check. Server-side validation always runs.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address.")
    .max(160, "Email must be 160 characters or fewer."),
  subject: z
    .string()
    .trim()
    .min(3, "Please enter a subject.")
    .max(120, "Subject must be 120 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(20, "Message must be at least 20 characters.")
    .max(3000, "Message must be 3000 characters or fewer."),
  company: z.string().max(0, "Submission rejected.").optional(),
  startedAt: z.string().regex(/^\d+$/, "Invalid form session."),
});

export type ContactInput = z.infer<typeof contactSchema>;

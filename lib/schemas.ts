import { z } from "zod";

const validHttpUrl = z
  .string()
  .trim()
  .url("Enter a valid URL.")
  .refine((value) => /^https?:\/\//i.test(value), "URL must start with http:// or https://.");

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export const submissionSchema = z.object({
  projectName: z.string().trim().min(2, "Project name must be at least 2 characters."),
  repoUrl: validHttpUrl,
  liveLink: z
    .string()
    .trim()
    .refine((value) => !value || /^https?:\/\/.+\..+/i.test(value), {
      message: "Enter a valid live application URL.",
    }),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(2000, "Description must be 2,000 characters or fewer."),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type SubmissionValues = z.infer<typeof submissionSchema>;

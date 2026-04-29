import { z } from "zod";

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
});


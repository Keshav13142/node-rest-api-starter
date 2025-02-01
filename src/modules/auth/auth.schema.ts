import { userRole } from "@/db/schema";
import { z } from "zod";

export const createUserSchema = {
  body: {
    email: z
      .string()
      .email()
      .transform((email) => email.toLowerCase()),
    password: z.string().min(8),
    fullName: z.string().nonempty("Name cannot be empty"),
    role: z.enum(userRole, { message: "Ivalid user role" }).optional(),
    phone: z
      .string()
      .min(10, "Invalid phone number")
      .max(10, "Phone number exceeds 10 characters"),
  },
};

export const loginUserSchema = {
  body: {
    email: z
      .string()
      .email()
      .transform((email) => email.toLowerCase()),
    password: z.string().min(8),
  },
};

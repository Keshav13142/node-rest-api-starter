import { users } from "@/db/schema";
import { errorResponses } from "@/utils/http";
import { createSelectSchema } from "drizzle-zod";

export const getCurrentUserSchema = {
  tags: ["users"],
  response: {
    200: createSelectSchema(users).omit({
      password: true,
    }),
    ...errorResponses,
  },
} as const;

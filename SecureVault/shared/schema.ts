import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const passwords = pgTable("passwords", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  username: text("username").notNull(),
  encryptedPassword: text("encrypted_password").notNull(),
  category: text("category").notNull(),
  url: text("url"),
  notes: text("notes"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Custom URL validation
const urlSchema = z.string().refine(
  (value) => {
    if (!value) return true; // Allow empty values
    // Add https:// if no protocol is specified
    const urlWithProtocol = value.match(/^https?:\/\//) ? value : `https://${value}`;
    try {
      new URL(urlWithProtocol);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Please enter a valid website address (e.g., 'example.com' or 'https://example.com')" }
);

// Base password schema without encryption
const basePasswordSchema = createInsertSchema(passwords)
  .omit({ id: true, userId: true, encryptedPassword: true })
  .extend({
    password: z.string().min(1, "Password is required"),
    url: urlSchema.optional(),
    notes: z.string().optional(),
  });

// Schema for creating a new password (includes both password and encrypted version)
export const insertPasswordSchema = basePasswordSchema;

// Schema for storing in database (uses encrypted password)
export const storePasswordSchema = basePasswordSchema
  .omit({ password: true })
  .extend({
    encryptedPassword: z.string(),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Password = typeof passwords.$inferSelect;
export type InsertPassword = z.infer<typeof insertPasswordSchema>;
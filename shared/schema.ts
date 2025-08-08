import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  status: text("status").notNull().default("draft"), // "draft" | "published"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  readingTime: text("reading_time"), // e.g. "5 min read"
  views: varchar("views").default("0"),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
}).extend({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required").max(500, "Excerpt too long"),
  status: z.enum(["draft", "published"]),
  readingTime: z.string().optional(),
});

export const updateBlogPostSchema = insertBlogPostSchema.partial();

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type UpdateBlogPost = z.infer<typeof updateBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;



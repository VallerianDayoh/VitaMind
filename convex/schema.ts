// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  logs: defineTable({
    userId: v.string(),
    type: v.string(),
    value: v.string(),
    note: v.optional(v.string()),
    timestamp: v.number(), // Kita gunakan timestamp saja agar simpel
  }),
  messages: defineTable({
    text: v.string(),
    isUser: v.boolean(),
  }),
});
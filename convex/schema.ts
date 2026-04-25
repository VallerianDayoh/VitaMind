import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── User profiles ──────────────────────────────────────
  users: defineTable({
    name: v.string(),
    email: v.string(),
    major: v.optional(v.string()),
    semester: v.optional(v.number()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // ── Check-in data ─────────────────────────────────────
  moodLogs: defineTable({
    userId: v.id("users"),
    mood: v.union(
      v.literal("rad"),
      v.literal("good"),
      v.literal("meh"),
      v.literal("bad"),
      v.literal("awful")
    ),
    note: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  sleepLogs: defineTable({
    userId: v.id("users"),
    durationInHours: v.number(),
    quality: v.union(
      v.literal("excellent"),
      v.literal("good"),
      v.literal("fair"),
      v.literal("poor")
    ),
    bedTime: v.optional(v.string()),
    wakeTime: v.optional(v.string()),
    date: v.string(),
  }).index("by_user", ["userId"]),

  stressLogs: defineTable({
    userId: v.id("users"),
    level: v.number(),
    hasDeadline: v.boolean(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  activityLogs: defineTable({
    userId: v.id("users"),
    activity: v.string(),
    durationMinutes: v.number(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  // ── Chat ──────────────────────────────────────────────
  chatMessages: defineTable({
    userId: v.id("users"),
    text: v.string(),
    sender: v.union(v.literal("user"), v.literal("vita")),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  // ── Legacy tables (kept for backward compat) ──────────
  logs: defineTable({
    userId: v.string(),
    type: v.string(),
    value: v.string(),
    note: v.optional(v.string()),
    timestamp: v.number(),
  }),
  messages: defineTable({
    text: v.string(),
    isUser: v.boolean(),
  }),
});
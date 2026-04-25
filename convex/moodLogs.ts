import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const add = mutation({
  args: {
    userId: v.id("users"),
    mood: v.union(
      v.literal("rad"),
      v.literal("good"),
      v.literal("meh"),
      v.literal("bad"),
      v.literal("awful")
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("moodLogs", {
      userId: args.userId,
      mood: args.mood,
      note: args.note,
      timestamp: Date.now(),
    });
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moodLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getToday = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startTs = startOfDay.getTime();

    const logs = await ctx.db
      .query("moodLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return logs.find((l) => l.timestamp >= startTs) ?? null;
  },
});

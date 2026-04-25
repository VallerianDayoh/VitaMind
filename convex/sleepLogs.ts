import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const add = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sleepLogs", {
      userId: args.userId,
      durationInHours: args.durationInHours,
      quality: args.quality,
      bedTime: args.bedTime,
      wakeTime: args.wakeTime,
      date: args.date,
    });
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sleepLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

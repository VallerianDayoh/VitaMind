import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const add = mutation({
  args: {
    userId: v.id("users"),
    level: v.number(),
    hasDeadline: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stressLogs", {
      userId: args.userId,
      level: args.level,
      hasDeadline: args.hasDeadline,
      timestamp: Date.now(),
    });
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stressLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

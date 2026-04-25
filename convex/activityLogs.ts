import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const add = mutation({
  args: {
    userId: v.id("users"),
    activity: v.string(),
    durationMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activityLogs", {
      userId: args.userId,
      activity: args.activity,
      durationMinutes: args.durationMinutes,
      timestamp: Date.now(),
    });
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// convex/logs.ts
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const addLog = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    value: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Pastikan field di sini sama persis dengan yang ada di schema.ts
    const newLogId = await ctx.db.insert("logs", {
      userId: args.userId,
      type: args.type,
      value: args.value,
      note: args.note,
      timestamp: Date.now(),
    });
    return newLogId;
  },
});
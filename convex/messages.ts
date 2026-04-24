// convex/messages.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Fungsi untuk menyimpan pesan ke database
export const send = mutation({
  args: { text: v.string(), isUser: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", { 
        text: args.text, 
        isUser: args.isUser 
    });
  },
});

// Fungsi untuk mengambil riwayat pesan (urut berdasarkan waktu)
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("asc").collect();
  },
});
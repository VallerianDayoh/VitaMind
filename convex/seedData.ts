import { mutation } from "./_generated/server";

export const seedMockData = mutation({
  args: { },
  handler: async (ctx) => {
    // We will generate 7 mock logs for the last 7 days
    const today = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    
    // Arrays to cycle through for mock data
    const sleepDurations = [5, 6.5, 7.5, 8, 4, 7, 8.5];
    const sleepQualities = ["poor", "fair", "good", "excellent", "poor", "good", "excellent"] as const;
    const stressLevels = [12, 10, 6, 4, 14, 5, 3];
    const stressNotes = ["Ujian besok", "Banyak pr", "", "", "Tenggat waktu project", "", ""]

    const allUsers = await ctx.db.query("users").collect();

    for (const user of allUsers) {
      for (let i = 0; i < 7; i++) {
        const pastTime = today - (6 - i) * DAY_MS; // 6 days ago -> today
        const pastDate = new Date(pastTime);
        const pastDateString = pastDate.toISOString().split('T')[0];

        // Seed sleep
        await ctx.db.insert("sleepLogs", {
          userId: user._id,
          durationInHours: sleepDurations[i],
          quality: sleepQualities[i],
          date: pastDateString,
          bedTime: "22:00",
          wakeTime: "06:00",
        });

        // Seed stress
        await ctx.db.insert("stressLogs", {
          userId: user._id,
          level: stressLevels[i],
          hasDeadline: stressLevels[i] > 10, // dummy logic
          timestamp: pastTime,
        });
      }
    }
  },
});

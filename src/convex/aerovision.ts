import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const activeCCTVs = await ctx.db
      .query("cctvs")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    
    const inactiveCCTVs = await ctx.db
      .query("cctvs")
      .withIndex("by_status", (q) => q.eq("status", "inactive"))
      .collect();

    const emptyClassrooms = await ctx.db
      .query("classrooms")
      .filter((q) => q.eq(q.field("isEmpty"), true))
      .collect();

    const examModeSetting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "examMode"))
      .unique();

    return {
      activeCCTVCount: activeCCTVs.length,
      inactiveCCTVCount: inactiveCCTVs.length,
      inactiveCCTVList: inactiveCCTVs.map(c => c.name),
      emptyClassroomCount: emptyClassrooms.length,
      examMode: examModeSetting?.value ?? false,
    };
  },
});

export const toggleExamMode = mutation({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "examMode"))
      .unique();

    if (setting) {
      await ctx.db.patch(setting._id, { value: !setting.value });
    } else {
      await ctx.db.insert("settings", { key: "examMode", value: true });
    }
  },
});

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    const activeCount = await ctx.db
      .query("cctvs")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    const inactiveCount = await ctx.db
      .query("cctvs")
      .withIndex("by_status", (q) => q.eq("status", "inactive"))
      .collect();

    // If counts match what we want, don't do anything (prevents loops)
    if (activeCount.length === 124 && inactiveCount.length === 7) return;

    // Otherwise, clear and re-seed CCTVs
    const allCCTVs = await ctx.db.query("cctvs").collect();
    for (const cctv of allCCTVs) {
      await ctx.db.delete(cctv._id);
    }

    // Seed 124 Active
    for (let i = 1; i <= 124; i++) {
      await ctx.db.insert("cctvs", { name: `Cam ${i}`, status: "active", location: `Location ${i}` });
    }

    // Seed 7 Inactive
    for (let i = 1; i <= 7; i++) {
      await ctx.db.insert("cctvs", { name: `Broken Cam ${i}`, status: "inactive", location: `Broken Loc ${i}` });
    }

    // Ensure Classrooms (basic check)
    const existingClassrooms = await ctx.db.query("classrooms").take(1);
    if (existingClassrooms.length === 0) {
       await ctx.db.insert("classrooms", { name: "CS-101", year: 1, isEmpty: true });
       await ctx.db.insert("classrooms", { name: "CS-102", year: 1, isEmpty: false });
       await ctx.db.insert("classrooms", { name: "CS-201", year: 2, isEmpty: true });
       await ctx.db.insert("classrooms", { name: "CS-301", year: 3, isEmpty: false });
       await ctx.db.insert("classrooms", { name: "CS-401", year: 4, isEmpty: true });
    }

    // Ensure Exam Mode is initialized
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "examMode"))
      .unique();
    
    if (!setting) {
      await ctx.db.insert("settings", { key: "examMode", value: false });
    }
  },
});

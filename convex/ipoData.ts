import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const ipoRecordValidator = v.object({
  sourceId: v.string(),
  category: v.union(
    v.literal("mainboard"),
    v.literal("sme"),
    v.literal("all")
  ),
  name: v.string(),
  url: v.string(),
  gmp: v.string(),
  trend: v.string(),
  rating: v.string(),
  sub: v.string(),
  price: v.string(),
  ipoSize: v.string(),
  lot: v.string(),
  open: v.string(),
  close: v.string(),
  boaDate: v.string(),
  listing: v.string(),
  updatedOn: v.string(),
  anchor: v.string(),
  priceBand: v.string(),
  estimatedListing: v.string(),
  listingGain: v.string(),
  ipoDate: v.string(),
  status: v.string(),
  lastUpdated: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  isActive: v.boolean(),
});

export const query = queryGeneric;

export const getIpoData = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("ipoData").order("desc").collect();
    return rows.map((row) => ({
      ...row,
      id: row.sourceId,
      _id: undefined,
    }));
  },
});

export const mutation = mutationGeneric;

export const replaceSnapshot = mutation({
  args: {
    items: v.array(ipoRecordValidator),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("ipoData").collect();

    await Promise.all(existing.map((row) => ctx.db.delete(row._id)));

    for (const item of args.items) {
      await ctx.db.insert("ipoData", {
        ...item,
      });
    }

    return {
      count: args.items.length,
      updatedAt: Date.now(),
    };
  },
});

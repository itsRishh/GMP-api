import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ipoData: defineTable({
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
  })
    .index("by_sourceId", ["sourceId"])
    .index("by_category", ["category"])
    .index("by_updatedAt", ["updatedAt"]),
});

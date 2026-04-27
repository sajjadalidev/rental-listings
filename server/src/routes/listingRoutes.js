import express from "express";
import { z } from "zod";
import { Listing } from "../models/Listing.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listingRouter = express.Router();

const listingSchema = z.object({
  title: z.string().min(3),
  location: z.object({
    address: z.string().optional(),
    city: z.string().min(2),
    neighborhood: z.string().optional()
  }),
  rent: z.number().nonnegative(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().nonnegative().optional(),
  availableFrom: z.coerce.date(),
  status: z.enum(["Draft", "Review", "Published"]).optional(),
  summary: z.string().min(10),
  description: z.string().min(20),
  gallery: z.array(z.object({ url: z.string().url(), alt: z.string().optional() })).optional(),
  amenities: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
  availabilityTimeline: z.array(z.object({ label: z.string(), date: z.coerce.date(), note: z.string().optional() })).optional(),
  inventory: z.array(z.object({ item: z.string(), condition: z.string() })).optional()
});

listingRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { location, minBudget, maxBudget, moveInDate, includeDrafts } = req.query;
    const query = {};

    if (includeDrafts !== "true") query.status = "Published";
    if (location) query.$text = { $search: location };
    if (minBudget || maxBudget) {
      query.rent = {};
      if (minBudget) query.rent.$gte = Number(minBudget);
      if (maxBudget) query.rent.$lte = Number(maxBudget);
    }
    if (moveInDate) query.availableFrom = { $lte: new Date(moveInDate) };

    const listings = await Listing.find(query).sort({ createdAt: -1 });
    res.json({ listings });
  })
);

listingRouter.get(
  "/admin",
  authenticate,
  authorize("admin"),
  asyncHandler(async (_req, res) => {
    const listings = await Listing.find().sort({ updatedAt: -1 });
    res.json({ listings });
  })
);

listingRouter.post(
  "/",
  authenticate,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const payload = listingSchema.parse(req.body);
    const listing = await Listing.create({ ...payload, createdBy: req.user._id });
    res.status(201).json({ listing });
  })
);

listingRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json({ listing });
  })
);

listingRouter.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const { status } = z.object({ status: z.enum(["Draft", "Review", "Published"]) }).parse(req.body);
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json({ listing });
  })
);

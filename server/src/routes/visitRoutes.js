import express from "express";
import { z } from "zod";
import { Visit } from "../models/Visit.js";
import { Listing } from "../models/Listing.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const visitRouter = express.Router();

visitRouter.use(authenticate);

visitRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = req.user.role === "admin" ? {} : { tenant: req.user._id };
    const visits = await Visit.find(query).populate("listing").populate("tenant", "name email").sort({ updatedAt: -1 });
    res.json({ visits });
  })
);

visitRouter.post(
  "/",
  authorize("tenant"),
  asyncHandler(async (req, res) => {
    const { listingId, preferredDate, notes } = z
      .object({ listingId: z.string(), preferredDate: z.coerce.date(), notes: z.string().optional() })
      .parse(req.body);
    const listing = await Listing.findOne({ _id: listingId, status: "Published" });
    if (!listing) return res.status(404).json({ message: "Published listing not found" });

    const visit = await Visit.create({ listing: listingId, tenant: req.user._id, preferredDate, notes });
    res.status(201).json({ visit });
  })
);

visitRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const schema = req.user.role === "admin"
      ? z.object({ status: z.enum(["Requested", "Scheduled", "Visited", "Decision"]).optional(), scheduledAt: z.coerce.date().optional(), notes: z.string().optional() })
      : z.object({ decision: z.enum(["Pending", "Interested", "Declined", "Applied"]), notes: z.string().optional() });
    const payload = schema.parse(req.body);
    const query = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, tenant: req.user._id };
    const visit = await Visit.findOneAndUpdate(query, payload, { new: true }).populate("listing");
    if (!visit) return res.status(404).json({ message: "Visit not found" });
    res.json({ visit });
  })
);

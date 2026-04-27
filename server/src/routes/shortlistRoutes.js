import express from "express";
import { Shortlist } from "../models/Shortlist.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const shortlistRouter = express.Router();

shortlistRouter.use(authenticate, authorize("tenant"));

shortlistRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await Shortlist.find({ tenant: req.user._id }).populate("listing").sort({ createdAt: -1 });
    res.json({ items });
  })
);

shortlistRouter.post(
  "/:listingId",
  asyncHandler(async (req, res) => {
    const item = await Shortlist.findOneAndUpdate(
      { tenant: req.user._id, listing: req.params.listingId },
      { tenant: req.user._id, listing: req.params.listingId },
      { new: true, upsert: true }
    ).populate("listing");
    res.status(201).json({ item });
  })
);

shortlistRouter.delete(
  "/:listingId",
  asyncHandler(async (req, res) => {
    await Shortlist.deleteOne({ tenant: req.user._id, listing: req.params.listingId });
    res.status(204).end();
  })
);

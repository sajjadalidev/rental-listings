import express from "express";
import { z } from "zod";
import { ExtensionRequest } from "../models/ExtensionRequest.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const extensionRouter = express.Router();
extensionRouter.use(authenticate);

extensionRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = req.user.role === "admin" ? {} : { tenant: req.user._id };
    const requests = await ExtensionRequest.find(query).populate("listing").populate("tenant", "name email").sort({ updatedAt: -1 });
    res.json({ requests });
  })
);

extensionRouter.post(
  "/",
  authorize("tenant"),
  asyncHandler(async (req, res) => {
    const payload = z.object({ listingId: z.string(), requestedUntil: z.coerce.date(), reason: z.string().min(5) }).parse(req.body);
    const request = await ExtensionRequest.create({
      tenant: req.user._id,
      listing: payload.listingId,
      requestedUntil: payload.requestedUntil,
      reason: payload.reason
    });
    res.status(201).json({ request });
  })
);

extensionRouter.patch(
  "/:id",
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const payload = z.object({ status: z.enum(["Requested", "Approved", "Rejected"]), adminNote: z.string().optional() }).parse(req.body);
    const request = await ExtensionRequest.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!request) return res.status(404).json({ message: "Extension request not found" });
    res.json({ request });
  })
);

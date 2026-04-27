import express from "express";
import multer from "multer";
import { z } from "zod";
import { MoveIn } from "../models/MoveIn.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const upload = multer({ dest: "uploads/" });
export const moveInRouter = express.Router();

moveInRouter.use(authenticate);

moveInRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = req.user.role === "admin" ? {} : { tenant: req.user._id };
    const moveIns = await MoveIn.find(query).populate("listing").populate("tenant", "name email").sort({ updatedAt: -1 });
    res.json({ moveIns });
  })
);

moveInRouter.post(
  "/",
  authorize("tenant"),
  asyncHandler(async (req, res) => {
    const { listingId, moveInDate } = z.object({ listingId: z.string(), moveInDate: z.coerce.date() }).parse(req.body);
    const moveIn = await MoveIn.create({
      tenant: req.user._id,
      listing: listingId,
      moveInDate,
      status: "In Progress",
      checklist: [
        { item: "Upload identity and employment documents" },
        { item: "Confirm rental agreement" },
        { item: "Review and accept inventory list" }
      ]
    });
    res.status(201).json({ moveIn });
  })
);

moveInRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const payload = z
      .object({
        agreementConfirmed: z.boolean().optional(),
        inventoryAccepted: z.boolean().optional(),
        status: z.enum(["Not Started", "In Progress", "Ready", "Moved In"]).optional(),
        checklist: z.array(z.object({ item: z.string(), completed: z.boolean() })).optional()
      })
      .parse(req.body);
    const query = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, tenant: req.user._id };
    const moveIn = await MoveIn.findOneAndUpdate(query, payload, { new: true }).populate("listing");
    if (!moveIn) return res.status(404).json({ message: "Move-in workflow not found" });
    res.json({ moveIn });
  })
);

moveInRouter.post(
  "/:id/documents",
  authorize("tenant"),
  upload.single("document"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Document file is required" });
    const moveIn = await MoveIn.findOneAndUpdate(
      { _id: req.params.id, tenant: req.user._id },
      { $push: { documents: { label: req.body.label || "Document", filename: req.file.filename, uploadedAt: new Date() } } },
      { new: true }
    );
    if (!moveIn) return res.status(404).json({ message: "Move-in workflow not found" });
    res.json({ moveIn });
  })
);

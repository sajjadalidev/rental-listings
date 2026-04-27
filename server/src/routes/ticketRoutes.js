import express from "express";
import { z } from "zod";
import { Ticket } from "../models/Ticket.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const ticketRouter = express.Router();
ticketRouter.use(authenticate);

ticketRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = req.user.role === "admin" ? {} : { tenant: req.user._id };
    const tickets = await Ticket.find(query)
      .populate("tenant", "name email")
      .populate("listing", "title location")
      .populate("messages.sender", "name role")
      .sort({ updatedAt: -1 });
    res.json({ tickets });
  })
);

ticketRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = z
      .object({
        subject: z.string().min(3),
        category: z.enum(["Visit", "Move-in", "Maintenance", "Billing", "Other"]).optional(),
        priority: z.enum(["Low", "Medium", "High"]).optional(),
        listingId: z.string().optional(),
        message: z.string().min(3)
      })
      .parse(req.body);
    const ticket = await Ticket.create({
      tenant: req.user._id,
      listing: payload.listingId,
      subject: payload.subject,
      category: payload.category,
      priority: payload.priority,
      messages: [{ sender: req.user._id, body: payload.message }]
    });
    res.status(201).json({ ticket });
  })
);

ticketRouter.post(
  "/:id/messages",
  asyncHandler(async (req, res) => {
    const { body, status } = z
      .object({ body: z.string().min(1), status: z.enum(["Open", "Waiting on Tenant", "Waiting on Ops", "Resolved"]).optional() })
      .parse(req.body);
    const query = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, tenant: req.user._id };
    const ticket = await Ticket.findOneAndUpdate(
      query,
      { $push: { messages: { sender: req.user._id, body } }, ...(status ? { status } : {}) },
      { new: true }
    ).populate("messages.sender", "name role");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json({ ticket });
  })
);

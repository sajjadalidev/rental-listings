import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const ticketSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
    subject: { type: String, required: true },
    category: { type: String, enum: ["Visit", "Move-in", "Maintenance", "Billing", "Other"], default: "Other" },
    status: { type: String, enum: ["Open", "Waiting on Tenant", "Waiting on Ops", "Resolved"], default: "Open" },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    messages: [messageSchema]
  },
  { timestamps: true }
);

export const Ticket = mongoose.model("Ticket", ticketSchema);

import mongoose from "mongoose";

const extensionRequestSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    requestedUntil: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["Requested", "Approved", "Rejected"], default: "Requested" },
    adminNote: String
  },
  { timestamps: true }
);

export const ExtensionRequest = mongoose.model("ExtensionRequest", extensionRequestSchema);

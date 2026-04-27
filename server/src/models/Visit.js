import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    preferredDate: { type: Date, required: true },
    scheduledAt: Date,
    status: {
      type: String,
      enum: ["Requested", "Scheduled", "Visited", "Decision"],
      default: "Requested",
      index: true
    },
    decision: { type: String, enum: ["Pending", "Interested", "Declined", "Applied"], default: "Pending" },
    notes: String
  },
  { timestamps: true }
);

export const Visit = mongoose.model("Visit", visitSchema);

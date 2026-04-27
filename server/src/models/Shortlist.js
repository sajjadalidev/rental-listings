import mongoose from "mongoose";

const shortlistSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true }
  },
  { timestamps: true }
);

shortlistSchema.index({ tenant: 1, listing: 1 }, { unique: true });

export const Shortlist = mongoose.model("Shortlist", shortlistSchema);

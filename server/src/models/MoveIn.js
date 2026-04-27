import mongoose from "mongoose";

const moveInSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    moveInDate: { type: Date, required: true },
    status: { type: String, enum: ["Not Started", "In Progress", "Ready", "Moved In"], default: "Not Started" },
    documents: [
      {
        label: String,
        filename: String,
        uploadedAt: Date,
        verified: { type: Boolean, default: false }
      }
    ],
    agreementConfirmed: { type: Boolean, default: false },
    inventoryAccepted: { type: Boolean, default: false },
    checklist: [
      {
        item: String,
        completed: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

export const MoveIn = mongoose.model("MoveIn", moveInSchema);

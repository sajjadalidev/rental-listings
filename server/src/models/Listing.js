import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "Rental property image" }
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: {
      address: String,
      city: { type: String, required: true, index: true },
      neighborhood: String
    },
    rent: { type: Number, required: true, min: 0, index: true },
    bedrooms: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    availableFrom: { type: Date, required: true, index: true },
    status: { type: String, enum: ["Draft", "Review", "Published"], default: "Draft", index: true },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    gallery: [imageSchema],
    amenities: [{ type: String }],
    rules: [{ type: String }],
    availabilityTimeline: [
      {
        label: String,
        date: Date,
        note: String
      }
    ],
    inventory: [
      {
        item: String,
        condition: String
      }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

listingSchema.index({
  title: "text",
  "location.city": "text",
  "location.neighborhood": "text",
  summary: "text"
});

export const Listing = mongoose.model("Listing", listingSchema);

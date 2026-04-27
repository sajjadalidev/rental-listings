import "dotenv/config";
import { connectDb } from "./config/db.js";
import { User } from "./models/User.js";
import { Listing } from "./models/Listing.js";
import { Visit } from "./models/Visit.js";
import { Shortlist } from "./models/Shortlist.js";
import { MoveIn } from "./models/MoveIn.js";
import { Ticket } from "./models/Ticket.js";
import { ExtensionRequest } from "./models/ExtensionRequest.js";

await connectDb(process.env.MONGO_URI);

await Promise.all([
  User.deleteMany({}),
  Listing.deleteMany({}),
  Visit.deleteMany({}),
  Shortlist.deleteMany({}),
  MoveIn.deleteMany({}),
  Ticket.deleteMany({}),
  ExtensionRequest.deleteMany({})
]);

const [tenant, admin] = await User.create([
  { name: "Ayesha Tenant", email: "tenant@example.com", password: "password123", role: "tenant" },
  { name: "Omar Admin", email: "admin@example.com", password: "password123", role: "admin" }
]);

const images = [
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
];

const listings = await Listing.create([
  {
    title: "Sunny 2-bed apartment near transit",
    location: { address: "12 Park View Road", city: "Lahore", neighborhood: "Gulberg" },
    rent: 145000,
    bedrooms: 2,
    bathrooms: 2,
    availableFrom: new Date("2026-05-05"),
    status: "Published",
    summary: "Bright apartment with secure parking, elevator access, and fast commute routes.",
    description: "A practical apartment for professionals who need predictable access, a calm building, and move-in support.",
    gallery: images.map((url, index) => ({ url, alt: `Apartment gallery ${index + 1}` })),
    amenities: ["Elevator", "Secure parking", "Backup power", "Fiber internet"],
    rules: ["No smoking indoors", "Pets by approval", "Quiet hours after 10 PM"],
    availabilityTimeline: [
      { label: "Viewing slots open", date: new Date("2026-04-28"), note: "Evening and weekend visits available" },
      { label: "Earliest move-in", date: new Date("2026-05-05"), note: "Cleaning completed before handover" }
    ],
    inventory: [
      { item: "Air conditioners", condition: "Working" },
      { item: "Kitchen appliances", condition: "New" }
    ],
    createdBy: admin._id
  },
  {
    title: "Compact studio with furnished setup",
    location: { address: "44 Canal Lane", city: "Karachi", neighborhood: "Clifton" },
    rent: 90000,
    bedrooms: 1,
    bathrooms: 1,
    availableFrom: new Date("2026-05-15"),
    status: "Published",
    summary: "Furnished studio ideal for a single tenant needing a quick, organized move.",
    description: "A managed studio with a simple agreement process, responsive support, and clear house rules.",
    gallery: images.slice().reverse().map((url, index) => ({ url, alt: `Studio gallery ${index + 1}` })),
    amenities: ["Furnished", "Security", "Laundry access", "Water backup"],
    rules: ["Single occupancy", "No structural changes", "Guests registered at reception"],
    availabilityTimeline: [
      { label: "Tenant checkout", date: new Date("2026-05-08"), note: "Inspection follows checkout" },
      { label: "Earliest move-in", date: new Date("2026-05-15"), note: "Ready after maintenance" }
    ],
    inventory: [
      { item: "Bed frame", condition: "Good" },
      { item: "Study table", condition: "Good" }
    ],
    createdBy: admin._id
  },
  {
    title: "Family townhouse in review",
    location: { address: "7 Garden Street", city: "Islamabad", neighborhood: "F-11" },
    rent: 230000,
    bedrooms: 3,
    bathrooms: 3,
    availableFrom: new Date("2026-06-01"),
    status: "Review",
    summary: "Spacious townhouse awaiting admin publication approval.",
    description: "A larger home suited for families, with outdoor space and staged inventory verification.",
    gallery: images.map((url, index) => ({ url, alt: `Townhouse gallery ${index + 1}` })),
    amenities: ["Garden", "Two parking spots", "Storage", "Community security"],
    rules: ["No commercial use", "Pets by approval"],
    createdBy: admin._id
  }
]);

await Shortlist.create({ tenant: tenant._id, listing: listings[0]._id });
await Visit.create({ tenant: tenant._id, listing: listings[0]._id, preferredDate: new Date("2026-04-30"), scheduledAt: new Date("2026-04-30T16:00:00"), status: "Scheduled" });
await MoveIn.create({
  tenant: tenant._id,
  listing: listings[0]._id,
  moveInDate: new Date("2026-05-05"),
  status: "In Progress",
  agreementConfirmed: false,
  inventoryAccepted: false,
  checklist: [
    { item: "Upload identity and employment documents", completed: true },
    { item: "Confirm rental agreement", completed: false },
    { item: "Review and accept inventory list", completed: false }
  ]
});
await Ticket.create({
  tenant: tenant._id,
  listing: listings[0]._id,
  subject: "Need clarification on parking access",
  category: "Move-in",
  status: "Waiting on Ops",
  messages: [{ sender: tenant._id, body: "Can I get two access cards for parking before move-in day?" }]
});
await ExtensionRequest.create({
  tenant: tenant._id,
  listing: listings[0]._id,
  requestedUntil: new Date("2026-08-05"),
  reason: "I may need one additional quarter because my office relocation is delayed."
});

console.log("Seed complete");
process.exit(0);

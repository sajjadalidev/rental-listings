import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { ZodError } from "zod";
import { connectDb } from "./config/db.js";
import { authRouter } from "./routes/authRoutes.js";
import { listingRouter } from "./routes/listingRoutes.js";
import { visitRouter } from "./routes/visitRoutes.js";
import { shortlistRouter } from "./routes/shortlistRoutes.js";
import { moveInRouter } from "./routes/moveInRoutes.js";
import { ticketRouter } from "./routes/ticketRoutes.js";
import { extensionRouter } from "./routes/extensionRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/listings", listingRouter);
app.use("/api/visits", visitRouter);
app.use("/api/shortlist", shortlistRouter);
app.use("/api/move-ins", moveInRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/extensions", extensionRouter);

app.use((err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: "Validation failed", issues: err.flatten() });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

await connectDb(process.env.MONGO_URI);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));

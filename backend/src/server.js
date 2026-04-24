import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "desktop-analytics-backend" });
});

app.use("/api", uploadRoutes);
app.use("/api", dashboardRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error", details: err.message });
});

const PORT = process.env.PORT || 4100;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));

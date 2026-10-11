require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const connectDB = require("./config/db");
const Url = require("./models/Url");
const urlRoutes = require("./routes/urls");
const { apiLimiter, redirectLimiter } = require("./middleware/rateLimiter");
const { ALIAS_REGEX } = require("./utils/validate");

const app = express();
const PORT = process.env.PORT || 5000;

// Needed when running behind a proxy/host (Render, Heroku, Nginx) so rate limiting sees real IPs.
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "10kb" }));

// ---- API routes ----
app.use("/api", apiLimiter);
app.use("/api/urls", urlRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

// ---- Redirect route ----
// GET /:code -> look the code up in MongoDB, count the click, redirect.
// We ONLY redirect to URLs stored in our database (no open redirects).
app.get("/:code", redirectLimiter, async (req, res) => {
  const { code } = req.params;

  // Quick sanity check so random junk never hits the database
  if (!ALIAS_REGEX.test(code)) {
    return res.status(404).send("Short link not found.");
  }

  try {
    // Atomic find + increment in a single database operation
    const doc = await Url.findOneAndUpdate(
      { shortCode: code },
      { $inc: { clicks: 1 } },
      { new: true }
    );
    if (!doc) return res.status(404).send("Short link not found.");
    return res.redirect(302, doc.originalUrl);
  } catch (err) {
    console.error("Redirect error:", err);
    return res.status(500).send("Server error. Please try again.");
  }
});

// Unknown API routes
app.use((req, res) => res.status(404).json({ error: "Not found." }));

// Start the server only after the database is connected
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

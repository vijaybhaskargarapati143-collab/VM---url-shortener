const express = require("express");
const mongoose = require("mongoose");
const Url = require("../models/Url");
const { validateUrl, validateAlias, generateCode } = require("../utils/validate");
const { createLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Turns a database document into the JSON the frontend needs.
function toResponse(doc) {
  const base = (process.env.BASE_URL || "http://localhost:5000").replace(/\/+$/, "");
  return {
    id: doc._id,
    originalUrl: doc.originalUrl,
    shortCode: doc.shortCode,
    shortUrl: `${base}/${doc.shortCode}`,
    clicks: doc.clicks,
    createdAt: doc.createdAt,
  };
}

// POST /api/urls  -> create a short link
router.post("/", createLimiter, async (req, res) => {
  try {
    const { originalUrl, customAlias } = req.body || {};

    // 1. Validate the URL
    const urlCheck = validateUrl(originalUrl);
    if (!urlCheck.ok) return res.status(400).json({ error: urlCheck.message });

    // 2. Don't allow shortening our own short links (avoids redirect loops)
    const baseHost = new URL(process.env.BASE_URL || "http://localhost:5000").host;
    if (urlCheck.host === baseHost) {
      return res.status(400).json({ error: "You can't shorten a link that already points to this service." });
    }

    // 3. Custom alias (optional)
    if (customAlias !== undefined && customAlias !== null && String(customAlias).trim() !== "") {
      const aliasCheck = validateAlias(String(customAlias).trim());
      if (!aliasCheck.ok) return res.status(400).json({ error: aliasCheck.message });

      try {
        const doc = await Url.create({ originalUrl: urlCheck.url, shortCode: aliasCheck.alias });
        return res.status(201).json(toResponse(doc));
      } catch (err) {
        if (err.code === 11000) {
          return res.status(409).json({ error: "That custom alias is already taken. Try another one." });
        }
        throw err;
      }
    }

    // 4. Random code. If the code already exists (very rare), try again a few times.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
           const doc = await Url.create({ originalUrl: urlCheck.url, shortCode: "VBMM" + generateCode() });
        return res.status(201).json(toResponse(doc));
      } catch (err) {
        if (err.code !== 11000) throw err; // a real error, not a duplicate
      }
    }
    return res.status(500).json({ error: "Could not generate a unique code. Please try again." });
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ error: "Something went wrong on the server. Please try again." });
  }
});

// GET /api/urls  -> list links (newest first)
router.get("/", async (req, res) => {
  try {
    const docs = await Url.find().sort({ createdAt: -1 }).limit(200);
    res.json(docs.map(toResponse));
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: "Could not load your links." });
  }
});

// DELETE /api/urls/:id  -> delete a link
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid link ID." });
    }
    const deleted = await Url.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Link not found." });
    res.json({ message: "Link deleted." });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Could not delete the link." });
  }
});

module.exports = router;

const mongoose = require("mongoose");

// One document = one shortened link.
const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  // "unique: true" creates a MongoDB unique index, so two links can never share a code,
  // even if two requests arrive at the exact same moment.
  shortCode: { type: String, required: true, unique: true, index: true },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Url", urlSchema);

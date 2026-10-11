const crypto = require("crypto");

const MAX_URL_LENGTH = 2048;
const ALIAS_REGEX = /^[A-Za-z0-9_-]{3,30}$/;
// These would clash with real routes, so they cannot be used as short codes.
const RESERVED_CODES = ["api", "health", "favicon.ico"];

// Returns { ok: true, url } or { ok: false, message }.
function validateUrl(input) {
  if (typeof input !== "string" || input.trim() === "") {
    return { ok: false, message: "Please enter a URL." };
  }
  const value = input.trim();
  if (value.length > MAX_URL_LENGTH) {
    return { ok: false, message: "That URL is too long (max 2048 characters)." };
  }
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, message: "That doesn't look like a valid URL. Include http:// or https://" };
  }
  // Only http and https are allowed (blocks javascript:, data:, file:, etc.)
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, message: "Only http:// and https:// links are allowed." };
  }
  return { ok: true, url: parsed.toString(), host: parsed.host };
}

// Returns { ok: true, alias } or { ok: false, message }.
function validateAlias(alias) {
  if (!ALIAS_REGEX.test(alias)) {
    return {
      ok: false,
      message: "Custom alias must be 3-30 characters: letters, numbers, - or _ only.",
    };
  }
  if (RESERVED_CODES.includes(alias.toLowerCase())) {
    return { ok: false, message: "That alias is reserved. Please choose another." };
  }
  return { ok: true, alias };
}

// Generates a random 7-character code using letters and numbers.
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function generateCode(length = 7) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARS[crypto.randomInt(CHARS.length)];
  }
  return code;
}

module.exports = { validateUrl, validateAlias, generateCode, ALIAS_REGEX };

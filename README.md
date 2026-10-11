# Snip — URL Shortener (React + Express + MongoDB)

Paste a long URL, get a short link, and track clicks.

```
url-shortener/
├── backend/
│   ├── server.js              # Express app + redirect route (GET /:code)
│   ├── config/db.js           # MongoDB connection
│   ├── models/Url.js          # Mongoose schema
│   ├── routes/urls.js         # POST / GET / DELETE /api/urls
│   ├── middleware/rateLimiter.js
│   ├── utils/validate.js      # URL + alias validation, random code generator
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── index.html
    ├── vite.config.js         # proxies /api to the backend in development
    ├── .env.example
    ├── package.json
    └── src/
        ├── main.jsx, App.jsx, api.js, styles.css
        └── components/ UrlForm, ResultCard, CopyButton, Stats, UrlTable, Footer
```

## 1. Prerequisites

- Node.js 18 or newer (`node -v`)
- MongoDB — either local MongoDB Community Server **or** a free MongoDB Atlas cluster

## 2. Set up MongoDB

**Option A — Local:** install MongoDB Community Server and make sure it is running (default port 27017). Then your connection string is:
`mongodb://127.0.0.1:27017/url_shortener`

**Option B — Atlas (cloud):**
1. Create a free cluster at https://www.mongodb.com/atlas
2. Database Access → add a user with a password.
3. Network Access → add your IP address.
4. Connect → Drivers → copy the connection string and add `/url_shortener` before the `?`.

The database and collection are created automatically on first use.

## 3. Start the backend

```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
# open .env and set MONGODB_URI
npm run dev
```

You should see `MongoDB connected` and `Server running on http://localhost:5000`.

## 4. Start the frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## 5. Test it end to end

1. Paste `https://www.wikipedia.org` and click **Shorten URL**. A short link such as `http://localhost:5000/aB3dE9x` appears.
2. Click **Open ↗** — you are redirected to Wikipedia. The click count increases (use **Refresh clicks**).
3. Try a custom alias (`+ Add a custom alias`), e.g. `my-link`. Creating it twice shows "already taken".
4. Try `ftp://example.com` or `hello` — you get a friendly validation error.
5. Click **Copy** and paste somewhere to check it.
6. Delete a link, then open it again — you get "Short link not found."
7. API check:
   ```bash
   curl -X POST http://localhost:5000/api/urls -H "Content-Type: application/json" -d '{"originalUrl":"https://example.com"}'
   curl http://localhost:5000/api/urls
   ```

## How the main parts work

- **Short codes:** `utils/validate.js` builds a random 7-character code with Node's `crypto`. The `unique` index on `shortCode` in MongoDB guarantees no duplicates; if a rare collision happens (error 11000) the route retries.
- **Redirect:** `GET /:code` finds the code in MongoDB, adds 1 to `clicks` in the same atomic query, and redirects (302) to the stored URL. Unknown codes return 404, so the server can never redirect to something that isn't in the database.
- **Validation:** the server re-checks everything (the frontend is never trusted): only `http`/`https`, max 2048 characters, aliases 3–30 chars of letters/numbers/`-`/`_`, reserved words blocked.
- **Rate limiting:** 20 link creations per 15 min, 100 API calls per 15 min, 300 redirects per minute (per IP). Adjust in `middleware/rateLimiter.js`.
- **Secrets:** the database string lives only in `backend/.env` (git-ignored). The frontend never sees it.
- **Dev connection:** Vite proxies `/api` to `localhost:5000`, so no CORS or URLs to configure in development.

## Deploying (short notes)

- Backend: set `MONGODB_URI`, `BASE_URL` (your public backend/domain URL), and `CLIENT_ORIGIN` (your frontend URL).
- Frontend: set `VITE_API_URL` to your backend URL, then `npm run build` and host `frontend/dist`.

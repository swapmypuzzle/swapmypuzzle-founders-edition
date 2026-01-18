# SwapMyPuzzle — Founders Edition (MVP)

This is a **mobile-friendly web app** for swapping jigsaw puzzles by mail.

## Features in this MVP
- Email/password login
- Google + Apple sign-in buttons (OAuth setup required in Supabase)
- Create puzzle listings + upload photos
- Browse + filters (pieces/brand/theme/missing)
- Propose trades (“I’ll send you X if you send me Y”)
- Trade inbox + trade detail
- Tracking numbers (optional)
- Ratings: cleanliness, pieces included, puzzle-ready, ship speed
- Community board (simple threads)
- US-only enforcement (country set to US in profiles; trade checks)

## Local run
1) Install Node.js 18+
2) Copy `.env.example` to `.env.local` and fill in keys
3) Install + run:

```bash
npm install
npm run dev
```

## Supabase setup
1) Create a Supabase project
2) Run `supabase/schema.sql` in the SQL editor
3) Create a Storage bucket named `puzzle-photos` and set it to **public**
4) Add OAuth providers in **Authentication → Providers**:
   - Google
   - Apple

Redirect URLs:
- Local: `http://localhost:3000/browse`
- Production: `https://app.swapmypuzzle.com/browse`

## How to use GoDaddy with this
### Important: GoDaddy Website Builder cannot host this code
GoDaddy’s drag-and-drop Website Builder is for marketing sites. It **does not** support custom Next.js apps with databases and auth.

### Recommended setup (best of both worlds)
- `swapmypuzzle.com` → GoDaddy Website Builder (public site)
- `app.swapmypuzzle.com` → Host this app on **Vercel**

#### DNS in GoDaddy
In GoDaddy DNS:
- Add CNAME record:
  - Name: `app`
  - Value: `cname.vercel-dns.com`

Then in Vercel:
- Add domain `app.swapmypuzzle.com` to your project.

### If you insist on GoDaddy hosting for the app
You would need a **GoDaddy Web Hosting** plan where you can upload code and run Node.js.
That is a different product than Website Builder.


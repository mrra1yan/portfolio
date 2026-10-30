# Neo-Brutalism Portfolio — Raiyan Imon

A neo-brutalist portfolio for **Raiyan Imon** — WordPress & Headless React developer.
Built with React 19, Vite, Tailwind CSS v4, and lucide-react.

## Stack

- **React 19** + **Vite 8** — fast dev server and production builds
- **Tailwind CSS v4** — utility styling with the neo-brutalist design tokens in `src/index.css`
- **React Router 7** — portfolio route `/` and a custom 404 page
- **lucide-react** — icons
- **oxlint** — linting

## Getting started

```bash
npm ci
npm run dev      # start the dev server
npm run build    # production build → dist/
npm run preview  # preview the production build
npm run lint     # run oxlint
```

## Routes

| Path              | Page                                    |
| ----------------- | --------------------------------------- |
| `/`               | Portfolio home (hero, services, work…)  |
| `*`               | Custom 404 page                         |

Because the app uses `BrowserRouter`, **every path must serve `index.html`** on your
host. On Netlify add a `public/_redirects` file with `/* /index.html 200`; on Vercel
add a `vercel.json` rewrite; most static hosts support one of these out of the box.
(During local dev, Vite handles this automatically.)

## Contact form (Formspree)

The contact form submits to Formspree. To enable it:

1. Create a free form at [formspree.io](https://formspree.io).
2. Copy your endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
3. Paste it into `FORMSPREE_ENDPOINT` in **`src/config.js`**.

Until an endpoint is configured, the form shows an inline error instead of faking
success. `CONTACT_EMAIL` in the same file is the public email shown across the site —
replace it with your real address.

## Notes

- **Extras:** rainbow scroll-progress bar at the top, reveal-on-scroll section
  animations (disabled under `prefers-reduced-motion`), a live Dhaka clock chip
  in the hero, a dedicated neo-brutalist **404 page** for unknown routes, and a
  hidden **Konami code** easter egg (↑ ↑ ↓ ↓ ← → ← → B A) that fires confetti,
  a fanfare, and the sticker canvas.
- The reaction counters in the footer persist to `localStorage` and start from
  hardcoded seed values — they are per-device, not global.
- The mini-game's discount code (`RAIYAN-SPEED-VIP`) is a lead-magnet courtesy code;
  it pre-fills the contact message, it is not a validated coupon.
- Project images are hotlinked from Unsplash (see the `img` fields in `src/App.jsx`);
  swap them for self-hosted screenshots before launch if you want full control.
- `public/sitemap.xml`, `public/robots.txt`, and the metadata in `index.html` use
  `https://raiyan.dev` — update these if deploying to a different domain.

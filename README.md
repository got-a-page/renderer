![got-a.page - Everyone's got a page](https://raw.githubusercontent.com/got-a-page/.github/main/profile/assets/banner.svg)

# got-a.page renderer

The tiny Cloudflare Worker behind every instant page.

A single wildcard DNS record sends all unclaimed subdomains of got-a.page
here. The Worker looks the name up in the compiled index (a static JSON file
published by the claim repo's CI, cached at the edge) and renders a fast,
accessible page - person and product templates at launch, more in Phase 2.
Names nobody has claimed get a friendly "unclaimed" page inviting their
future owner.

## Develop

```sh
npm ci
npx wrangler dev     # local preview
npx tsc              # typecheck
```

## Deploy

Deploying touches the production worker, so it's a maintainer step:

```sh
npx wrangler deploy
```

First-time setup (the wildcard route, the discard AAAA record) is in the claim
repo at [docs/SETUP.md](https://github.com/got-a-page/claim/blob/main/docs/SETUP.md).

## Design notes

- **No framework, inline CSS.** Pages are a few KB; they render anywhere.
- **Everything is escaped.** User content is data, never markup; only
  `https://` URLs can become links or images.
- **The GitHub API is never called at request time.** The index is a static
  file, cached at the edge for 5 minutes.

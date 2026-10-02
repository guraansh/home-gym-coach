# Home Gym Coach

A personal-trainer PWA for home workouts: plans each session, logs sets, and progresses you with simple, explainable rules. See [SPEC.md](SPEC.md) for the full design.

All training data stays on the device (IndexedDB). Use Settings → Download backup to keep a copy.

## Develop

```bash
npm install
npm run dev     # local dev server
npm test        # unit tests (coach rules, equipment maths, library integrity)
npm run build   # type-check + production build
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.

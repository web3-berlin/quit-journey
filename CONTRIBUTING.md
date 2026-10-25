# Contributing to Quit Journey

Thanks for helping people quit. A few things keep the project safe for its users.

## Ground rules

- **Existing journeys must keep working.** Document-model changes are additive only: new optional fields, nullable lists and new enum values. No renames, no removed fields, no new required inputs.
- **Reducers stay pure.** No `Date.now()`, random IDs or I/O inside reducers; pass such values in the action input. Reducer coverage must stay at or above 95 % (`npm run test:coverage`).
- **Health content needs a source.** Recovery timelines, harm-reduction advice, scales and helplines must cite a reputable source (WHO, NHS, CDC, national guidelines, peer-reviewed literature). Don't add dosing advice.
- **Privacy first.** No analytics, ads, trackers or network calls with user data. New permissions need a clear reason in the PR.
- **Never edit `gen/` folders** — they are code-generated (see `CLAUDE.md`).

## Before you open a PR

```bash
npm run tsc
npm run lint
npm test
npm run i18n:check     # if you changed UI text
cd mobile && npm run typecheck   # if you changed the app
```

## Translations

English (`editors/quit-journey-editor/i18n/source`) is the source. The other catalogs in `i18n/messages/` were machine-translated; fixes from native speakers are the most valuable contribution you can make. See `editors/quit-journey-editor/i18n/README.md`.

## Licence

By contributing you agree that your contribution is licensed under the [AGPL-3.0-only](LICENSE) licence of this project.

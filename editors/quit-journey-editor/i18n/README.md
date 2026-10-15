# Quit Journey i18n

Standard ICU MessageFormat via [FormatJS `react-intl`](https://formatjs.github.io/docs/react-intl/), with numbers, dates, durations, plurals and currency from the built-in `Intl` APIs. English is the source language.

## How text gets translated

| Kind of text | How to write it | Message id |
|---|---|---|
| UI copy in components | `intl.formatMessage({ id, defaultMessage }, values)` (from `useIntl()`) or `<FormattedMessage id defaultMessage values />` | `<area>.<name>` e.g. `today.checkin.heading` |
| Enum labels (triggers, strategies, aids…) | `const L = useLabels(); L.label("trigger", key)`, `L.options("trigger")` for selects/chips | `enum.<group>.<KEY>` (generated) |
| Engine content (timelines, safety notes, programs, badges, scale names/bands, alerts) | `const { tc, tf } = useContent(); tc(cid.milestone(m.key, "title"), m.title)`; use `tf` only when the English has ICU placeholders (badge descriptions use `{unit}`) | `content.*` (generated, see `content.ts`) |
| Numbers, money, dates, durations, weekdays | `lib/format.ts` helpers (`formatNumber`, `formatMoney`, `formatDate`, `formatShortDuration`, `formatLifeMinutes`, `weekdayName`) — they follow the active locale | — |

## Rules

- **Every user-visible string goes through intl**, including `aria-label`, `title`, `placeholder`, `alt`, button text and error messages.
- **One message per sentence, never concatenate fragments.** Put variable parts in placeholders: `"{count} of {total} beaten"`. Translators must be able to reorder words.
- **Plurals use ICU**: `"{days, plural, one {# day} other {# days}}"`. Don't build plurals with `=== 1 ?`.
- **Inline markup** uses rich text: `intl.formatMessage({ id, defaultMessage: "<b>If</b> {ifText}, <b>then</b> {thenText}." }, { b: (c) => <strong>{c}</strong>, ifText, thenText })`.
- **Ids are stable and explicit**, written as string literals (so `formatjs extract` can find them). Prefix by area: `app`, `hero`, `today`, `health`, `cravings`, `craving`, `sos`, `safety`, `surf`, `toolkit.<section>`, `rewards`, `badges`, `insights`, `plan`, `checkin`, `form`, `common`, `mobile.<section>`, `notify`.
- **Don't translate**: proper names (GAMSTOP, Never Use Alone, SAMHSA…), phone numbers, URLs, validated scale items and answer options (they stay English until a validated translation is licensed).
- Keep `defaultMessage` identical to the current English wording unless it was broken English.
- No new hard-coded locale (`"en-US"`): formatting uses the active locale from `I18nProvider`.

## Adding a language

`locales.ts` lists the 50 locales. Catalogs live in `messages/<code>.ts` and are loaded lazily. `npm run i18n:extract` regenerates `source/en.json`; `tests/i18n.test.ts` checks every catalog for unknown keys, ICU syntax and matching placeholders.

<h1 align="center">korean-lunar-calendar</h1>

<p align="center">
  Convert between the <strong>Korean lunar calendar</strong> (음력) and the
  <strong>Gregorian solar calendar</strong> (양력) — entirely offline, following the
  <a href="https://astro.kasi.re.kr/">KARI</a> (Korea Astronomy and Space Science Institute) standard.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/korean-lunar-calendar"><img src="https://img.shields.io/npm/v/korean-lunar-calendar.svg" alt="npm version" /></a>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" />
  <img src="https://img.shields.io/badge/types-included-blue.svg" alt="TypeScript types included" />
  <img src="https://img.shields.io/badge/deps-zero-success.svg" alt="Zero dependencies" />
  <a href="https://usingsky.github.io/korean_lunar_calendar_js"><img src="https://img.shields.io/badge/demo-live-success.svg" alt="Live demo" /></a>
</p>

<p align="center"><strong><a href="https://usingsky.github.io/korean_lunar_calendar_js">▶ Try the live demo</a></strong> — convert dates in your browser.</p>

> The Korean and Chinese lunar calendars share the same astronomical basis but can fall on
> different dates. This library uses the Korean (KARI) standard.

## Features

- **Two-way conversion** — solar → lunar and lunar → solar, in one small class.
- **Offline** — the conversion table is bundled; no network calls, no external services.
- **GapJa (간지) strings** — get the sexagenary year/month/day in both Korean (정유년 병오월) and Chinese (丁酉年 丙午月), plus raw cheongan/ganji indices.
- **Leap-month aware** — handles intercalation months (윤달) and the 1582 Gregorian reform gap.
- **Input validation** — every setter returns a `boolean`; out-of-range, non-integer, and impossible-leap-month dates are rejected.
- **Typed & dual-format** — ships TypeScript types, ESM + CommonJS, plus a minified browser build.
- **Zero runtime dependencies.**

## Supported range

| Calendar          | From         | To           |
| ----------------- | ------------ | ------------ |
| Lunar (음력)       | `1000-01-01` | `2050-11-18` |
| Solar (양력)       | `1000-02-13` | `2050-12-31` |

Dates outside this range cause the corresponding setter to return `false`.

## Install

```bash
npm install korean-lunar-calendar
```

```js
// ES Modules
import KoreanLunarCalendar from "korean-lunar-calendar";

// CommonJS
const KoreanLunarCalendar = require("korean-lunar-calendar");
```

```html
<!-- Browser (CDN) -->
<script src="https://cdn.jsdelivr.net/npm/korean-lunar-calendar/dist/korean-lunar-calendar.min.js"></script>
```

## Usage

### Solar → Lunar (양력 → 음력)

```js
const calendar = new KoreanLunarCalendar();

// setSolarDate(year, month, day) → boolean (false if invalid/out of range)
calendar.setSolarDate(2017, 6, 24);

calendar.getLunarCalendar();
// { year: 2017, month: 5, day: 1, intercalation: true }

calendar.getKoreanGapja();
// { year: "정유년", month: "병오월", day: "임오일", intercalation: "윤월" }

calendar.getChineseGapja();
// { year: "丁酉年", month: "丙午月", day: "壬午日", intercalation: "閏月" }
```

### Lunar → Solar (음력 → 양력)

```js
const calendar = new KoreanLunarCalendar();

// setLunarDate(year, month, day, intercalation) → boolean
calendar.setLunarDate(1956, 1, 21, false);

calendar.getSolarCalendar();
// { year: 1956, month: 3, day: 3 }

calendar.getKoreanGapja();
// { year: "병신년", month: "경인월", day: "기사일", intercalation: "" }
```

> Always check the return value of `setSolarDate` / `setLunarDate` before reading the result —
> the getters reflect the **last successful** set call.

## API

`new KoreanLunarCalendar()` creates a stateful converter. Set a date, then read it back in the
other calendar.

| Method | Returns | Description |
| ------ | ------- | ----------- |
| `setSolarDate(year, month, day)` | `boolean` | Set a Gregorian date. Returns `false` for out-of-range, non-integer, or nonexistent dates. |
| `setLunarDate(year, month, day, intercalation)` | `boolean` | Set a lunar date. `intercalation` requests the leap month; returns `false` if that month has no leap month. |
| `getSolarCalendar()` | `CalendarData` | The solar date for the last successful set. |
| `getLunarCalendar()` | `CalendarData` | The lunar date (includes `intercalation`). |
| `getKoreanGapja()` | `GapJaData` | Sexagenary cycle in Korean (e.g. `정유년`). |
| `getChineseGapja()` | `GapJaData` | Sexagenary cycle in Chinese characters (e.g. `丁酉年`). |
| `getGapja(isChinese?)` | `GapJaData` | GapJa in Korean by default, Chinese when `isChinese` is `true`. |
| `getGapJaIndex()` | `{ cheongan, ganji }` | Raw 0-based cheongan (천간) and ganji (지지) indices for year/month/day. |

### Types

```ts
interface CalendarData {
  year: number;
  month: number;
  day: number;
  intercalation?: boolean; // present on lunar results
}

interface GapJaData {
  year: string;
  month: string;
  day: string;
  intercalation?: string; // "윤월" / "閏月" when the lunar month is a leap month, else ""
}
```

> `getSolarCalendar()` and `getLunarCalendar()` return a **copy** — mutating the returned object
> does not affect the converter's internal state.

## Validation

Every setter validates its input and returns a `boolean`, so you can branch on the result:

```js
const calendar = new KoreanLunarCalendar();

// Rejected → return false
calendar.setLunarDate(99, 1, 1, false);   // before supported range
calendar.setSolarDate(2051, 1, 1);        // after supported range
calendar.setSolarDate(2017, 6, 24.5);     // non-integer day
calendar.setSolarDate(1582, 10, 8);       // skipped by the 1582 Gregorian reform
calendar.setLunarDate(2017, 3, 1, true);  // month 3 of 2017 has no leap month

// Accepted → return true
calendar.setLunarDate(1000, 1, 1, false);
calendar.setSolarDate(2050, 12, 31);
```

## Other languages

The same library is available for other ecosystems:

- **Java** — [usingsky/KoreanLunarCalendar](https://github.com/usingsky/KoreanLunarCalendar)
- **Python** — [usingsky/korean_lunar_calendar_py](https://github.com/usingsky/korean_lunar_calendar_py)
- **JavaScript** — [usingsky/korean_lunar_calendar_js](https://github.com/usingsky/korean_lunar_calendar_js)

## Acknowledgements

Conversion data follows the [KARI (Korea Astronomy and Space Science Institute)](https://astro.kasi.re.kr/)
Korean lunar–solar standard. Many thanks to KARI for publishing the reference tables.

## License

MIT © [Jinil Lee](https://github.com/usingsky)

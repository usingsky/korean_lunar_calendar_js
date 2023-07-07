# korean_lunar_calendar
> Library to convert Korean lunar-calendar to Gregorian calendar.

## Overview
Korean calendar and Chinese calendar is same lunar calendar but have different date.
This follow the KARI(Korea Astronomy and Space Science Institute)
한국 양음력 변환 (한국천문연구원 기준) - 네트워크 연결 불필요
```
음력 지원 범위 (1000년 01월 01일 ~ 2050년 11월 18일)
Korean Lunar Calendar (1000-01-01 ~ 2050-11-18)

양력 지원 범위 (1000년 02월 13일 ~ 2050년 12월 31일)
Gregorian Calendar (1000-02-13 ~ 2050-12-31)
```

## Docs

- [Install](#install)
- [Import](#import)
- [Example](#example)
- [Validation](#validation)
- [Other languages](#other-languages)

## Install

```bash
npm install korean-lunar-calendar
```

## Import

ECMAScript usage

```js
import KoreanLunarCalendar from "korean-lunar-calendar";
```

CommonJS usage

```js
var KoreanLunarCalendar = require("korean-lunar-calendar");
```

CDN(Browser) usage

```html
<script src="https://cdn.jsdelivr.net/npm/korean-lunar-calendar/dist/korean-lunar-calendar.min.js"></script>
```

## Example

Korean Solar Date -> Korean Lunar Date (양력 -> 음력)

```js
const calendar = new KoreanLunarCalendar();

// params : year(년), month(월), day(일)
calendar.setSolarDate(2017, 6, 24);

// (1) Lunar Calendar
console.log(calendar.getLunarCalendar());

// (2) Korean GapJa String
console.log(calendar.getKoreanGapja());

// (3) Chinese GapJa String
console.log(calendar.getChineseGapja());
```

Result

```js
//(1)
{
    "year": 2017,
    "month": 5,
    "day": 1,
    "intercalation": true
}

//(2)
{
    "year": "정유년",
    "month": "병오월",
    "day": "임오일",
    "intercalation": "윤월"
}

//(3)
{
    "year": "丁酉年",
    "month": "丙午月",
    "day": "壬午日",
    "intercalation": "閏月"
}
```

Korean Lunar Date -> Korean Solar Date (음력 -> 양력)

```js
const calendar = new KoreanLunarCalendar();

// params : year(년), month(월), day(일), intercalation(윤달여부)
calendar.setLunarDate(1956, 1, 21, false);

// (1) Solar Calendar
console.log(calendar.getSolarCalendar());

// (2) Korean GapJa String
console.log(calendar.getKoreanGapja());

// (3) Chinese GapJa String
console.log(calendar.getChineseGapja());
```

Result

```javascript
//(1)
{
    "year": 1956,
    "month": 3,
    "day": 3,
}

//(2)
{
    "year": "병신년",
    "month": "경인월",
    "day": "기사일",
    "intercalation": ""
}

//(3)
{
    "year": "丙申年",
    "month": "庚寅月",
    "day": "己巳日",
    "intercalation": ""
}
```

## Validation

Check for invalid date input

```js
const calendar = new KoreanLunarCalendar();

// Invalid date
calendar.setLunarDate(99, 1, 1, False); // => return False
calendar.setSolarDate(2051, 1, 1); // => return False

// OK
calendar.setLunarDate(1000, 1, 1, False); // => return True
calendar.setSolarDate(2050, 12, 31); // => return True
```

## Other languages

- Java : [https://github.com/usingsky/KoreanLunarCalendar](https://github.com/usingsky/KoreanLunarCalendar)
- Python : [https://github.com/usingsky/korean_lunar_calendar_py](https://github.com/usingsky/korean_lunar_calendar_py)
- Javascript : [https://github.com/usingsky/korean_lunar_calendar_js](https://github.com/usingsky/korean_lunar_calendar_js)
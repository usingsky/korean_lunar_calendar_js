# korean_lunar_calendar

Libraries to convert Korean lunar-calendar to Gregorian calendar.

# Docs

- [Installation](#installation)
- [Example](#example)
- [Validation](#validation)

# Installation

```bash
npm install korean-lunar-calendar
```

# Example

- Import

```javascript
import KoreanLunarCalendar from "korean-lunar-calendar";
```

- Korean Solar Date -> Korean Lunar Date (양력 -> 음력)

```javascript
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

```javascript
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

- Korean Lunar Date -> Korean Solar Date (음력 -> 양력)

```javascript
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

# Validation

- Check for invalid date input

```javascript
const calendar = new KoreanLunarCalendar();

// Invalid date
calendar.setLunarDate(99, 1, 1, False); // => return False
calendar.setSolarDate(2051, 1, 1); // => return False

// OK
calendar.setLunarDate(1000, 1, 1, False); // => return True
calendar.setSolarDate(2050, 12, 31); // => return True
```

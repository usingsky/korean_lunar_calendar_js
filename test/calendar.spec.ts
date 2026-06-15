import { describe, it, expect } from "vitest";
import KoreanLunarCalendar from "../src";
import kasiDataset from "./dataset/kasi-lunar-dataset.json";

const testData = [
  {
    solar: { year: 1321, month: 1, day: 1 },
    lunar: { year: 1320, month: 11, day: 24, intercalation: false },
    gapja: {
      year: "경신년",
      month: "무자월",
      day: "기해일",
      intercalation: "",
    },
  },
  {
    solar: { year: 1956, month: 3, day: 3 },
    lunar: { year: 1956, month: 1, day: 21, intercalation: false },
    gapja: {
      year: "병신년",
      month: "경인월",
      day: "기사일",
      intercalation: "",
    },
  },
  {
    solar: { year: 2017, month: 6, day: 24 },
    lunar: { year: 2017, month: 5, day: 1, intercalation: true },
    gapja: {
      year: "정유년",
      month: "병오월",
      day: "임오일",
      intercalation: "윤월",
    },
  },
  {
    solar: { year: 1727, month: 4, day: 21 },
    lunar: { year: 1727, month: 3, day: 1, intercalation: true },
    gapja: {
      year: "정미년",
      month: "갑진월",
      day: "정사일",
      intercalation: "윤월",
    },
  },
];
const koreanLunarCalendar = new KoreanLunarCalendar();

describe("Solar to Lunar Test", () => {
  testData.forEach((data) => {
    it(`${data.solar.year}-${data.solar.month}-${data.solar.day}`, () => {
      koreanLunarCalendar.setSolarDate(
        data.solar.year,
        data.solar.month,
        data.solar.day,
      );
      expect(koreanLunarCalendar.getLunarCalendar()).toMatchObject(data.lunar);
      expect(koreanLunarCalendar.getKoreanGapja()).toMatchObject(data.gapja);
    });
  });
});

describe("Lunar to Solar Test", () => {
  testData.forEach((data) => {
    it(`${data.lunar.year}-${data.lunar.month}-${data.lunar.day}`, () => {
      koreanLunarCalendar.setLunarDate(
        data.lunar.year,
        data.lunar.month,
        data.lunar.day,
        data.lunar.intercalation,
      );
      expect(koreanLunarCalendar.getSolarCalendar()).toMatchObject(data.solar);
      expect(koreanLunarCalendar.getKoreanGapja()).toMatchObject(data.gapja);
    });
  });
});

describe("Default date Test", () => {
  it("defaults to today's solar date when none is set", () => {
    const calendar = new KoreanLunarCalendar();
    const today = new Date();
    expect(calendar.getSolarCalendar()).toMatchObject({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    });
  });
});

// 200 solar->lunar cases pulled from the official KARI / data.go.kr
// `getLunCalInfo` open API (the ground-truth oracle). Restricted to the
// Gregorian era (>= 1583) where the library and the API's solar calendar agree
// — before the 1582 reform the API uses the Julian calendar, which diverges.
// The API omits the month gapja (lunWolgeon) for leap months, so it is stored
// as "" and that single assertion is skipped.
type KasiRow = {
  solar: [number, number, number];
  lunar: [number, number, number];
  leap: boolean;
  ko: [string, string, string];
  cn: [string, string, string];
};

const kasiRows = kasiDataset as KasiRow[];
const gapjaUnit = (s: string) => s.slice(0, -1); // drop trailing 년/월/일 or 年/月/日

describe("KASI dataset (data.go.kr) Solar to Lunar Test", () => {
  it("has the expected number of cases", () => {
    expect(kasiRows.length).toBe(200);
  });

  kasiRows.forEach((row) => {
    const [sy, sm, sd] = row.solar;
    it(`${sy}-${String(sm).padStart(2, "0")}-${String(sd).padStart(2, "0")}`, () => {
      const calendar = new KoreanLunarCalendar();
      expect(calendar.setSolarDate(sy, sm, sd)).toBe(true);

      const lunar = calendar.getLunarCalendar();
      expect([lunar.year, lunar.month, lunar.day]).toEqual(row.lunar);
      expect(!!lunar.intercalation).toBe(row.leap);

      const ko = calendar.getKoreanGapja();
      const cn = calendar.getChineseGapja();
      const koParts = [ko.year, ko.month, ko.day].map(gapjaUnit);
      const cnParts = [cn.year, cn.month, cn.day].map(gapjaUnit);

      [0, 1, 2].forEach((i) => {
        if (row.ko[i]) expect(koParts[i]).toBe(row.ko[i]); // "" => API omitted (leap month)
        if (row.cn[i]) expect(cnParts[i]).toBe(row.cn[i]);
      });
    });
  });
});

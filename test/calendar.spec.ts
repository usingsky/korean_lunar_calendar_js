import KoreanLunarCalendar from "../src";

const testData = [
  {
    solar: { year: 1321, month: 1, day: 1 },
    lunar: { year: 1320, month: 11, day: 24, intercalation: false },
    gapja: { year: '경신년', month: '무자월', day: '기해일', intercalation: '' },

  },
  {
    solar: { year: 1956, month: 3, day: 3 },
    lunar: { year: 1956, month: 1, day: 21, intercalation: false },
    gapja: { year: '병신년', month: '경인월', day: '기사일', intercalation: '' },

  },
  {
    solar: { year: 2017, month: 6, day: 24 },
    lunar: { year: 2017, month: 5, day: 1, intercalation: true },
    gapja: { year: '정유년', month: '병오월', day: '임오일', intercalation: '윤월' },

  },

];
const koreanLunarCalendar = new KoreanLunarCalendar();

describe("Solar to Lunar Test", () => {
  testData.forEach(data => {
    it(`${data.solar.year}-${data.solar.month}-${data.solar.day}`, () => {
      koreanLunarCalendar.setSolarDate(data.solar.year, data.solar.month, data.solar.day);
      expect(koreanLunarCalendar.getLunarCalendar()).toMatchObject(data.lunar);
      expect(koreanLunarCalendar.getKoreanGapja()).toMatchObject(data.gapja);
    })
  });
});

describe("Lunar to Solar Test", () => {
  testData.forEach(data => {
    it(`${data.lunar.year}-${data.lunar.month}-${data.lunar.day}`, () => {
      koreanLunarCalendar.setLunarDate(data.lunar.year, data.lunar.month, data.lunar.day, data.lunar.intercalation);
      expect(koreanLunarCalendar.getSolarCalendar()).toMatchObject(data.solar);
      expect(koreanLunarCalendar.getKoreanGapja()).toMatchObject(data.gapja);
    })
  });
});

import KoreanLunarCalendar from "../lib/korean-lunar-calendar";

describe("Solar to Lunar Test", () => {
  const koreanLunarCalendar = new KoreanLunarCalendar();

  it("2017-06-24", () => {
    koreanLunarCalendar.setSolarDate(2017, 6, 24);
    expect(koreanLunarCalendar.getLunarCalendar()).toMatchObject({
      year: 2017,
      month: 5,
      day: 1,
      intercalation: true,
    });
    expect(koreanLunarCalendar.getKoreanGapja()).toMatchObject({
      year: "정유년",
      month: "병오월",
      day: "임오일",
      intercalation: "윤월",
    });
  });

  it("1321-01-01", () => {
    koreanLunarCalendar.setSolarDate(1321, 1, 1);
    expect(koreanLunarCalendar.getLunarCalendar()).toMatchObject({
      year: 1320,
      month: 11,
      day: 24,
      intercalation: false,
    });
    expect(koreanLunarCalendar.getKoreanGapja()).toMatchObject({
      year: "경신년",
      month: "무자월",
      day: "기해일",
      intercalation: "",
    });
  });
});

describe("Lunar to Solar Test", () => {
  const koreanLunarCalendar = new KoreanLunarCalendar();
  it("1956-01-21", () => {
    koreanLunarCalendar.setLunarDate(1956, 1, 21, false);
    expect(koreanLunarCalendar.getSolarCalendar()).toMatchObject({
      year: 1956,
      month: 3,
      day: 3,
    });
    expect(koreanLunarCalendar.getKoreanGapja()).toMatchObject({
      year: "병신년",
      month: "경인월",
      day: "기사일",
      intercalation: "",
    });
    expect(koreanLunarCalendar.getChineseGapja()).toMatchObject({
      year: "丙申年",
      month: "庚寅月",
      day: "己巳日",
      intercalation: "",
    });
  });
});

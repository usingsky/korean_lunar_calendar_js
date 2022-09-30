import { DATA } from "./korean-lunar-data";

export interface CalendarData {
  year: number;
  month: number;
  day: number;
  intercalation?: boolean;
}

export interface GapJaData {
  year: string;
  month: string;
  day: string;
  intercalation?: string;
}

export default class KoreanLunarCalendar {
  private solarCalendar: CalendarData;
  private lunarCalendar: CalendarData;

  private gapjaYearInx: Array<number>;
  private gapjaMonthInx: Array<number>;
  private gapjaDayInx: Array<number>;

  constructor() {
    this.solarCalendar = { year: 0, month: 0, day: 0 };
    this.lunarCalendar = { year: 0, month: 0, day: 0, intercalation: false };

    this.gapjaYearInx = [0, 0, 0];
    this.gapjaMonthInx = [0, 0, 1];
    this.gapjaDayInx = [0, 0, 2];
  }

  private getLunarData(year: number): number {
    return DATA.KOREAN_LUNAR_DATA[year - DATA.KOREAN_LUNAR_BASE_YEAR];
  }

  private getLunarIntercalationMonth(lunarData: number): number {
    return (lunarData >> 12) & 0x000f;
  }

  private getLunarDays(year: number): number {
    let lunarData = this.getLunarData(year);
    return (lunarData >> 17) & 0x01ff;
  }

  private getLunarDays2(
    year: number,
    month: number,
    isIntercalation: boolean
  ): number {
    let days = 0;
    let lunarData = this.getLunarData(year);
    if (
      isIntercalation &&
      this.getLunarIntercalationMonth(lunarData) == month
    ) {
      days =
        ((lunarData >> 16) & 0x01) > 0
          ? DATA.LUNAR_BIG_MONTH_DAY
          : DATA.LUNAR_SMALL_MONTH_DAY;
    } else {
      days =
        ((lunarData >> (12 - month)) & 0x01) > 0
          ? DATA.LUNAR_BIG_MONTH_DAY
          : DATA.LUNAR_SMALL_MONTH_DAY;
    }
    return days;
  }

  private getLunarDaysBeforeBaseYear(year: number): number {
    let days = 0;
    for (
      let baseYear = DATA.KOREAN_LUNAR_BASE_YEAR;
      baseYear < year + 1;
      baseYear++
    ) {
      days += this.getLunarDays(baseYear);
    }
    return days;
  }

  private getLunarDaysBeforeBaseMonth(
    year: number,
    month: number,
    isIntercalation: boolean
  ): number {
    let days = 0;
    if (year >= DATA.KOREAN_LUNAR_BASE_YEAR && month > 0) {
      for (let baseMonth = 1; baseMonth < month + 1; baseMonth++) {
        days += this.getLunarDays2(year, baseMonth, false);
      }

      if (isIntercalation) {
        let intercalationMonth = this.getLunarIntercalationMonth(
          this.getLunarData(year)
        );
        if (intercalationMonth > 0 && intercalationMonth < month + 1) {
          days += this.getLunarDays2(year, intercalationMonth, true);
        }
      }
    }
    return days;
  }

  private getLunarAbsDays(
    year: number,
    month: number,
    day: number,
    isIntercalation: boolean
  ): number {
    let days = 0;
    days =
      this.getLunarDaysBeforeBaseYear(year - 1) +
      this.getLunarDaysBeforeBaseMonth(year, month - 1, true) +
      day;

    if (
      isIntercalation &&
      this.getLunarIntercalationMonth(this.getLunarData(year)) == month
    ) {
      days += this.getLunarDays2(year, month, false);
    }
    return days;
  }

  private isSolarIntercalationYear(lunarData: number): boolean {
    return ((lunarData >> 30) & 0x01) > 0;
  }

  private getSolarDays(year: number): number {
    let days = 0;
    let lunarData = this.getLunarData(year);
    days = this.isSolarIntercalationYear(lunarData)
      ? DATA.SOLAR_BIG_YEAR_DAY
      : DATA.SOLAR_SMALL_YEAR_DAY;
    return days;
  }

  private getSolarDays2(year: number, month: number): number {
    let days = 0;
    let lunarData = this.getLunarData(year);
    if (month == 2 && this.isSolarIntercalationYear(lunarData)) {
      days = DATA.SOLAR_DAYS[12];
    } else {
      days = DATA.SOLAR_DAYS[month - 1];
    }
    return days;
  }

  private getSolarDayBeforeBaseYear(year: number): number {
    let days = 0;
    for (
      let baseYear = DATA.KOREAN_LUNAR_BASE_YEAR;
      baseYear < year + 1;
      baseYear++
    ) {
      days += this.getSolarDays(baseYear);
    }
    return days;
  }

  private getSolarDaysBeforeBaseMonth(year: number, month: number): number {
    let days = 0;
    for (let baseMonth = 1; baseMonth < month + 1; baseMonth++) {
      days += this.getSolarDays2(year, baseMonth);
    }
    return days;
  }

  private getSolarAbsDays(year: number, month: number, day: number): number {
    let days = 0;
    days =
      this.getSolarDayBeforeBaseYear(year - 1) +
      this.getSolarDaysBeforeBaseMonth(year, month - 1) +
      day;
    days -= DATA.SOLAR_LUNAR_DAY_DIFF;
    return days;
  }

  private setSolarDateByLunarDate(
    lunarYear: number,
    lunarMonth: number,
    lunarDay: number,
    isIntercalation: boolean
  ): void {
    let absDays = this.getLunarAbsDays(
      lunarYear,
      lunarMonth,
      lunarDay,
      isIntercalation
    );
    let solarYear = 0;
    let solarMonth = 0;
    let solarDay = 0;

    solarYear =
      absDays < this.getSolarAbsDays(lunarYear + 1, 1, 1)
        ? lunarYear
        : lunarYear + 1;

    for (let month = 12; month > 0; month--) {
      let absDaysByMonth = this.getSolarAbsDays(solarYear, month, 1);
      if (absDays >= absDaysByMonth) {
        solarMonth = month;
        solarDay = absDays - absDaysByMonth + 1;
        break;
      }
    }

    this.solarCalendar = { year: solarYear, month: solarMonth, day: solarDay };
  }

  private setLunarDateBySolarDate(
    solarYear: number,
    solarMonth: number,
    solarDay: number
  ): void {
    let absDays = this.getSolarAbsDays(solarYear, solarMonth, solarDay);
    let lunarYear = 0;
    let lunarMonth = 0;
    let lunarDay = 0;
    let isIntercalation = false;

    lunarYear =
      absDays >= this.getLunarAbsDays(solarYear, 1, 1, false)
        ? solarYear
        : solarYear - 1;

    for (let month = 12; month > 0; month--) {
      let absDaysByMonth = this.getLunarAbsDays(lunarYear, month, 1, false);
      if (absDays >= absDaysByMonth) {
        lunarMonth = month;

        if (
          this.getLunarIntercalationMonth(this.getLunarData(lunarYear)) == month
        ) {
          isIntercalation =
            absDays >= this.getLunarAbsDays(lunarYear, month, 1, true);
        }

        lunarDay =
          absDays -
          this.getLunarAbsDays(lunarYear, lunarMonth, 1, isIntercalation) +
          1;
        break;
      }
    }

    this.lunarCalendar = {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      intercalation: isIntercalation,
    };
  }

  private checkValidDate(
    isLunar: boolean,
    isIntercalation: boolean,
    year: number,
    month: number,
    day: number
  ): boolean {
    let isValid = false;
    let dateValue = year * 10000 + month * 100 + day;
    // 1582. 10. 5 ~ 1582. 10. 14 is not enable
    if (
      (isLunar ? DATA.KOREAN_LUNAR_MIN_VALUE : DATA.KOREAN_SOLAR_MIN_VALUE) <=
        dateValue &&
      (isLunar ? DATA.KOREAN_LUNAR_MAX_VALUE : DATA.KOREAN_SOLAR_MAX_VALUE) >=
        dateValue
    ) {
      if (month > 0 && month < 13 && day > 0) {
        let dayLimit = isLunar
          ? this.getLunarDays2(year, month, isIntercalation)
          : this.getSolarDays2(year, month);
        if (!isLunar && year == 1582 && month == 10) {
          if (day > 4 && day < 15) {
            return false;
          } else {
            dayLimit += 10;
          }
        }
        if (day <= dayLimit) {
          isValid = true;
        }
      }
    }
    return isValid;
  }

  public setLunarDate(
    lunarYear: number,
    lunarMonth: number,
    lunarDay: number,
    isIntercalation: boolean
  ): boolean {
    let isValid = false;
    if (
      this.checkValidDate(
        true,
        isIntercalation,
        lunarYear,
        lunarMonth,
        lunarDay
      )
    ) {
      this.lunarCalendar = {
        year: lunarYear,
        month: lunarMonth,
        day: lunarDay,
        intercalation:
          isIntercalation &&
          this.getLunarIntercalationMonth(this.getLunarData(lunarYear)) ==
            lunarMonth,
      };

      this.setSolarDateByLunarDate(
        lunarYear,
        lunarMonth,
        lunarDay,
        isIntercalation
      );
      isValid = true;
    }
    return isValid;
  }

  public setSolarDate(
    solarYear: number,
    solarMonth: number,
    solarDay: number
  ): boolean {
    let isValid = false;
    if (this.checkValidDate(false, false, solarYear, solarMonth, solarDay)) {
      this.solarCalendar = {
        year: solarYear,
        month: solarMonth,
        day: solarDay,
      };

      this.setLunarDateBySolarDate(solarYear, solarMonth, solarDay);
      isValid = true;
    }
    return isValid;
  }

  private setGapJa(): void {
    let absDays = this.getLunarAbsDays(
      this.lunarCalendar.year,
      this.lunarCalendar.month,
      this.lunarCalendar.day,
      !!this.lunarCalendar.intercalation
    );
    if (absDays > 0) {
      this.gapjaYearInx[0] =
        (this.lunarCalendar.year + 6 - DATA.KOREAN_LUNAR_BASE_YEAR) %
        DATA.KOREAN_CHEONGAN.length;
      this.gapjaYearInx[1] =
        (this.lunarCalendar.year + 0 - DATA.KOREAN_LUNAR_BASE_YEAR) %
        DATA.KOREAN_GANJI.length;

      let monthCount = this.lunarCalendar.month;
      monthCount +=
        12 * (this.lunarCalendar.year - DATA.KOREAN_LUNAR_BASE_YEAR);
      this.gapjaMonthInx[0] = (monthCount + 3) % DATA.KOREAN_CHEONGAN.length;
      this.gapjaMonthInx[1] = (monthCount + 1) % DATA.KOREAN_GANJI.length;

      this.gapjaDayInx[0] = (absDays + 4) % DATA.KOREAN_CHEONGAN.length;
      this.gapjaDayInx[1] = (absDays + 2) % DATA.KOREAN_GANJI.length;
    }
  }

  public getKoreanGapja(): GapJaData {
    this.setGapJa();

    let yearGapja = `${DATA.KOREAN_CHEONGAN[this.gapjaYearInx[0]]}${
      DATA.KOREAN_GANJI[this.gapjaYearInx[1]]
    }${DATA.KOREAN_GAPJA_UNIT[this.gapjaYearInx[2]]}`;
    let monthGapja = `${DATA.KOREAN_CHEONGAN[this.gapjaMonthInx[0]]}${
      DATA.KOREAN_GANJI[this.gapjaMonthInx[1]]
    }${DATA.KOREAN_GAPJA_UNIT[this.gapjaMonthInx[2]]}`;
    let dayGapja = `${DATA.KOREAN_CHEONGAN[this.gapjaDayInx[0]]}${
      DATA.KOREAN_GANJI[this.gapjaDayInx[1]]
    }${DATA.KOREAN_GAPJA_UNIT[this.gapjaDayInx[2]]}`;
    let intercalationGapja = !!this.lunarCalendar.intercalation
      ? `${DATA.INTERCALATION_STR[0]}${DATA.KOREAN_GAPJA_UNIT[1]}`
      : "";

    return {
      year: yearGapja,
      month: monthGapja,
      day: dayGapja,
      intercalation: intercalationGapja,
    };
  }

  public getChineseGapja(): GapJaData {
    this.setGapJa();

    let yearGapja = `${DATA.CHINESE_CHEONGAN[this.gapjaYearInx[0]]}${
      DATA.CHINESE_GANJI[this.gapjaYearInx[1]]
    }${DATA.CHINESE_GAPJA_UNIT[this.gapjaYearInx[2]]}`;
    let monthGapja = `${DATA.CHINESE_CHEONGAN[this.gapjaMonthInx[0]]}${
      DATA.CHINESE_GANJI[this.gapjaMonthInx[1]]
    }${DATA.CHINESE_GAPJA_UNIT[this.gapjaMonthInx[2]]}`;
    let dayGapja = `${DATA.CHINESE_CHEONGAN[this.gapjaDayInx[0]]}${
      DATA.CHINESE_GANJI[this.gapjaDayInx[1]]
    }${DATA.CHINESE_GAPJA_UNIT[this.gapjaDayInx[2]]}`;
    let intercalationGapja = !!this.lunarCalendar.intercalation
      ? `${DATA.INTERCALATION_STR[1]}${DATA.CHINESE_GAPJA_UNIT[1]}`
      : "";

    return {
      year: yearGapja,
      month: monthGapja,
      day: dayGapja,
      intercalation: intercalationGapja,
    };
  }

  public getLunarCalendar(): CalendarData {
    return this.lunarCalendar;
  }

  public getSolarCalendar(): CalendarData {
    return this.solarCalendar;
  }
}

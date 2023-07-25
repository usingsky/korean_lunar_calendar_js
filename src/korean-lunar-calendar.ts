import { LUNAR_CALENDAR_DATA } from "./korean-lunar-data.js";

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

export class KoreanLunarCalendar {
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
    return LUNAR_CALENDAR_DATA.KOREAN_LUNAR_DATA[year - LUNAR_CALENDAR_DATA.KOREAN_LUNAR_BASE_YEAR];
  }

  private getLunarIntercalationMonth(lunarData: number): number {
    return (lunarData >> 12) & 0x000f;
  }

  private getLunarDays(year: number): number {
    const lunarData = this.getLunarData(year);
    return (lunarData >> 17) & 0x01ff;
  }

  private getLunarDays2(
    year: number,
    month: number,
    isIntercalation: boolean
  ): number {
    let days = 0;
    const lunarData = this.getLunarData(year);
    if (
      isIntercalation &&
      this.getLunarIntercalationMonth(lunarData) == month
    ) {
      days =
        ((lunarData >> 16) & 0x01) > 0
          ? LUNAR_CALENDAR_DATA.LUNAR_BIG_MONTH_DAY
          : LUNAR_CALENDAR_DATA.LUNAR_SMALL_MONTH_DAY;
    } else {
      days =
        ((lunarData >> (12 - month)) & 0x01) > 0
          ? LUNAR_CALENDAR_DATA.LUNAR_BIG_MONTH_DAY
          : LUNAR_CALENDAR_DATA.LUNAR_SMALL_MONTH_DAY;
    }
    return days;
  }

  private getLunarDaysBeforeBaseYear(year: number): number {
    let days = 0;
    for (
      let baseYear = LUNAR_CALENDAR_DATA.KOREAN_LUNAR_BASE_YEAR;
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
    if (year >= LUNAR_CALENDAR_DATA.KOREAN_LUNAR_BASE_YEAR && month > 0) {
      for (let baseMonth = 1; baseMonth < month + 1; baseMonth++) {
        days += this.getLunarDays2(year, baseMonth, false);
      }

      if (isIntercalation) {
        const intercalationMonth = this.getLunarIntercalationMonth(
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
    const lunarData = this.getLunarData(year);
    days = this.isSolarIntercalationYear(lunarData)
      ? LUNAR_CALENDAR_DATA.SOLAR_BIG_YEAR_DAY
      : LUNAR_CALENDAR_DATA.SOLAR_SMALL_YEAR_DAY;
    return days;
  }

  private getSolarDays2(year: number, month: number): number {
    let days = 0;
    const lunarData = this.getLunarData(year);
    if (month == 2 && this.isSolarIntercalationYear(lunarData)) {
      days = LUNAR_CALENDAR_DATA.SOLAR_DAYS[12];
    } else {
      days = LUNAR_CALENDAR_DATA.SOLAR_DAYS[month - 1];
    }
    return days;
  }

  private getSolarDayBeforeBaseYear(year: number): number {
    let days = 0;
    for (
      let baseYear = LUNAR_CALENDAR_DATA.KOREAN_LUNAR_BASE_YEAR;
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
    days -= LUNAR_CALENDAR_DATA.SOLAR_LUNAR_DAY_DIFF;
    return days;
  }

  private setSolarDateByLunarDate(
    lunarYear: number,
    lunarMonth: number,
    lunarDay: number,
    isIntercalation: boolean
  ): void {
    const absDays = this.getLunarAbsDays(
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
      const absDaysByMonth = this.getSolarAbsDays(solarYear, month, 1);
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
    const absDays = this.getSolarAbsDays(solarYear, solarMonth, solarDay);
    let lunarYear = 0;
    let lunarMonth = 0;
    let lunarDay = 0;
    let isIntercalation = false;

    lunarYear =
      absDays >= this.getLunarAbsDays(solarYear, 1, 1, false)
        ? solarYear
        : solarYear - 1;

    for (let month = 12; month > 0; month--) {
      const absDaysByMonth = this.getLunarAbsDays(lunarYear, month, 1, false);
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
    const dateValue = year * 10000 + month * 100 + day;
    // 1582. 10. 5 ~ 1582. 10. 14 is not enable
    if (
      (isLunar ? LUNAR_CALENDAR_DATA.KOREAN_LUNAR_MIN_VALUE : LUNAR_CALENDAR_DATA.KOREAN_SOLAR_MIN_VALUE) <=
        dateValue &&
      (isLunar ? LUNAR_CALENDAR_DATA.KOREAN_LUNAR_MAX_VALUE : LUNAR_CALENDAR_DATA.KOREAN_SOLAR_MAX_VALUE) >=
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
    const absDays = this.getLunarAbsDays(
      this.lunarCalendar.year,
      this.lunarCalendar.month,
      this.lunarCalendar.day,
      !!this.lunarCalendar.intercalation
    );
    if (absDays > 0) {
      this.gapjaYearInx[0] =
        (this.lunarCalendar.year + 6 - LUNAR_CALENDAR_DATA.KOREAN_LUNAR_BASE_YEAR) %
        LUNAR_CALENDAR_DATA.KOREAN_CHEONGAN.length;
      this.gapjaYearInx[1] =
        (this.lunarCalendar.year + 0 - LUNAR_CALENDAR_DATA.KOREAN_LUNAR_BASE_YEAR) %
        LUNAR_CALENDAR_DATA.KOREAN_GANJI.length;

      let monthCount = this.lunarCalendar.month;
      monthCount +=
        12 * (this.lunarCalendar.year - LUNAR_CALENDAR_DATA.KOREAN_LUNAR_BASE_YEAR);
      this.gapjaMonthInx[0] = (monthCount + 3) % LUNAR_CALENDAR_DATA.KOREAN_CHEONGAN.length;
      this.gapjaMonthInx[1] = (monthCount + 1) % LUNAR_CALENDAR_DATA.KOREAN_GANJI.length;

      this.gapjaDayInx[0] = (absDays + 4) % LUNAR_CALENDAR_DATA.KOREAN_CHEONGAN.length;
      this.gapjaDayInx[1] = (absDays + 2) % LUNAR_CALENDAR_DATA.KOREAN_GANJI.length;
    }
  }

  public getGapJaIndex() {
    this.setGapJa();

    return {
      cheongan: {
        year: this.gapjaYearInx[0],
        month: this.gapjaMonthInx[0],
        day: this.gapjaDayInx[0]
      },
      ganji: {
        year: this.gapjaYearInx[1],
        month: this.gapjaMonthInx[1],
        day: this.gapjaDayInx[1]
      }
    };
  }

  public getGapja(IsChinese?:boolean): GapJaData {
    const gapjaInx = this.getGapJaIndex();
    const cheongan = !IsChinese ? LUNAR_CALENDAR_DATA.KOREAN_CHEONGAN : LUNAR_CALENDAR_DATA.CHINESE_CHEONGAN;
    const ganji = !IsChinese ? LUNAR_CALENDAR_DATA.KOREAN_GANJI : LUNAR_CALENDAR_DATA.CHINESE_GANJI;
    const unit = !IsChinese ? LUNAR_CALENDAR_DATA.KOREAN_GAPJA_UNIT : LUNAR_CALENDAR_DATA.CHINESE_GAPJA_UNIT;
    const intercalationStr = !IsChinese ? `${LUNAR_CALENDAR_DATA.INTERCALATION_STR[0]}${LUNAR_CALENDAR_DATA.KOREAN_GAPJA_UNIT[1]}` : `${LUNAR_CALENDAR_DATA.INTERCALATION_STR[1]}${LUNAR_CALENDAR_DATA.CHINESE_GAPJA_UNIT[1]}`;

    return {
      year: `${cheongan[gapjaInx.cheongan.year]}${ganji[gapjaInx.ganji.year]}${unit[this.gapjaYearInx[2]]}`,
      month: `${cheongan[gapjaInx.cheongan.month]}${ganji[gapjaInx.ganji.month]}${unit[this.gapjaMonthInx[2]]}`,
      day: `${cheongan[gapjaInx.cheongan.day]}${ganji[gapjaInx.ganji.day]}${unit[this.gapjaDayInx[2]]}`,
      intercalation: this.lunarCalendar.intercalation ? intercalationStr : ""
    };
  }

  public getKoreanGapja(): GapJaData {
    return this.getGapja();
  }

  public getChineseGapja(): GapJaData {
    return this.getGapja(true);
  }

  public getLunarCalendar(): CalendarData {
    return this.lunarCalendar;
  }

  public getSolarCalendar(): CalendarData {
    return this.solarCalendar;
  }
}

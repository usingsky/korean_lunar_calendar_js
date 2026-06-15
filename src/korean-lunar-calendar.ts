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

// Offsets that anchor the sexagenary cycle to the base year (1000): the cheongan
// (천간, length 10) and ganji (지지, length 12) wheels each start at a fixed
// position. Named so the gapja math reads as "cycle position + epoch offset"
// instead of bare numbers.
const GAPJA_OFFSET = {
  YEAR_CHEONGAN: 6,
  YEAR_GANJI: 0,
  MONTH_CHEONGAN: 3,
  MONTH_GANJI: 1,
  DAY_CHEONGAN: 4,
  DAY_GANJI: 2,
} as const;

export class KoreanLunarCalendar {
  private solarCalendar: CalendarData;
  private lunarCalendar: CalendarData;

  // Memoized cumulative day counts from the base year. The month-search loops
  // call the *BeforeBaseYear helpers repeatedly with the same year, so caching
  // avoids re-summing ~1000 years on every lookup.
  private cumulativeLunarYearDays = new Map<number, number>();
  private cumulativeSolarYearDays = new Map<number, number>();

  constructor() {
    this.solarCalendar = { year: 0, month: 0, day: 0 };
    this.lunarCalendar = { year: 0, month: 0, day: 0, intercalation: false };

    // Default to today's solar date until an explicit date is set.
    const today = new Date();
    this.setSolarDate(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate(),
    );
  }

  private getLunarData(year: number): number {
    return LUNAR_CALENDAR_DATA.KOREAN_LUNAR_DATA[
      year - LUNAR_CALENDAR_DATA.KOREAN_LUNAR_BASE_YEAR
    ];
  }

  private getLunarIntercalationMonth(lunarData: number): number {
    return (lunarData >> 12) & 0x000f;
  }

  // Total number of lunar days in the given year.
  private getLunarYearDays(year: number): number {
    return (this.getLunarData(year) >> 17) & 0x01ff;
  }

  // Number of days (29 or 30) in a specific lunar month.
  private getLunarMonthDays(
    year: number,
    month: number,
    isIntercalation: boolean,
  ): number {
    const lunarData = this.getLunarData(year);
    const isBigMonth =
      isIntercalation && this.getLunarIntercalationMonth(lunarData) === month
        ? ((lunarData >> 16) & 0x01) > 0
        : ((lunarData >> (12 - month)) & 0x01) > 0;
    return isBigMonth
      ? LUNAR_CALENDAR_DATA.LUNAR_BIG_MONTH_DAY
      : LUNAR_CALENDAR_DATA.LUNAR_SMALL_MONTH_DAY;
  }

  private getLunarDaysBeforeBaseYear(year: number): number {
    return this.accumulateYearDays(year, this.cumulativeLunarYearDays, (y) =>
      this.getLunarYearDays(y),
    );
  }

  private getLunarDaysBeforeBaseMonth(
    year: number,
    month: number,
    isIntercalation: boolean,
  ): number {
    let days = 0;
    if (year >= LUNAR_CALENDAR_DATA.KOREAN_LUNAR_BASE_YEAR && month > 0) {
      for (let baseMonth = 1; baseMonth < month + 1; baseMonth++) {
        days += this.getLunarMonthDays(year, baseMonth, false);
      }

      if (isIntercalation) {
        const intercalationMonth = this.getLunarIntercalationMonth(
          this.getLunarData(year),
        );
        if (intercalationMonth > 0 && intercalationMonth < month + 1) {
          days += this.getLunarMonthDays(year, intercalationMonth, true);
        }
      }
    }
    return days;
  }

  private getLunarAbsDays(
    year: number,
    month: number,
    day: number,
    isIntercalation: boolean,
  ): number {
    let days =
      this.getLunarDaysBeforeBaseYear(year - 1) +
      this.getLunarDaysBeforeBaseMonth(year, month - 1, true) +
      day;

    if (
      isIntercalation &&
      this.getLunarIntercalationMonth(this.getLunarData(year)) === month
    ) {
      days += this.getLunarMonthDays(year, month, false);
    }
    return days;
  }

  private isSolarIntercalationYear(lunarData: number): boolean {
    return ((lunarData >> 30) & 0x01) > 0;
  }

  // Total number of solar days (365 or 366) in the given year.
  private getSolarYearDays(year: number): number {
    return this.isSolarIntercalationYear(this.getLunarData(year))
      ? LUNAR_CALENDAR_DATA.SOLAR_BIG_YEAR_DAY
      : LUNAR_CALENDAR_DATA.SOLAR_SMALL_YEAR_DAY;
  }

  // Number of days in a specific solar month (February has 29 in a leap year).
  private getSolarMonthDays(year: number, month: number): number {
    if (month === 2 && this.isSolarIntercalationYear(this.getLunarData(year))) {
      return LUNAR_CALENDAR_DATA.SOLAR_DAYS[12];
    }
    return LUNAR_CALENDAR_DATA.SOLAR_DAYS[month - 1];
  }

  private getSolarDaysBeforeBaseYear(year: number): number {
    return this.accumulateYearDays(year, this.cumulativeSolarYearDays, (y) =>
      this.getSolarYearDays(y),
    );
  }

  // Sum of per-year day counts from the base year through `year`, memoized.
  // Extends the previous year's cached sum when available (amortized O(1)),
  // otherwise sums from the base year once and caches the total.
  private accumulateYearDays(
    year: number,
    cache: Map<number, number>,
    perYear: (y: number) => number,
  ): number {
    const cached = cache.get(year);
    if (cached !== undefined) {
      return cached;
    }

    const baseYear = LUNAR_CALENDAR_DATA.KOREAN_LUNAR_BASE_YEAR;
    const previous = cache.get(year - 1);
    let days = 0;
    if (previous !== undefined && year > baseYear) {
      days = previous + perYear(year);
    } else {
      for (let y = baseYear; y < year + 1; y++) {
        days += perYear(y);
      }
    }

    cache.set(year, days);
    return days;
  }

  private getSolarDaysBeforeBaseMonth(year: number, month: number): number {
    let days = 0;
    for (let baseMonth = 1; baseMonth < month + 1; baseMonth++) {
      days += this.getSolarMonthDays(year, baseMonth);
    }
    return days;
  }

  private getSolarAbsDays(year: number, month: number, day: number): number {
    return (
      this.getSolarDaysBeforeBaseYear(year - 1) +
      this.getSolarDaysBeforeBaseMonth(year, month - 1) +
      day -
      LUNAR_CALENDAR_DATA.SOLAR_LUNAR_DAY_DIFF
    );
  }

  private setSolarDateByLunarDate(
    lunarYear: number,
    lunarMonth: number,
    lunarDay: number,
    isIntercalation: boolean,
  ): void {
    const absDays = this.getLunarAbsDays(
      lunarYear,
      lunarMonth,
      lunarDay,
      isIntercalation,
    );
    const solarYear =
      absDays < this.getSolarAbsDays(lunarYear + 1, 1, 1)
        ? lunarYear
        : lunarYear + 1;
    let solarMonth = 0;
    let solarDay = 0;

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
    solarDay: number,
  ): void {
    const absDays = this.getSolarAbsDays(solarYear, solarMonth, solarDay);
    const lunarYear =
      absDays >= this.getLunarAbsDays(solarYear, 1, 1, false)
        ? solarYear
        : solarYear - 1;
    let lunarMonth = 0;
    let lunarDay = 0;
    let isIntercalation = false;

    for (let month = 12; month > 0; month--) {
      const absDaysByMonth = this.getLunarAbsDays(lunarYear, month, 1, false);
      if (absDays >= absDaysByMonth) {
        lunarMonth = month;

        if (
          this.getLunarIntercalationMonth(this.getLunarData(lunarYear)) ===
          month
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
    day: number,
  ): boolean {
    let isValid = false;
    // Reject non-integer / NaN inputs before they corrupt the bitfield math.
    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day)
    ) {
      return false;
    }
    const dateValue = year * 10000 + month * 100 + day;
    // 1582. 10. 5 ~ 1582. 10. 14 is not enable
    if (
      (isLunar
        ? LUNAR_CALENDAR_DATA.KOREAN_LUNAR_MIN_VALUE
        : LUNAR_CALENDAR_DATA.KOREAN_SOLAR_MIN_VALUE) <= dateValue &&
      (isLunar
        ? LUNAR_CALENDAR_DATA.KOREAN_LUNAR_MAX_VALUE
        : LUNAR_CALENDAR_DATA.KOREAN_SOLAR_MAX_VALUE) >= dateValue
    ) {
      if (month > 0 && month < 13 && day > 0) {
        // A leap-month request is only valid when this year's actual
        // intercalation month matches the requested month.
        if (
          isLunar &&
          isIntercalation &&
          this.getLunarIntercalationMonth(this.getLunarData(year)) !== month
        ) {
          return false;
        }
        const dayLimit = isLunar
          ? this.getLunarMonthDays(year, month, isIntercalation)
          : this.getSolarMonthDays(year, month);
        // 1582.10.5 ~ 1582.10.14 were skipped by the Gregorian reform; the
        // month still ends at day 31, so only those 10 days are rejected.
        if (!isLunar && year === 1582 && month === 10 && day > 4 && day < 15) {
          return false;
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
    isIntercalation: boolean,
  ): boolean {
    let isValid = false;
    if (
      this.checkValidDate(
        true,
        isIntercalation,
        lunarYear,
        lunarMonth,
        lunarDay,
      )
    ) {
      this.lunarCalendar = {
        year: lunarYear,
        month: lunarMonth,
        day: lunarDay,
        intercalation:
          isIntercalation &&
          this.getLunarIntercalationMonth(this.getLunarData(lunarYear)) ===
            lunarMonth,
      };

      this.setSolarDateByLunarDate(
        lunarYear,
        lunarMonth,
        lunarDay,
        isIntercalation,
      );
      isValid = true;
    }
    return isValid;
  }

  public setSolarDate(
    solarYear: number,
    solarMonth: number,
    solarDay: number,
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

  // Sexagenary-cycle indices for the current lunar date. Pure: returns a fresh
  // object instead of mutating instance state. When no valid date is set
  // (absDays <= 0) it returns the zero indices, preserving the historical
  // default of 갑자(甲子) for an unset converter.
  private computeGapJa() {
    const lunar = this.lunarCalendar;
    const absDays = this.getLunarAbsDays(
      lunar.year,
      lunar.month,
      lunar.day,
      !!lunar.intercalation,
    );

    if (absDays <= 0) {
      return {
        cheongan: { year: 0, month: 0, day: 0 },
        ganji: { year: 0, month: 0, day: 0 },
      };
    }

    const baseYear = LUNAR_CALENDAR_DATA.KOREAN_LUNAR_BASE_YEAR;
    const cheonganLen = LUNAR_CALENDAR_DATA.KOREAN_CHEONGAN.length;
    const ganjiLen = LUNAR_CALENDAR_DATA.KOREAN_GANJI.length;
    const monthCount = lunar.month + 12 * (lunar.year - baseYear);

    return {
      cheongan: {
        year:
          (lunar.year + GAPJA_OFFSET.YEAR_CHEONGAN - baseYear) % cheonganLen,
        month: (monthCount + GAPJA_OFFSET.MONTH_CHEONGAN) % cheonganLen,
        day: (absDays + GAPJA_OFFSET.DAY_CHEONGAN) % cheonganLen,
      },
      ganji: {
        year: (lunar.year + GAPJA_OFFSET.YEAR_GANJI - baseYear) % ganjiLen,
        month: (monthCount + GAPJA_OFFSET.MONTH_GANJI) % ganjiLen,
        day: (absDays + GAPJA_OFFSET.DAY_GANJI) % ganjiLen,
      },
    };
  }

  public getGapJaIndex() {
    return this.computeGapJa();
  }

  public getGapja(isChinese?: boolean): GapJaData {
    const inx = this.getGapJaIndex();
    const cheongan = !isChinese
      ? LUNAR_CALENDAR_DATA.KOREAN_CHEONGAN
      : LUNAR_CALENDAR_DATA.CHINESE_CHEONGAN;
    const ganji = !isChinese
      ? LUNAR_CALENDAR_DATA.KOREAN_GANJI
      : LUNAR_CALENDAR_DATA.CHINESE_GANJI;
    const unit = !isChinese
      ? LUNAR_CALENDAR_DATA.KOREAN_GAPJA_UNIT
      : LUNAR_CALENDAR_DATA.CHINESE_GAPJA_UNIT;
    const intercalationStr = !isChinese
      ? `${LUNAR_CALENDAR_DATA.INTERCALATION_STR[0]}${LUNAR_CALENDAR_DATA.KOREAN_GAPJA_UNIT[1]}`
      : `${LUNAR_CALENDAR_DATA.INTERCALATION_STR[1]}${LUNAR_CALENDAR_DATA.CHINESE_GAPJA_UNIT[1]}`;

    return {
      year: `${cheongan[inx.cheongan.year]}${ganji[inx.ganji.year]}${unit[0]}`,
      month: `${cheongan[inx.cheongan.month]}${ganji[inx.ganji.month]}${unit[1]}`,
      day: `${cheongan[inx.cheongan.day]}${ganji[inx.ganji.day]}${unit[2]}`,
      intercalation: this.lunarCalendar.intercalation ? intercalationStr : "",
    };
  }

  public getKoreanGapja(): GapJaData {
    return this.getGapja();
  }

  public getChineseGapja(): GapJaData {
    return this.getGapja(true);
  }

  public getLunarCalendar(): CalendarData {
    return { ...this.lunarCalendar };
  }

  public getSolarCalendar(): CalendarData {
    return { ...this.solarCalendar };
  }
}

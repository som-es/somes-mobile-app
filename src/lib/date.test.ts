import { age, dashDateToDotDate, isoToDotDate, minutes, relativeDayLabel } from '@/lib/date';

describe('dashDateToDotDate', () => {
  it('converts yyyy-mm-dd to dd.mm.yyyy', () => {
    expect(dashDateToDotDate('2024-03-07')).toBe('07.03.2024');
  });
});

describe('isoToDotDate', () => {
  it('strips the time portion before converting', () => {
    expect(isoToDotDate('2024-03-07T12:34:56Z')).toBe('07.03.2024');
  });
});

describe('relativeDayLabel', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-03-07T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null for a date in the past', () => {
    expect(relativeDayLabel('2024-03-06T12:00:00Z')).toBeNull();
  });

  it('returns null for an invalid date string', () => {
    expect(relativeDayLabel('not-a-date')).toBeNull();
  });

  it('reads as "in 1 Stunde" for something less than an hour away', () => {
    expect(relativeDayLabel('2024-03-07T12:30:00Z')).toBe('in 1 Stunde');
  });

  it('reads as "in N Stunden" for a few hours away', () => {
    expect(relativeDayLabel('2024-03-07T17:00:00Z')).toBe('in 5 Stunden');
  });

  it('reads as "in 1 Tag" for about a day away', () => {
    expect(relativeDayLabel('2024-03-08T13:00:00Z')).toBe('in 1 Tag');
  });

  it('reads as "in N Tagen" for multiple days away', () => {
    expect(relativeDayLabel('2024-03-10T12:00:00Z')).toBe('in 3 Tagen');
  });
});

describe('age', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-03-07T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null for a null birthdate', () => {
    expect(age(null)).toBeNull();
  });

  it('returns null for an invalid birthdate', () => {
    expect(age('not-a-date')).toBeNull();
  });

  it('counts a birthday that already passed this year', () => {
    expect(age('1990-01-01')).toBe(34);
  });

  it('does not count a birthday that has not happened yet this year', () => {
    expect(age('1990-12-31')).toBe(33);
  });

  it('handles a birthday exactly today', () => {
    expect(age('1990-03-07')).toBe(34);
  });
});

describe('minutes', () => {
  it('floors up to 1 minute for anything under 60 seconds', () => {
    expect(minutes(0)).toBe('1 Min.');
    expect(minutes(30)).toBe('1 Min.');
  });

  it('rounds to the nearest minute above 1', () => {
    expect(minutes(90)).toBe('2 Min.');
    expect(minutes(150)).toBe('3 Min.');
  });
});

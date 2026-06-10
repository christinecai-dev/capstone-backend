const { expect } = require('chai');
const { calculateShowPlannerTimes } = require('../utils/showPlanner');

describe('calculateShowPlannerTimes', () => {
  it('calculates the show day planner timeline from a show time', () => {
    const result = calculateShowPlannerTimes({
      showTime: '2026-06-10T10:30:00.000Z',
      driveTimeMinutes: 45,
      tackUpMinutes: 25,
      warmupMinutes: 30,
      bufferMinutes: 15,
    });

    expect(result.showTime.toISOString()).to.equal('2026-06-10T10:30:00.000Z');
    expect(result.warmupStartTime.toISOString()).to.equal('2026-06-10T10:00:00.000Z');
    expect(result.tackUpStartTime.toISOString()).to.equal('2026-06-10T09:35:00.000Z');
    expect(result.arrivalTime.toISOString()).to.equal('2026-06-10T09:20:00.000Z');
    expect(result.leaveBarnTime.toISOString()).to.equal('2026-06-10T08:35:00.000Z');
  });

  it('returns unchanged times when all prep durations are zero', () => {
    const result = calculateShowPlannerTimes({
      showTime: '2026-06-10T10:30:00.000Z',
      driveTimeMinutes: 0,
      tackUpMinutes: 0,
      warmupMinutes: 0,
      bufferMinutes: 0,
    });

    expect(result.leaveBarnTime.toISOString()).to.equal('2026-06-10T10:30:00.000Z');
    expect(result.arrivalTime.toISOString()).to.equal('2026-06-10T10:30:00.000Z');
    expect(result.tackUpStartTime.toISOString()).to.equal('2026-06-10T10:30:00.000Z');
    expect(result.warmupStartTime.toISOString()).to.equal('2026-06-10T10:30:00.000Z');
  });

  it('throws when showTime is invalid', () => {
    expect(() =>
      calculateShowPlannerTimes({
        showTime: 'not-a-date',
        driveTimeMinutes: 45,
        tackUpMinutes: 25,
        warmupMinutes: 30,
        bufferMinutes: 15,
      })
    ).to.throw('showTime must be a valid date.');
  });
});

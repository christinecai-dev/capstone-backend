function subtractMinutes(date, minutes) {
  return new Date(date.getTime() - minutes * 60 * 1000);
}

function calculateShowPlannerTimes({
  showTime,
  driveTimeMinutes,
  tackUpMinutes,
  warmupMinutes,
  bufferMinutes,
}) {
  const normalizedShowTime = new Date(showTime);

  if (Number.isNaN(normalizedShowTime.getTime())) {
    throw new Error('showTime must be a valid date.');
  }

  const warmupStartTime = subtractMinutes(normalizedShowTime, warmupMinutes);
  const tackUpStartTime = subtractMinutes(warmupStartTime, tackUpMinutes);
  const arrivalTime = subtractMinutes(tackUpStartTime, bufferMinutes);
  const leaveBarnTime = subtractMinutes(arrivalTime, driveTimeMinutes);

  return {
    showTime: normalizedShowTime,
    leaveBarnTime,
    arrivalTime,
    tackUpStartTime,
    warmupStartTime,
  };
}

module.exports = {
  calculateShowPlannerTimes,
};

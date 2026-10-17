/**
 * Date helper utilities for library loan calculations
 */

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + Number(days));
  return result;
};

/**
 * Calculates how many days overdue a return is.
 * @param {Date|string} dueDate 
 * @param {Date|string} returnDate 
 * @returns {number} number of days late (0 if not late)
 */
const calculateDaysLate = (dueDate, returnDate = new Date()) => {
  const due = new Date(dueDate);
  const actual = new Date(returnDate);

  // Set times to midnight to calculate full calendar day differences
  due.setHours(0, 0, 0, 0);
  actual.setHours(0, 0, 0, 0);

  const diffTime = actual.getTime() - due.getTime();
  if (diffTime <= 0) {
    return 0;
  }

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Calculates fine amount based on days late and rate per day.
 * @param {number} daysLate 
 * @param {number} ratePerDay 
 * @returns {number}
 */
const calculateFine = (daysLate, ratePerDay = 1000) => {
  if (daysLate <= 0) return 0;
  return daysLate * Number(ratePerDay);
};

module.exports = {
  addDays,
  calculateDaysLate,
  calculateFine,
};

export function dateToHHMMSS(date) {
  // Options for formatting
  let options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

  // Formatted time string
  return date.toLocaleTimeString('en-GB', options);
}
export function timeToHHMMSS(time) {
  const seconds = Math.floor((time / 1000) % 60);
  const minutes = Math.floor((time / (1000 * 60)) % 60);
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return formattedTime;
}
export function isPatternValid(pattern) {
  try {
    new RegExp(pattern);
    return true;
  } catch (e) {
    return e;
  }
}
export function assertType(variable, expectedType) {
  const actualType = typeof variable;

  if (actualType !== expectedType) {
    throw new TypeError(`Expected type ${expectedType} but got ${actualType}`);
  }
}

export function assertInstance(variable, expectedClass) {
  const actualClass = variable.constructor.name;

  if (!(variable instanceof expectedClass)) {
    throw new TypeError(`Expected instance of ${expectedClass.name} but got ${actualClass}`);
  }
}

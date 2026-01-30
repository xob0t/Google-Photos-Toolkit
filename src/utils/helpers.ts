export function dateToHHMMSS(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return date.toLocaleTimeString('en-GB', options);
}

export function timeToHHMMSS(time: number): string {
  const seconds = Math.floor((time / 1000) % 60);
  const minutes = Math.floor((time / (1000 * 60)) % 60);
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return formattedTime;
}

export function isPatternValid(pattern: string): true | Error {
  try {
    new RegExp(pattern);
    return true;
  } catch (e) {
    return e as Error;
  }
}

export function assertType(variable: unknown, expectedType: string): void {
  const actualType = typeof variable;
  if (actualType !== expectedType) {
    throw new TypeError(`Expected type ${expectedType} but got ${actualType}`);
  }
}

export function assertInstance(variable: unknown, expectedClass: new (...args: unknown[]) => unknown): void {
  if (!(variable instanceof expectedClass)) {
    const actualClass = (variable as object)?.constructor?.name ?? typeof variable;
    throw new TypeError(`Expected instance of ${expectedClass.name} but got ${actualClass}`);
  }
}

/** Defer execution to prevent UI blocking */
export function defer<T>(fn: () => T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(fn()), 0));
}

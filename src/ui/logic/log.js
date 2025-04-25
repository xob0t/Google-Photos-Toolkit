import { dateToHHMMSS } from '../../utils/helpers.js';

export default function log(logMessage, type = null) {
  const logPrefix = '[GPTK]';

  const now = new Date();
  const timestamp = dateToHHMMSS(now);

  // Create a new div for the log message
  const logDiv = document.createElement('div');
  logDiv.textContent = `[${timestamp}] ${logMessage}`;

  // Only add class if it's a valid class name (no spaces)
  if (type && !type.includes(' ')) {
    logDiv.classList.add(type);
  } else if (type) {
    // If type contains spaces, use 'error' as the class and keep the full message in the text
    logDiv.classList.add('error');
    logDiv.textContent = `[${timestamp}] Error: ${logMessage}`;
  }

  console.log(`${logPrefix} [${timestamp}] ${logMessage}`);

  // Append the log message to the log container
  try {
    const logContainer = document.querySelector('#logArea');
    logContainer.appendChild(logDiv);
    if (document.querySelector('#autoScroll').checked) logDiv.scrollIntoView();
  } catch (error) {
    console.error(`${logPrefix} [${timestamp}] ${error}`);
  }
}

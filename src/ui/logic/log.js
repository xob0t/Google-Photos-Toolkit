export default function log(logMessage, type = null) {
  const logPrefix = '[GPTK]';
  // Create a new div for the log message
  const logDiv = document.createElement('div');
  logDiv.textContent = logMessage;

  if (type) logDiv.classList.add(type);
  console.log(`${logPrefix} ${logMessage}`);

  // Append the log message to the log container
  try {
    const logContainer = document.querySelector('#logArea');
    logContainer.appendChild(logDiv);
    if (document.querySelector('#autoScroll').checked) logDiv.scrollIntoView();
  } catch (error) {
    console.error(`${logPrefix} ${error}`);
  }
}

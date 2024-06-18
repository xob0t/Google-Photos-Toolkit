import log from '../logic/log.js';
import { core } from '../../globals.js';

export default function controlButttonsListeners() {
  const clearLogButton = document.getElementById('clearLog');
  clearLogButton.addEventListener('click', clearLog);
  const stopProcessButton = document.getElementById('stopProcess');
  stopProcessButton.addEventListener('click', stopProcess);
}

function clearLog() {
  const logContainer = document.getElementById('logArea');
  const logElements = Array.from(logContainer.childNodes);
  for (const logElement of logElements) {
    logElement.remove();
  }
}

function stopProcess() {
  log('Stopping the process');
  core.isProcessRunning = false;
}

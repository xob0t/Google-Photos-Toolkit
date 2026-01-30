import log from './log';
import { core } from '../../globals';

// Fixed typo: was "controlButttonsListeners" (triple-t)
export default function controlButtonsListeners(): void {
  const clearLogButton = document.getElementById('clearLog');
  clearLogButton?.addEventListener('click', clearLog);
  const stopProcessButton = document.getElementById('stopProcess');
  stopProcessButton?.addEventListener('click', stopProcess);
}

function clearLog(): void {
  const logContainer = document.getElementById('logArea');
  if (logContainer) {
    const logElements = Array.from(logContainer.childNodes);
    for (const logElement of logElements) {
      logElement.remove();
    }
  }
}

function stopProcess(): void {
  log('Stopping the process');
  core.isProcessRunning = false;
}

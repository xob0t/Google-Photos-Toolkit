import { showMainMenu } from './insert-ui';

export default function registerMenuCommand(): void {
  GM_registerMenuCommand('Open GPTK window', function () {
    showMainMenu();
  });
}

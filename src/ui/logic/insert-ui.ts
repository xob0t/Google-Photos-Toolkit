import gptkMainTemplate from '../markup/gptk-main-template.html';
import buttonHtml from '../markup/gptk-button.html';
import css from '../markup/style.css';
import { updateUI } from './update-state';

const version = `v${__VERSION__}`;
const homepage = __HOMEPAGE__;

function htmlTemplatePrep(template: string): string {
  return template.replace('%version%', version).replace('%homepage%', homepage);
}

export function insertUi(): void {
  // For inserting HTML to work with Trusted Types
  const win = window as unknown as { trustedTypes?: { createPolicy: (name: string, policy: { createHTML: (s: string) => string }) => void } };
  if (win.trustedTypes?.createPolicy) {
    win.trustedTypes.createPolicy('default', {
      createHTML: (s: string) => s,
    });
  }
  // HTML
  let buttonInsertLocation = '.J3TAe';
  if (window.location.href.includes('lockedfolder')) buttonInsertLocation = '.c9yG5b';
  document.querySelector(buttonInsertLocation)?.insertAdjacentHTML('afterbegin', htmlTemplatePrep(buttonHtml));
  document.body.insertAdjacentHTML('afterbegin', htmlTemplatePrep(gptkMainTemplate));
  // CSS
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  baseListenersSetUp();
}

export function showMainMenu(): void {
  const overlay = document.querySelector<HTMLElement>('.overlay');
  const gptk = document.getElementById('gptk');
  if (gptk) gptk.style.display = 'flex';
  if (overlay) overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function hideMainMenu(): void {
  const overlay = document.querySelector<HTMLElement>('.overlay');
  const gptk = document.getElementById('gptk');
  if (gptk) gptk.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = 'visible';
}

function baseListenersSetUp(): void {
  document.addEventListener('change', updateUI);

  const gptkButton = document.getElementById('gptk-button');
  gptkButton?.addEventListener('click', showMainMenu);
  const exitMenuButton = document.querySelector('#hide');
  exitMenuButton?.addEventListener('click', hideMainMenu);
}

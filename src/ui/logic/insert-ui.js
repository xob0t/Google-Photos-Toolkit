import gptkMainTemplate from '../markup/gptk-main-template.html';
import buttonHtml from '../markup/gptk-button.html';
import css from '../markup/style.css';
import { updateUI } from './update-state.js';

// eslint-disable-next-line no-undef
const version = `v${__VERSION__}`;
// eslint-disable-next-line no-undef
const homepage = __HOMEPAGE__;

function htmlTemplatePrep(gptkMainTemplate){
  return gptkMainTemplate
    .replace('%version%', version)
    .replace('%homepage%', homepage);
}

export function insertUi() {
  // for inserting html to work
  if (window.trustedTypes && window.trustedTypes.createPolicy) {
    window.trustedTypes.createPolicy('default', {
      createHTML: (string) => string
    });
  }
  // html
  let buttonInsertLocation = '.J3TAe';
  if(window.location.href.includes('lockedfolder')) buttonInsertLocation = '.c9yG5b';
  document.querySelector(buttonInsertLocation).insertAdjacentHTML('afterbegin', buttonHtml);
  document.body.insertAdjacentHTML('afterbegin', htmlTemplatePrep(gptkMainTemplate));
  // css
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  baseListenersSetUp();
}

function showMainMenu() {
  const overlay = document.querySelector('.overlay');
  document.getElementById('gptk').style.display = 'flex';
  overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function hideMainMenu() {
  const overlay = document.querySelector('.overlay');
  document.getElementById('gptk').style.display = 'none';
  overlay.style.display = 'none';
  document.body.style.overflow = 'visible';
}

function baseListenersSetUp(){
  document.addEventListener('change', updateUI);

  const gptkButton = document.getElementById('gptk-button');
  gptkButton.addEventListener('click', showMainMenu);
  const exitMenuButton = document.querySelector('#hide');
  exitMenuButton.addEventListener('click', hideMainMenu);
}
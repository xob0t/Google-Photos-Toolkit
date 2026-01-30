export function disableActionBar(disabled: boolean): void {
  const actions = document.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>('.action-bar button, .action-bar input, .action-bar select');
  for (const action of actions) {
    action.disabled = disabled;
  }
}

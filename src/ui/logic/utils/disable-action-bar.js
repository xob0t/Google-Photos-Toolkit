export function disableActionBar(disabled) {
  const actions = document.querySelectorAll('.action-bar *');
  for (const action of actions) {
    action.disabled = disabled;
  }
}
import { updateUI } from './update-state.js';
export default async function filterListenersSetUp() {
  function resetDateInput() {
    let parent = this.parentNode;
    let closestSelect = parent.querySelector('input');
    closestSelect.value = '';
    updateUI();
  }
  function toggleClicked() {
    this.classList.add('clicked');
    setTimeout(() => {
      this.classList.remove('clicked');
    }, 500);
  }

  function resetAllFilters() {
    document.querySelector('.filters-form').reset();
    updateUI();
  }

  const resetDateButtons = document.querySelectorAll('[name="dateReset"]');
  for (const resetButton of resetDateButtons) {
    resetButton?.addEventListener('click', resetDateInput);
  }

  // reset all filters button

  const filterResetButton = document.querySelector('#filterResetButton');
  filterResetButton.addEventListener('click', resetAllFilters);

  // date reset button animation
  const dateResets = document.querySelectorAll('.date-reset');
  for (const reset of dateResets) {
    reset?.addEventListener('click', toggleClicked);
  }
}

import { updateUI } from './update-state';

export default function filterListenersSetUp(): void {
  function resetDateInput(this: HTMLElement): void {
    const parent = this.parentNode as HTMLElement | null;
    const closestInput = parent?.querySelector('input') as HTMLInputElement | null;
    if (closestInput) closestInput.value = '';
    updateUI();
  }

  function toggleClicked(this: HTMLElement): void {
    this.classList.add('clicked');
    setTimeout(() => {
      this.classList.remove('clicked');
    }, 500);
  }

  function resetAllFilters(): void {
    const form = document.querySelector<HTMLFormElement>('.filters-form');
    form?.reset();
    updateUI();
  }

  const resetDateButtons = document.querySelectorAll('[name="dateReset"]');
  for (const resetButton of resetDateButtons) {
    resetButton?.addEventListener('click', resetDateInput as EventListener);
  }

  // Reset all filters button
  const filterResetButton = document.querySelector('#filterResetButton');
  filterResetButton?.addEventListener('click', resetAllFilters);

  // Date reset button animation
  const dateResets = document.querySelectorAll('.date-reset');
  for (const reset of dateResets) {
    reset?.addEventListener('click', toggleClicked as EventListener);
  }
}

import { updateUI } from './update-state';
import type { Album } from '../../types';

export function addAlbums(albums: Album[]): void {
  function addAlbumsAsOptions(
    albums: Album[],
    albumSelects: NodeListOf<HTMLSelectElement> | HTMLSelectElement[],
    addEmpty = false
  ): void {
    for (const albumSelect of albumSelects) {
      if (!albums?.length) {
        const option = document.createElement('option');
        option.textContent = 'No Albums';
        option.value = '';
        albumSelect.appendChild(option);
        continue;
      }
      for (const album of albums) {
        if (parseInt(String(album.itemCount ?? 0)) === 0 && !addEmpty) continue;
        const option = document.createElement('option');
        option.value = album.mediaKey;
        option.title = `Name: ${album.title}\nItems: ${album.itemCount}`;
        option.textContent = album.title ?? '';
        if (album.isShared) option.classList.add('shared');
        albumSelect.appendChild(option);
      }
    }
  }

  function emptySelects(albumSelects: HTMLSelectElement[]): void {
    for (const albumSelect of albumSelects) {
      while (albumSelect.options.length > 0) {
        albumSelect.remove(0);
      }
    }
    updateUI();
  }

  const albumSelectsMultiple = document.querySelectorAll<HTMLSelectElement>('.albums-select[multiple]');
  const albumSelectsSingle = document.querySelectorAll<HTMLSelectElement>('.dropdown.albums-select');
  const albumSelects = [...albumSelectsMultiple, ...albumSelectsSingle];

  emptySelects(albumSelects);

  for (const select of albumSelectsSingle) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Select Album';
    select.appendChild(option);
  }

  addAlbumsAsOptions(albums, Array.from(albumSelectsSingle), true);
  addAlbumsAsOptions(albums, Array.from(albumSelectsMultiple), false);
}

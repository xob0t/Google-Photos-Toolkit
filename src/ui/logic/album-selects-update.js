import { updateUI } from './update-state.js';
export function addAlbums(albums) {
  function addAlbumsAsOptions(albums, albumSelects, addEmpty = false) {
    for (const albumSelect of albumSelects) {
      if (!albums?.length) {
        const option = document.createElement('option');
        option.textContent = 'No Albums';
        option.value = '';
        albumSelect.appendChild(option);
        continue;
      }
      for (const album of albums) {
        if (parseInt(album.itemCount) === 0 && !addEmpty) continue;
        const option = document.createElement('option');
        option.value = album.productId;
        option.title = `Name: ${album.name}\nItems: ${album.itemCount}`;
        option.textContent = album.name;
        if (album.isShared) option.classList.add('shared');
        albumSelect.appendChild(option);
      }
    }
  }
  function emptySelects(albumSelects) {
    for (const albumSelect of albumSelects) {
      while (albumSelect.options.length > 0) {
        albumSelect.remove(0);
      }
    }
    updateUI();
  }
  const albumSelectsMultiple = document.querySelectorAll('.albums-select[multiple]');
  const albumSelectsSingle = document.querySelectorAll('.dropdown.albums-select');
  const albumSelects = [...albumSelectsMultiple, ...albumSelectsSingle];

  emptySelects(albumSelects);

  for (const select of albumSelectsSingle) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Select Album';
    select.appendChild(option);
  }

  addAlbumsAsOptions(albums, albumSelectsSingle, true);
  addAlbumsAsOptions(albums, albumSelectsMultiple, false);
}

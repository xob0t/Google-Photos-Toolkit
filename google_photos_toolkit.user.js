// ==UserScript==
// @name        Google Photos Toolkit
// @description Bulk organize your media
// @version     2.0.0-dev
// @author      xob0t
// @homepageURL https://github.com/xob0t/Google-Photos-Toolkit#readme
// @supportURL  https://github.com/xob0t/Google-Photos-Toolkit/discussions
// @match       *://photos.google.com/*
// @license     MIT
// @namespace   https://github.com/xob0t/Google-Photos-Toolkit
// @icon        https://raw.githubusercontent.com/xob0t/Google-Photos-Toolkit/main/media/icon.png
// @downloadURL https://github.com/xob0t/Google-Photos-Toolkit/releases/latest/download/google_photos_toolkit.user.js
// @run-at      body
// @grant       none
// @noframes    
// ==/UserScript==
(function () {
  'use strict';

  var gptkMainTemplate = (`
<div class="overlay"></div>
<div id="gptk" class="container">
  <div class="header">
    <div class="header-info">
      <div class="header-text">Google Photos Toolkit</div>
    </div>

    <div id="hide">
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
      </svg>
    </div>
  </div>
  <hr>
  <div class="sources">
    <div class="source">
      <input type="radio" name="source" id="library" class="sourceHeaderInput" checked="checked">
      <label class="sourceHeader" for="library">
        <svg width="24px" height="24px">
          <path
            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z">
          </path>
        </svg>Library</label>
    </div>
    <div class="source">
      <input type="radio" name="source" id="search" class="sourceHeaderInput">
      <label class="sourceHeader" for="search">
        <svg width="24px" height="24px" viewBox="0 0 24 24">
          <path
            d="M20.49 19l-5.73-5.73C15.53 12.2 16 10.91 16 9.5A6.5 6.5 0 1 0 9.5 16c1.41 0 2.7-.47 3.77-1.24L19 20.49 20.49 19zM5 9.5C5 7.01 7.01 5 9.5 5S14 7.01 14 9.5 11.99 14 9.5 14 5 11.99 5 9.5z">
          </path>
        </svg>Search</label>
    </div>
    <div class="source">
      <input type="radio" name="source" id="albums" class="sourceHeaderInput">
      <label class="sourceHeader" for="albums">
        <svg width="24px" height="24px">
          <path
            d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h6v7l2.5-1.88L17 11V4h1v16zm-4.33-6L17 18H7l2.5-3.2 1.67 2.18 2.5-2.98z">
          </path>
        </svg>Albums</label>
    </div>
    <div class="source">
      <input type="radio" name="source" id="sharedLinks" class="sourceHeaderInput">
      <label class="sourceHeader" for="sharedLinks">
        <svg width="24px" height="24px">
          <path
            d="M17 7h-4v2h4c1.65 0 3 1.35 3 3s-1.35 3-3 3h-4v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5zm-6 8H7c-1.65 0-3-1.35-3-3s1.35-3 3-3h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-2zm-3-4h8v2H8z">
          </path>
        </svg>Shared Links</label>
    </div>
    <div class="source">
      <input type="radio" name="source" id="favorites" class="sourceHeaderInput">
      <label class="sourceHeader" for="favorites">
        <svg width="24px" height="24px">
          <path
            d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z">
          </path>
        </svg>Favorites</label>
    </div>
    <div class="source">
      <input type="radio" name="source" id="trash" class="sourceHeaderInput">
      <label class="sourceHeader" for="trash">
        <svg width="24px" height="24px">
          <path
            d="M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h1V4h-5zm2 15H7V6h10v13zM9 8h2v9H9zm4 0h2v9h-2z">
          </path>
        </svg>Trash</label>
    </div>
    <div class="source">
      <input type="radio" name="source" id="lockedFolder" class="sourceHeaderInput">
      <label class="sourceHeader" for="lockedFolder">
        <svg width="24px" height="24px">
          <path
            d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z">
          </path>
        </svg>Locked Folder</label>
    </div>

  </div>
  <hr>
  <div class="action-bar">
    <div class="action-buttons">
      <button id="showExistingAlbumForm" title="Add To Existing Album">Add To Existing Album</button>
      <button id="showNewAlbumForm" title="Add To New Album">Add To New Album</button>
      <button type="button" id="toTrash" title="Move To Trash">Move to Trash</button>
      <button type="button" id="restoreTrash" title="Restore From Trash">Restore From Trash</button>
      <button type="button" id="toArchive" title="Move ToArchive">Archive</button>
      <button type="button" id="unArchive" title="Remove From Archive">Un-Archive</button>
      <button type="button" id="toFavorite" title="Set Favorite">Favorite</button>
      <button type="button" id="unFavorite" title="Removed From Favorites">Un-Favorite</button>
      <button type="button" id="lock" title="Move to Locked Folder">Move to Locked Folder</button>
      <button type="button" id="unLock" title="Move out of Locked Folder">Move out of Locked Folder</button>
    </div>

    <div class="to-existing-container">
      <form id="toExistingAlbum" class="flex" title="Add To Existing Album">
        <div class="refresh-albums svg-container" title="Refresh Albums">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
            <path
              d="M482-160q-134 0-228-93t-94-227v-7l-64 64-56-56 160-160 160 160-56 56-64-64v7q0 100 70.5 170T482-240q26 0 51-6t49-18l60 60q-38 22-78 33t-82 11Zm278-161L600-481l56-56 64 64v-7q0-100-70.5-170T478-720q-26 0-51 6t-49 18l-60-60q38-22 78-33t82-11q134 0 228 93t94 227v7l64-64 56 56-160 160Z" />
          </svg>
        </div>
        <select id="existingAlbum" class="dropdown albums-select" name="targetAlbumIdExisting" required>
          <option value="">Press Refresh</option>
        </select>
        <button type="submit" title="Add To Existing Album">Submit</button>
      </form>
      <button class="return" title="Back to Actions">
        Return
      </button>
    </div>
    <div class="to-new-container">
      <form id="toNewAlbum" class="flex" title="Add To A New Album">
        <input id="newAlbumName" type="text" placeholder="Enter Album Name" required>
        <button type="submit" title="Add To A New Album">Submit</button>
      </form>
      <button class="return" title="Back to Actions">
        Return
      </button>
    </div>
  </div>
  <hr>
  <div class="window-body">
    <div class="sidebar scroll">
      <form class="filters-form">
        <div class="sidebar-top">
          <div class="flex centered" title="Reset all filters" id="filterResetButton">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
              <path
                d="M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z" />
            </svg>
            Reset Filters
          </div>
        </div>
        <details open class="include-albums">
          <summary>Select Albums</summary>
          <fieldset>
            <select size="5" multiple="multiple" class="select-multiple albums-select scroll" name="albumsInclude" required>
              <option value="" title="First Album">Press Refresh</option>
            </select>
            <div class="select-control-buttons-row">
              <div class="refresh-albums svg-container" title="Refresh Albums">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                  <path
                    d="M482-160q-134 0-228-93t-94-227v-7l-64 64-56-56 160-160 160 160-56 56-64-64v7q0 100 70.5 170T482-240q26 0 51-6t49-18l60 60q-38 22-78 33t-82 11Zm278-161L600-481l56-56 64 64v-7q0-100-70.5-170T478-720q-26 0-51 6t-49 18l-60-60q38-22 78-33t82-11q134 0 228 93t94 227v7l64-64 56 56-160 160Z">
                  </path>
                </svg>
              </div>
              <button type="button" name="selectAll">Select All</button>
              <button type="button" name="resetAlbumSelection">Reset Selection</button>
            </div>
            <div class="select-control-buttons-row">
              <button type="button" name="selectShared">Select Shared</button>
              <button type="button" name="selectNonShared">Select Non-Shared</button>
            </div>
          </fieldset>
        </details>
        <details open class="search">
          <summary>Search</summary>
          <fieldset>
            <label class="form-control">
              <legend>Search Query:</legend>
              <input name="searchQuery" value="" type="input" placeholder="Search Query" required>
            </label>
          </fieldset>
        </details>
        <details class="exclude-albums">
          <summary>Exclude Albums</summary>
          <fieldset>
            <select size="5" multiple="multiple" class="select-multiple albums-select scroll" name="albumsExclude">
              <option value="" title="First Album">Press Refresh</option>
            </select>
            <div class="select-control-buttons-row">
              <div class="refresh-albums svg-container" title="Refresh Albums">
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                  <path
                    d="M482-160q-134 0-228-93t-94-227v-7l-64 64-56-56 160-160 160 160-56 56-64-64v7q0 100 70.5 170T482-240q26 0 51-6t49-18l60 60q-38 22-78 33t-82 11Zm278-161L600-481l56-56 64 64v-7q0-100-70.5-170T478-720q-26 0-51 6t-49 18l-60-60q38-22 78-33t82-11q134 0 228 93t94 227v7l64-64 56 56-160 160Z">
                  </path>
                </svg>
              </div>
              <button type="button" name="selectAll">Select All</button>
              <button type="button" name="resetAlbumSelection">Reset Selection</button>
            </div>
            <div class="select-control-buttons-row">
              <button type="button" name="selectShared">Select Shared</button>
              <button type="button" name="selectNonShared">Select Non-Shared</button>
            </div>
          </fieldset>
        </details>
        <details class="date-interval">
          <summary>Date Interval</summary>
          <fieldset>
            <legend>From:</legend>
            <div class="flex centered input-wrapper">
              <input type="datetime-local" name="lowerBoundaryDate">
              <div class="date-reset flex centered" title="Reset Input" name="dateReset">
                <!-- https://www.svgrepo.com/svg/436706/clear-fill -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56">
                  <path
                    d="M 13.7851 49.5742 L 42.2382 49.5742 C 47.1366 49.5742 49.5743 47.1367 49.5743 42.3086 L 49.5743 13.6914 C 49.5743 8.8633 47.1366 6.4258 42.2382 6.4258 L 13.7851 6.4258 C 8.9101 6.4258 6.4257 8.8398 6.4257 13.6914 L 6.4257 42.3086 C 6.4257 47.1602 8.9101 49.5742 13.7851 49.5742 Z M 19.6913 38.3711 C 18.5429 38.3711 17.5820 37.4336 17.5820 36.2852 C 17.5820 35.7461 17.8163 35.2305 18.2382 34.8086 L 25.0351 27.9649 L 18.2382 21.1445 C 17.8163 20.7227 17.5820 20.2071 17.5820 19.6680 C 17.5820 18.4961 18.5429 17.5352 19.6913 17.5352 C 20.2539 17.5352 20.7460 17.7461 21.1679 18.1680 L 28.0117 25.0118 L 34.8554 18.1680 C 35.2539 17.7461 35.7695 17.5352 36.3085 17.5352 C 37.4804 17.5352 38.4413 18.4961 38.4413 19.6680 C 38.4413 20.2071 38.2070 20.7227 37.7851 21.1445 L 30.9648 27.9649 L 37.7851 34.8086 C 38.2070 35.2305 38.4413 35.7461 38.4413 36.2852 C 38.4413 37.4336 37.4804 38.3711 36.3085 38.3711 C 35.7695 38.3711 35.2539 38.1602 34.8788 37.7852 L 28.0117 30.8945 L 21.1444 37.7852 C 20.7460 38.1602 20.2773 38.3711 19.6913 38.3711 Z" />
                </svg>
              </div>
            </div>
            <legend>To:</legend>
            <div class="flex centered input-wrapper">
              <input type="datetime-local" name="higherBoundaryDate">
              <div class="date-reset flex centered" title="Reset Input" name="dateReset">
                <!-- https://www.svgrepo.com/svg/436706/clear-fill -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56">
                  <path
                    d="M 13.7851 49.5742 L 42.2382 49.5742 C 47.1366 49.5742 49.5743 47.1367 49.5743 42.3086 L 49.5743 13.6914 C 49.5743 8.8633 47.1366 6.4258 42.2382 6.4258 L 13.7851 6.4258 C 8.9101 6.4258 6.4257 8.8398 6.4257 13.6914 L 6.4257 42.3086 C 6.4257 47.1602 8.9101 49.5742 13.7851 49.5742 Z M 19.6913 38.3711 C 18.5429 38.3711 17.5820 37.4336 17.5820 36.2852 C 17.5820 35.7461 17.8163 35.2305 18.2382 34.8086 L 25.0351 27.9649 L 18.2382 21.1445 C 17.8163 20.7227 17.5820 20.2071 17.5820 19.6680 C 17.5820 18.4961 18.5429 17.5352 19.6913 17.5352 C 20.2539 17.5352 20.7460 17.7461 21.1679 18.1680 L 28.0117 25.0118 L 34.8554 18.1680 C 35.2539 17.7461 35.7695 17.5352 36.3085 17.5352 C 37.4804 17.5352 38.4413 18.4961 38.4413 19.6680 C 38.4413 20.2071 38.2070 20.7227 37.7851 21.1445 L 30.9648 27.9649 L 37.7851 34.8086 C 38.2070 35.2305 38.4413 35.7461 38.4413 36.2852 C 38.4413 37.4336 37.4804 38.3711 36.3085 38.3711 C 35.7695 38.3711 35.2539 38.1602 34.8788 37.7852 L 28.0117 30.8945 L 21.1444 37.7852 C 20.7460 38.1602 20.2773 38.3711 19.6913 38.3711 Z" />
                </svg>
              </div>
            </div>
            <hr>
            <div class="form-control">
              <label class="form-control">
                <input name="intervalType" type="radio" value="include" checked="checked">
                <span>Include Interval</span>
              </label>
              <label class="form-control">
                <input name="intervalType" type="radio" value="exclude">
                <span>Exclude Interval</span>
              </label>
            </div>
            <hr>
            <div class="form-control">
              <label class="form-control">
                <input name="dateType" type="radio" value="taken" checked="checked">
                <span>Date Taken</span>
              </label>
              <label class="form-control">
                <input name="dateType" type="radio" value="uploaded">
                <span>Date Uploaded</span>
              </label>
            </div>
          </fieldset>
        </details>
        <details class="filename">
          <summary>Filename</summary>
          <fieldset>
            <label class="form-control">
              <legend>Regex:</legend>
              <input name="fileNameRegex" value="" type="input" placeholder="Regex">
            </label>
            <label class="form-control">
              <input name="fileNameMatchType" value="include" type="radio" checked="checked">
              Include</label>
            <label class="form-control">
              <input name="fileNameMatchType" value="exclude" type="radio">
              Exclude
            </label>
          </fieldset>
        </details>
        <details class="description">
          <summary>Description</summary>
          <fieldset>
            <label class="form-control">
              <legend>Regex:</legend>
              <input name="descriptionRegex" value="" type="input" placeholder="Regex">
            </label>
            <label class="form-control">
              <input name="descriptionMatchType" value="include" type="radio" checked="checked">
              Include</label>
            <label class="form-control">
              <input name="descriptionMatchType" value="exclude" type="radio">
              Exclude
            </label>
          </fieldset>
        </details>
        <details class="space">
          <summary>Space</summary>
          <fieldset>
            <label class="form-control">
              <input name="space" value="" type="radio" checked="checked">
              Any </label>
            <label class="form-control">
              <input name="space" value="consuming" type="radio">
              Space-Consuming </label>
            <label class="form-control">
              <input name="space" value="non-consuming" type="radio">
              Not Space-Consuming
            </label>
          </fieldset>
        </details>
        <details class="size">
          <summary>Size</summary>
          <fieldset>
            <legend>More Than</legend>
            <div class="input-wrapper">
              <input name="lowerBoundarySize" type="number" placeholder="Bytes">
            </div>
            <legend>Less Than</legend>
            <div class="input-wrapper">
              <input name="higherBoundarySize" type="number" placeholder="Bytes">
            </div>
          </fieldset>
        </details>
        <details class="quality">
          <summary>Quality</summary>
          <fieldset>
            <label class="form-control">
              <input name="quality" value="" type="radio" checked="checked">
              Any </label>
            <label class="form-control">
              <input name="quality" value="original" type="radio">
              Original </label>
            <label class="form-control">
              <input name="quality" value="storage-saver" type="radio">
              Storage Saver
            </label>
          </fieldset>
        </details>
        <details class="type">
          <summary>Type</summary>
          <fieldset>
            <label class="form-control">
              <input name="type" value="" type="radio" checked="checked">
              Any </label>
            <label class="form-control">
              <input name="type" value="image" type="radio">
              Image </label>
            <label class="form-control">
              <input name="type" value="video" type="radio">
              Video
            </label>
          </fieldset>
        </details>
        <details class="archive">
          <summary>Archived</summary>
          <fieldset>
            <label class="form-control">
              <input name="archived" value="" type="radio" checked="checked">
              Any
            </label>
            <label class="form-control">
              <input name="archived" value="true" type="radio">
              Archived
            </label>
            <label class="form-control">
              <input name="archived" value="false" type="radio">
              Not Archived
            </label>
          </fieldset>
        </details>
        <details class="owned">
          <summary>Ownership</summary>
          <fieldset>
            <label class="warning">Experimental!</label>
          <label class="form-control">
            <input name="owned" value="" type="radio" checked="checked">
            Any
          </label>
          <label class="form-control">
            <input name="owned" value="true" type="radio">
            Owned
          </label>
          <label class="form-control">
            <input name="owned" value="false" type="radio">
            Not Owned
          </label>
          </fieldset>
        </details>
        <details class="favorite">
          <summary>Favorite</summary>
          <fieldset>
          <label class="form-control">
            <input name="favorite" value="" type="radio" checked="checked">
            Any
          </label>
          <label class="form-control">
            <input name="favorite" value="true" type="radio">
            Favorite
          </label>
          <label class="form-control">
            <input name="favorite" value="false" type="radio">
            Not Favorite
          </label>
          </fieldset>
        </details>
        <hr>
        <fieldset class="exclude-shared">
          <label class="form-control">
            <input name="excludeShared" value="true" type="checkbox">
            Exclude Media With Shared Links
          </label>
        </fieldset>
        <fieldset class="exclude-favorites">
          <label class="form-control">
            <input name="excludeFavorites" value="true" type="checkbox">
            Exclude Favorites
          </label>
        </fieldset>
      </form>
      <form class="settings-form">
        <details class="settings">
          <summary>Advanced Settings</summary>
          <fieldset>
            <legend>
            <label for="ignoreErrors">
              <input name="ignoreErrors" id="ignoreErrors" type="checkbox" >
              Ignore api parsing errors
            </label>
          </legend>
            <legend>Max Concurrent Api Requests</legend>
            <div class="input-wrapper">
              <input name="maxConcurrentApiReq" value="3" min="1" type="number" required>
            </div>
            <legend>Api Operation Batch Size</legend>
            <div class="input-wrapper">
              <input name="operationSize" value="500" max="500" min="1" type="number" required>
            </div>
            <legend>Locked Folder Api Operation Size</legend>
            <div class="input-wrapper">
              <input name="lockedFolderOpSize" value="100" max="100" min="1" type="number" required>
            </div>
            <legend>Bulk Info Api Batch Size</legend>
            <div class="input-wrapper">
              <input name="infoSize" value="5000" max="10000" min="1" type="number" required>
            </div>
            <div class="settings-controls">
              <button name="save" type="submit">Save</button>
              <button name="default">Default</button>
            </div>
          </fieldset>
        </details>
      </form>
    </div>

    <div class="main">
      <div class="filter-preview" title="Filter Preview">
        <span>
          Filter: None
        </span>
      </div>
      <div class="button-container">
        <button id="stopProcess">Stop</button>
        <button id="clearLog">Clear Log</button>
      </div>
      <div id="logArea" class="logarea scroll"></div>
    </div>
  </div>
  <div class="footer">
    <div class="info-container">
      <a class="homepage-link" href="%homepage%" target="_blank">%version%</a>
    </div>
    <div class="auto-scroll-container">
      <input type="checkbox" id="autoScroll" checked="checked">
      <label for="autoScroll"> AUTO SCROLL</label>
    </div>
  </div>
</div>
`);

  var buttonHtml = (`
<div id="gptk-button" class="rxangc Wvu7of">
    <div role="button" class="U26fgb JRtysb WzwrXb YI2CVc G6iPcb m6aMje ML2vC" jsshadow="" aria-label="GPTK"
        aria-disabled="false" tabindex="0" data-tooltip="GPTK" aria-haspopup="true" aria-expanded="false"
        data-dynamic="true" data-alignright="true" data-aligntop="true" data-tooltip-vertical-offset="-12"
        data-tooltip-horizontal-offset="0">
        <span jsslot="" class="MhXXcc oJeWuf">
            <span class="Lw7GHd snByac">
                <!-- https://www.svgrepo.com/svg/435158/spanner -->
                <svg width="24px" height="24px" class="v1262d" viewBox="0 0 17 17" style="fill: #008eff;">
                    <g xmlns="http://www.w3.org/2000/svg" stroke-width="1">
                        <path
                            d="M6.838,11.784 L12.744,5.879 C13.916,6.484 15.311,6.372 16.207,5.477 C16.897,4.786 17.131,3.795 16.923,2.839 L15.401,4.358 L14.045,4.624 L12.404,2.999 L12.686,1.603 L14.195,0.113 C13.24,-0.095 12.248,0.136 11.557,0.827 C10.661,1.723 10.549,3.117 11.155,4.291 L5.249,10.197 C4.076,9.592 2.681,9.705 1.784,10.599 C1.096,11.29 0.862,12.281 1.069,13.236 L2.592,11.717 L3.947,11.452 L5.59,13.077 L5.306,14.473 L3.797,15.963 C4.752,16.17 5.744,15.94 6.434,15.249 C7.33,14.354 7.443,12.958 6.838,11.784 L6.838,11.784 Z">
                        </path>
                    </g>
                </svg>
            </span>
        </span>
    </div>
    <div role="button" class="U26fgb c7fp5b FS4hgd Sn08je oGaYYd m6aMje WNmljc" jsshadow="" aria-label="GPTK"
        aria-disabled="false" tabindex="0" data-tooltip="GPTK" aria-haspopup="true" aria-expanded="false"
        data-dynamic="true" data-alignright="true" data-aligntop="true" data-tooltip-vertical-offset="-12"
        data-tooltip-horizontal-offset="0">
        <span jsslot="" class="I3EnF oJeWuf">
            <span class="NlWrkb snByac">
                <!-- https://www.svgrepo.com/svg/435158/spanner -->
                <svg width="24px" height="24px" class="v1262d" viewBox="0 0 17 19" style="fill: #008eff;">
                    <g xmlns="http://www.w3.org/2000/svg" stroke-width="1">
                        <path
                            d="M6.838,11.784 L12.744,5.879 C13.916,6.484 15.311,6.372 16.207,5.477 C16.897,4.786 17.131,3.795 16.923,2.839 L15.401,4.358 L14.045,4.624 L12.404,2.999 L12.686,1.603 L14.195,0.113 C13.24,-0.095 12.248,0.136 11.557,0.827 C10.661,1.723 10.549,3.117 11.155,4.291 L5.249,10.197 C4.076,9.592 2.681,9.705 1.784,10.599 C1.096,11.29 0.862,12.281 1.069,13.236 L2.592,11.717 L3.947,11.452 L5.59,13.077 L5.306,14.473 L3.797,15.963 C4.752,16.17 5.744,15.94 6.434,15.249 C7.33,14.354 7.443,12.958 6.838,11.784 L6.838,11.784 Z">
                        </path>
                    </g>
                </svg> GPTK</span>
        </span>
    </div>
</div>
`);

  var css = (`
:root {    --color-accent: #0d4574; --color-accent-dark: #202833; --primary-bg-color: #161616; --secondary-bg-color: #1b1b1b; --color-surface-200: #282828; --color-surface-300: #3f3f3f; --color-surface-400: #575757; --color-surface-500: #717171; --color-surface-600: #8b8b8b; --main-text-color: #d3d3d3; --main-text-color-hover: #e2e2e2; --secondary-text-color: #9c9c9c; --footer-color: #323232; --filter-preview-color: #0b0b0c; --warning: #E27070; --exit-button-background:darkred; --success: #53E678; --overlay-filter: blur(4px) brightness(0.5); }.overlay {    position: absolute; display: none; left: 0; top: 0; width: 100%; height: 100%; z-index: 499; backdrop-filter: var(--overlay-filter); }@media only screen and (min-width: 700px) {    .window-body {        display: grid; grid-template-columns: minmax(100px, 320px) minmax(100px, 3fr); }    #gptk .sources .sourceHeader {        font-size: 1.2rem; }}@media only screen and (max-width: 700px) {    .window-body {        display: flex; flex-direction: column-reverse; }    #gptk{        top: 0%!important; bottom: 0%!important; width: 100%!important; .main{            height: auto!important; max-height: 100%!important; }    }}#gptk {    position: fixed; top: 5%; left: 50%; transform: translateX(-50%); width: 90%; bottom: 5%; min-height: 300px; max-width: 1250px; min-width: 300px; z-index: 500; font-family: Helvetica, sans-serif; padding: 0; display: none; flex-direction: column; cursor: default; border-radius: 5px; color-scheme: dark; background-color: var(--primary-bg-color); color: var(--main-text-color); border: none; box-shadow: 0px 10px 10px rgba(0, 0, 0, 0.438); box-sizing: border-box; * {        box-sizing: border-box; }    .flex {        display: flex; }    .centered {        align-items: center; }    .grid {        display: grid; }    .columns {        gap: 1px; margin-bottom: 1px; grid-auto-flow: column; }    .refresh-albums {        cursor: pointer; fill: var(--color-surface-400); }    .refresh-albums:hover {        fill: var(--color-surface-600); }    .dateForm {        grid-template-columns: 3em 60% 1em; }    .svg-container {        display: flex; justify-content: center; }    button {        background-color: var(--color-surface-200); color: var(--main-text-color); cursor: pointer; border: none; align-items: center; display: flex; padding: 0; border-radius: 0; height: 24px; padding-left: 5px; padding-right: 5px; transition: background ease 0.2s; }    button:disabled {        background-color: var(--primary-bg-color); cursor: not-allowed; color: var(--color-surface-500); }    button:disabled:hover {        background-color: var(--color-surface-100); }    button:hover {        background-color: var(--color-surface-300); }    legend,    label,    button {        font-size: 12px; line-height: 16px; font-weight: 500; text-transform: uppercase; }    option.shared {        background-color: var(--color-accent-dark); }    hr {        border: none; margin: 0px; width: 100%; border-bottom: 1px solid var(--color-surface-300); }    .header {        border-top-right-radius: 5px; border-top-left-radius: 5px; padding: 5px 10px 5px 10px; align-items: center; width: 100%; display: grid; grid-template-columns: 1fr 1em; .header-info {            align-items: center; display: flex; }        .header-text {            font-family: Consolas, Liberation Mono, Menlo, Courier, monospace; font-size: 1.3rem; font-weight: 500; }    }    #hide {        cursor: pointer; fill: var(--color-surface-300); }    #hide:hover {        fill: var(--main-text-color-hover); }    .sources {        gap: 2px; display: flex; flex-wrap: wrap; background-color: var(--primary-bg-color); border-bottom: 2px var(--color-surface-500); border-top: 2px var(--color-surface-500); user-select: none; .sourceHeader {            display: flex; align-items: center; fill: var(--color-surface-500); cursor: pointer; font-weight: bold; transition: background ease 0.2s; svg {                margin-right: 3px; }        }        .source input {            display: none; }        input:disabled+.sourceHeader {            cursor: not-allowed; color: var(--footer-color); fill: var(--footer-color); }        input+.sourceHeader {            padding: 5px; }        input:not(:disabled)+.sourceHeader:hover {            fill: var(--main-text-color-hover); }        .source input:checked+.sourceHeader {            background-color: var(--color-accent); fill: var(--main-text-color); }    }    .window-body {        height: 100%; min-height: 0; }    .sidebar {        height: 100%; position: relative; display: grid; grid-template-rows: auto 1fr auto; grid-auto-flow: row; background-color: var(--secondary-bg-color); overflow: hidden scroll; overflow-y: auto; max-height: 100%; padding-left: 8px; form {            width: 100%; }        .filters-form {            grid-row: 1; }        .settings-form {            grid-row: 3; margin-bottom: 5px; summary {                color: var(--color-surface-400); }        }        summary {            font-size: 16px; font-weight: 500; line-height: 20px; position: relative; overflow: hidden; margin-bottom: 2px; padding: 6px 10px; cursor: pointer; white-space: nowrap; text-overflow: ellipsis; border-radius: 4px; flex-shrink: 0; }        summary:hover::marker {            color: var(--main-text-color-hover); }        summary::marker {            color: var(--color-surface-400); }        fieldset {            display: flex; flex-direction: column; margin: 0 20px; padding-left: 20px; padding: 0; border: 0; font-weight: inherit; font-style: inherit; font-family: inherit; font-size: 100%; vertical-align: baseline; }        legend,        label {            display: block; width: 100%; margin-bottom: 8px; }        legend {            margin-bottom: 3px; }        select {            width: 100%; box-sizing: border-box; }        .select-control-buttons-row {            display: grid; height: 24px; gap: 3px; box-sizing: border-box; margin-top: 3px; grid-template-columns: repeat(3, max-content)        }        .input-wrapper {            margin-left: 2px; margin-bottom: 8px; }        .sidebar-top {            display: flex; align-items: center; gap: 5px; }        #filterResetButton {            margin: 5px; width: 100%; fill: var(--color-surface-400); color: var(--color-surface-400); cursor: pointer; }        #filterResetButton:hover {            fill: var(--color-surface-600); color: var(--color-surface-600); }        .form-control {            cursor: pointer; }        .date-reset {            cursor: pointer; fill: var(--color-surface-400); stroke-width: 0; stroke-linejoin: round; stroke-linecap: round; height: 30px; width: 30px; stroke: var(--primary-bg-color); transition: stroke-width 1s cubic-bezier(0, 2.5, 0.30, 2.5); margin-left: 5px; }        .date-reset.clicked {            stroke-width: 2; }        .warning{            color: var(--warning); }        .date-reset:hover {            fill: var(--color-surface-600); }        .settings-controls {            flex-wrap: wrap; display: flex; gap: 2px; padding: 2px 2px; }    }    .action-bar {        display: flex; background-color: var(--secondary-bg-color); user-select: none; .action-buttons,        .to-existing-container,        .to-new-container {            flex-wrap: wrap; gap: 2px; padding: 2px 2px; }        .action-buttons{            display: flex; }        .to-existing-container,        .to-new-container {            display: none; }        select {            width: 100%; max-width: 400px; box-sizing: border-box; }        button.running {            background-color: var(--accent-color); }        svg {            fill: var(--color-surface-600); }    }    .main {        height: 100%; overflow: auto; display: grid; grid-auto-flow: row; grid-template-rows: max-content max-content auto; max-width: 100%; .filter-preview {            background-color: var(--filter-preview-color); padding-left: 20px; span {                text-wrap: pretty; }        }        #logArea {            height: 100%; font-family: Consolas, Liberation Mono, Menlo, Courier, monospace; font-size: 0.9rem; overflow: auto; padding: 10px; user-select: text; cursor: auto; .error {                color: var(--warning); }            .success {                color: var(--success); }        }        .button-container{            background-color: var(--color-surface-100); display: flex; gap: 2px; padding: 2px 2px; #stopProcess{                display: none; background-color: var(--exit-button-background); }        }    }    .footer {        width: 100%; padding: 5px; height: 35px; background-color: var(--color-surface-200); border-bottom-right-radius: 5px; border-bottom-left-radius: 5px; display: grid; align-items: center; grid-template-columns: 1fr 1fr; .auto-scroll-container {            display: grid; align-items: center; grid-template-columns: max-content max-content; justify-content: end; }        .info-container,        .info-container a {            font-family: Consolas, Liberation Mono, Menlo, Courier, monospace; color: var(--color-surface-500); margin-left: 10px; }    }    /* Scrollbar */    .scroll::-webkit-scrollbar {        width: 8px; height: 8px; }    .scroll::-webkit-scrollbar-corner {        background-color: transparent; }    .scroll::-webkit-scrollbar-thumb {        background-clip: padding-box; border: 2px solid transparent; border-radius: 4px; background-color: var(--color-surface-600); min-height: 40px; }    /* fade scrollbar */    .scroll::-webkit-scrollbar-thumb,    .scroll::-webkit-scrollbar-track {        visibility: hidden; }    .scroll:hover::-webkit-scrollbar-thumb,    .scroll:hover::-webkit-scrollbar-track {        visibility: visible; }}
`);

  function generateFilterDescription(filter) {

    // date check
    if (filter.lowerBoundaryDate >= filter.higherBoundaryDate) return 'Error: Invalid Date Interval';
    // size check
    if (parseInt(filter.lowerBoundarySize) >= parseInt(filter.higherBoundarySize)) return 'Error: Invalid Size Filter';
    let descriptionParts = ['Filter: All'];

    if (filter.owned === 'true') descriptionParts.push('owned');
    else if (filter.owned === 'false') descriptionParts.push('not owned');

    if (filter.space === 'consuming') descriptionParts.push('space consuming');
    if (filter.space === 'non-consuming') descriptionParts.push('non-space consuming');

    if (filter.excludeShared === 'true') descriptionParts.push('non-shared');

    if (filter.favorite === 'true') descriptionParts.push('favorite');
    if (filter.excludeFavorites === 'true' || filter.favorite === 'false') descriptionParts.push('non-favorite');

    if (filter.quality === 'original') descriptionParts.push('original quality');
    else if (filter.quality === 'storage-saver') descriptionParts.push('storage-saver quality');
    if (filter.archived === 'true') descriptionParts.push('archived');
    else if (filter.archived === 'false') descriptionParts.push('non-archived');

    if (!filter.type) descriptionParts.push('media');
    else if (filter.type === 'video') descriptionParts.push('videos');
    else if (filter.type === 'image') descriptionParts.push('images');

    if (filter.searchQuery) descriptionParts.push(`in search results of query "${filter.searchQuery}"`);

    if (filter.fileNameRegex) {
      descriptionParts.push('with filename');
      if (filter.fileNameMatchType === 'include') descriptionParts.push('matching');
      if (filter.fileNameMatchType === 'exclude') descriptionParts.push('not matching');
      descriptionParts.push(`regex "${filter.fileNameRegex}"`);
    }

    if (filter.descriptionRegex) {
      descriptionParts.push('with description');
      if (filter.descriptionMatchType === 'include') descriptionParts.push('matching');
      if (filter.descriptionMatchType === 'exclude') descriptionParts.push('not matching');
      descriptionParts.push(`regex "${filter.descriptionRegex}"`);
    }

    if (parseInt(filter.lowerBoundarySize) > 0) descriptionParts.push(`larger than ${parseInt(filter.lowerBoundarySize)} bytes`);
    if (parseInt(filter.lowerBoundarySize) > 0 && parseInt(filter.higherBoundarySize) > 0) descriptionParts.push('and');
    if (parseInt(filter.higherBoundarySize) > 0) descriptionParts.push(`smaller than ${parseInt(filter.higherBoundarySize)} bytes`);

    if (filter.albumsInclude) {
      descriptionParts.push(Array.isArray(filter.albumsInclude) ? 'in the target albums' : 'in the target album');
    }
    if (filter.albumsExclude) {
      descriptionParts.push('excluding items');
      descriptionParts.push(Array.isArray(filter.albumsExclude) ? 'in the selected albums' : 'in the selected album');
    }

    if (filter.lowerBoundaryDate || filter.higherBoundaryDate) {
      const lowerBoundaryDate = filter.lowerBoundaryDate ? new Date(filter.lowerBoundaryDate).toLocaleString('en-GB') : null;
      const higherBoundaryDate = filter.higherBoundaryDate ? new Date(filter.higherBoundaryDate).toLocaleString('en-GB') : null;

      if (filter.dateType === 'taken') descriptionParts.push('taken');
      else if (filter.dateType === 'uploaded') descriptionParts.push('uploaded');

      if (lowerBoundaryDate && higherBoundaryDate) {

        if (filter.intervalType === 'exclude') {
          descriptionParts.push(`before ${lowerBoundaryDate} and after ${higherBoundaryDate}`);
        }
        else if (filter.intervalType === 'include') {
          descriptionParts.push(`from ${lowerBoundaryDate} to ${higherBoundaryDate}`);
        }
      } else if (lowerBoundaryDate) {
        if (filter.intervalType === 'exclude') descriptionParts.push(`before ${lowerBoundaryDate}`);
        else if (filter.intervalType === 'include') descriptionParts.push(`after ${lowerBoundaryDate}`);

      } else if (higherBoundaryDate) {
        if (filter.intervalType === 'exclude') descriptionParts.push(`after ${higherBoundaryDate}`);
        else if (filter.intervalType === 'include') descriptionParts.push(`before ${higherBoundaryDate}`);
      }
    }

    let filterDescriptionString = descriptionParts.join(' ');
    if (filterDescriptionString == 'Filter: All media') filterDescriptionString = 'Filter: None';
    return filterDescriptionString;
  }

  function getForm(selector) {
    let form = {};
    const formElement = document.querySelector(selector);
    const formData = new FormData(formElement);

    for (const [key, value] of formData) {

      if (value) {
        // Check if the key already exists in the form object
        if (Reflect.has(form, key)) {
          // If the value is not an array, make it an array
          if (!Array.isArray(form[key])) {
            form[key] = [form[key]];
          }
          // Add the new value to the array
          form[key].push(value);
        } else {
          // If the key doesn't exist in the form object, add it
          form[key] = value;
        }
      }
    }
    return form;
  }

  function disableActionBar(disabled) {
    const actions = document.querySelectorAll('.action-bar *');
    for (const action of actions) {
      action.disabled = disabled;
    }
  }

  function parser(data, rpcid) {

    function libraryItemParse(rawItemData) {
      return {
        productId: rawItemData?.[0],
        dateTaken: rawItemData?.[2],
        mediaId: rawItemData?.[3],
        dateUploaded: rawItemData?.[5],
        isArchived: rawItemData?.[13],
        isFavorite: rawItemData?.at(-1)?.[163238866]?.[0],
        duration: rawItemData?.at(-1)?.[76647426]?.[0],
        descriptionShort: rawItemData?.at(-1)?.[396644657]?.[0],
        isOwned: rawItemData?.[7]?.[12]?.[0] !== 27
      };
    }

    function libraryTimelinePage(data) {
      return {
        items: data?.[0]?.map(rawItemData => libraryItemParse(rawItemData)),
        nextPageId: data?.[1],
        lastItemTimestamp: parseInt(data?.[2]),
      };
    }

    function libraryGenericPage(data) {
      return {
        items: data?.[0]?.map(rawItemData => libraryItemParse(rawItemData)),
        nextPageId: data?.[1],
      };
    }

    function lockedFolderItemParse(rawItemData) {
      return {
        productId: rawItemData?.[0],
        dateTaken: rawItemData?.[2],
        mediaId: rawItemData?.[3],
        dateUploaded: rawItemData?.[5],
        duration: rawItemData?.at(-1)?.[76647426]?.[0]
      };
    }

    function lockedFolderPage(data) {
      return {
        nextPageId: data?.[0],
        items: data?.[1]?.map(rawItemData => lockedFolderItemParse(rawItemData))
      };
    }

    function linkParse(rawLinkData) {
      return {
        productId: rawLinkData?.[6],
        linkId: rawLinkData?.[17],
        itemCount: rawLinkData?.[3]
      };
    }

    function linksPage(data) {
      return {
        items: data?.[0]?.map(rawLinkData => linkParse(rawLinkData)),
        nextPageId: data?.[1]
      };
    }

    function albumParse(rawAlbumData) {
      return {
        productId: rawAlbumData?.[0],
        albumId: rawAlbumData?.[6]?.[0],
        name: rawAlbumData?.at(-1)?.[72930366]?.[1],
        itemCount: rawAlbumData?.at(-1)?.[72930366]?.[3],
        isShared: rawAlbumData?.at(-1)?.[72930366]?.[4] || false
      };
    }

    function albumsPage(data) {
      return {
        items: data?.[0]?.map(rawAlbumData => albumParse(rawAlbumData)),
        nextPageId: data?.[1]
      };
    }

    function itemBasicParse(rawItemData) {
      return {
        productId: rawItemData?.[0],
        dateTaken: rawItemData?.[2],
        mediaId: rawItemData?.[3],
        dateUploaded: rawItemData?.[5],
        duration: rawItemData?.at(-1)?.[76647426]?.[0]
      };
    }

    function albumItemsPage(data) {
      return {
        items: data?.[1]?.map(rawItemData => itemBasicParse(rawItemData)),
        nextPageId: data?.[2]
      };
    }

    function trashPage(data) {
      return {
        items: data?.[0].map(rawItemData => itemBasicParse(rawItemData)),
        nextPageId: data?.[1]
      };
    }

    function itemBulkInfoParse(rawItemData) {
      return {
        productId: rawItemData?.[0],
        descriptionFull: rawItemData?.[1]?.[2],
        fileName: rawItemData?.[1]?.[3],
        dateTaken: rawItemData?.[1]?.[6],
        dateUploaded: rawItemData?.[1]?.[8],
        size: rawItemData?.[1]?.[9],
        takesUpSpace: rawItemData?.[1]?.at(-1)?.[0] === 1,
        spaceTaken: rawItemData?.[1]?.at(-1)?.[1],
        isOriginalQuality: rawItemData?.[1]?.at(-1)?.[2] === 2
      };
    }

    function bulkInfo(data) {
      return data.map(rawItemData => itemBulkInfoParse(rawItemData));
    }

    if(!data?.length) return null;
    if (rpcid === 'lcxiM') return libraryTimelinePage(data);
    if (rpcid === 'nMFwOc') return lockedFolderPage(data);
    if (rpcid === 'EzkLib') return libraryGenericPage(data);
    if (rpcid === 'F2A0H') return linksPage(data);
    if (rpcid === 'Z5xsfc') return albumsPage(data);
    if (rpcid === 'snAcKc') return albumItemsPage(data);
    if (rpcid === 'zy0IHe') return trashPage(data);
    if (rpcid === 'EWgK9e') return bulkInfo(data);
  }

  const windowGlobalData = {
    rapt: window.WIZ_global_data.Dbw5Ud,
    account: window.WIZ_global_data.oPEP7c,
    'f.sid': window.WIZ_global_data.FdrFJe,
    bl: window.WIZ_global_data.cfb2h,
    path: window.WIZ_global_data.eptZe,
    at: window.WIZ_global_data.SNlM0e
  };

  class Api {
    async makeApiRequest(rpcid, requestData) {
      requestData = [[[rpcid, JSON.stringify(requestData), null, 'generic']]];

      const requestDataString = `f.req=${encodeURIComponent(JSON.stringify(requestData))}&at=${encodeURIComponent(windowGlobalData.at)}&`;

      const params = {
        rpcids: rpcid,
        'source-path': window.location.pathname,
        'f.sid': windowGlobalData['f.sid'],
        bl: windowGlobalData.bl,
        pageId: 'none',
        rt: 'c'
      };
      // if in locked folder send rapt
      if(windowGlobalData.rapt) params.rapt = windowGlobalData.rapt;
      const paramsString = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
      const url = `https://photos.google.com${windowGlobalData.path}data/batchexecute?${paramsString}`;
      try {
        const response = await fetch(url, {
          'headers': {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          'body': requestDataString,
          'method': 'POST',
          'credentials': 'include'
        });

        const responseBody = await response.text();
        const jsonLines = responseBody.split('\n').filter(line => line.includes('wrb.fr'));
        let parsedData = JSON.parse(jsonLines[0]);
        return JSON.parse(parsedData[0][2]);
      } catch (error) {
        console.error(`Error in ${rpcid} request:`, error);
        throw error;
      }
    }

    async listItemsByTakenDate(timestamp = null, source = null, pageId = null, parseResponse = true) {
      // Retrieves media items created before the provided timestamp
      if (source === 'library') source = 1;
      else if (source === 'archive') source = 2;
      else if (!source) source = 3; //both

      const rpcid = 'lcxiM';
      const limit = 500; // 500 is max
      const requestData = [pageId, timestamp, limit, null, 1, source];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        if (parseResponse) return parser(response, rpcid);
        return response;
      } catch (error) {
        console.error('Error in listItemsByTakenDate:', error);
        throw error;
      }
    }

    async listItemsByUploadedDate(pageId = null, parseResponse = true) {
      const rpcid = 'EzkLib';
      const requestData = ['', [[4, 'ra', 0, 0]], pageId];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        if (parseResponse) return parser(response, rpcid);
        return response;
      } catch (error) {
        console.error('Error in listItemsByUploadedDate:', error);
        throw error;
      }
    }

    async search(searchQuery, pageId = null, parseResponse = true) {
      const rpcid = 'EzkLib';
      const requestData = [searchQuery, null, pageId];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        if (parseResponse) return parser(response, rpcid);
        return response;
      } catch (error) {
        console.error('Error in search:', error);
        throw error;
      }
    }

    async listFavorites(pageId = null, parseResponse = true) {
      const rpcid = 'EzkLib';
      const requestData = ['Favorites', [[5, '8', 0, 9]], pageId];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        if (parseResponse) return parser(response, rpcid);
        return response;
      } catch (error) {
        console.error('Error in listFavorites:', error);
        throw error;
      }
    }

    async listTrashItems(pageId = null, parseResponse = true) {
      const rpcid = 'zy0IHe';
      const requestData = [pageId];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        if (parseResponse) return parser(response, rpcid);
        return response;
      } catch (error) {
        console.error('Error in listTrashItems:', error);
        throw error;
      }
    }

    async listLockedFolderItems(pageId = null, parseResponse = true) {
      const rpcid = 'nMFwOc';
      const requestData = [pageId];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        if (parseResponse) return parser(response, rpcid);
        return response;
      } catch (error) {
        console.error('Error in listLockedFolderItems:', error);
        throw error;
      }
    }

    async moveMediaToTrash(mediaIdList) {
      const rpcid = 'XwAOJf';
      const requestData = [null, 1, mediaIdList, 3];
      // note: It seems that '3' here corresponds to items' location
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        return response[0];
      } catch (error) {
        console.error('Error in moveMediaToTrash:', error);
        throw error;
      }
    }

    async restoreFromTrash(mediaIdList) {
      const rpcid = 'XwAOJf';
      const requestData = [null, 3, mediaIdList, 2];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        return response[0];
      } catch (error) {
        console.error('Error in restoreFromTrash:', error);
        throw error;
      }
    }

    async listSharedLinks(pageId = null, parseResponse = true) {
      const rpcid = 'F2A0H';
      const requestData = [pageId, null, 2, null, 3];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        if (parseResponse) return parser(response, rpcid);
        return response;
      } catch (error) {
        console.error('Error in listSharedLinks:', error);
        throw error;
      }
    }

    async listAlbums(pageId = null, parseResponse = true) {
      const rpcid = 'Z5xsfc';
      const requestData = [pageId, null, null, null, 1, null, null, 100];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        if (parseResponse) return parser(response, rpcid);
        return response;
      } catch (error) {
        console.error('Error in listAlbums:', error);
        throw error;
      }
    }

    async listAlbumItems(albumId, pageId = null, parseResponse = true) {
      // list items of an album or a shared link with the given id
      const rpcid = 'snAcKc';
      const requestData = [albumId, pageId, null, null, 1];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        if (parseResponse) return parser(response, rpcid);
        return response;
      } catch (error) {
        console.error('Error in listAlbumItems:', error);
        throw error;
      }
    }

    async removeFromAlbum(albumItemIdList) {
      const rpcid = 'ycV3Nd';
      const requestData = [albumItemIdList];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        return response;
      } catch (error) {
        console.error('Error in removeFromAlbum:', error);
        throw error;
      }
    }

    async createEmptyAlbum(albumName) {
      // returns string id of the created album
      const rpcid = 'OXvT9d';
      let requestData = [albumName, null, 2];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        return response[0][0];
      } catch (error) {
        console.error('Error in createEmptyAlbum:', error);
        throw error;
      }
    }

    async addItemsToAlbum(productIdList, albumId = null, albumName = null) {
      // supply album ID for adding to an existing album, or a name for a new one
      const rpcid = 'E1Cajb';
      let requestData = null;

      if (albumName) requestData = [productIdList, null, albumName];
      else if (albumId) requestData = [productIdList, albumId];

      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        return response;
      } catch (error) {
        console.error('Error in addItemsToAlbum:', error);
        throw error;
      }
    }

    async setFavorite(mediaIdList, action = true) {
      if (action === true) action = 1; //set favorite
      else if (action === false) action = 2;//un favorite
      mediaIdList = mediaIdList.map(item => [null, item]);
      const rpcid = 'Ftfh0';
      const requestData = [mediaIdList, [action]];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        return response;
      } catch (error) {
        console.error('Error in setFavorite:', error);
        throw error;
      }
    }

    async setArchive(mediaIdList, action = true) {
      if (action === true) action = 1;// send to archive
      else if (action === false) action = 2;// un archive

      mediaIdList = mediaIdList.map(item => [null, [action], [null, item]]);
      const rpcid = 'w7TP3c';
      const requestData = [mediaIdList, null, 1];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        return response;
      } catch (error) {
        console.error('Error in setArchive:', error);
        throw error;
      }
    }

    async moveToLockedFolder(mediaIdList) {
      const rpcid = 'StLnCe';
      const requestData = [mediaIdList, []];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        return response;
      } catch (error) {
        console.error('Error in moveToLockedFolder:', error);
        throw error;
      }
    }

    async removeFromLockedFolder(mediaIdList) {
      const rpcid = 'Pp2Xxe';
      const requestData = [mediaIdList];
      try {
        const response = await this.makeApiRequest(rpcid, requestData);
        return response;
      } catch (error) {
        console.error('Error in removeFromLockedFolder:', error);
        throw error;
      }
    }

    async getBatchMediaInfo(productIdList, parseResponse = true) {
      const rpcid = 'EWgK9e';
      productIdList = productIdList.map(id => [id]);
      const requestData = [[[productIdList], [[null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, [], null, null, null, null, null, null, null, null, null, null, []]]]];
      try {
        let response = await this.makeApiRequest(rpcid, requestData);
        response = response[0][1];
        if (parseResponse) return parser(response, rpcid);
        return response;
      } catch (error) {
        console.error('Error in getBatchMediaInfo:', error);
        throw error;
      }
    }
  }

  function log(logMessage, type = null) {
    const logPrefix = '[GPTK]';
    // Create a new div for the log message
    const logDiv = document.createElement('div');
    logDiv.textContent = logMessage;

    if(type)logDiv.classList.add(type);
    console.log(`${logPrefix} ${logMessage}`);

    // Append the log message to the log container
    try {
      const logContainer = document.querySelector('#logArea');
      logContainer.appendChild(logDiv);
      if (document.querySelector('#autoScroll').checked) logDiv.scrollIntoView();
    } catch (error) {
      console.error(`${logPrefix} ${error}`);
    }
  }

  function splitArrayIntoChunks(arr, chunkSize = 500) {
    chunkSize = parseInt(chunkSize);
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  }

  const apiSettingsDefault = {
    ignoreErrors: false,
    maxConcurrentApiReq: 3,
    operationSize: 500,
    lockedFolderOpSize : 100,
    infoSize: 5000
  };

  class ApiUtils {
    constructor(core = null, settings) {
      this.api = new Api();
      this.executeWithConcurrency = this.executeWithConcurrency.bind(this);
      this.getAllItems = this.getAllItems.bind(this);
      this.core = core;
      let {
        ignoreErrors,
        maxConcurrentApiReq,
        operationSize,
        infoSize,
        lockedFolderOpSize
      } = settings || apiSettingsDefault;

      this.ignoreErrors = ignoreErrors;
      this.maxConcurrentApiReq = parseInt(maxConcurrentApiReq);
      this.operationSize = parseInt(operationSize);
      this.lockedFolderOpSize = parseInt(lockedFolderOpSize);
      this.infoSize = parseInt(infoSize); 
    }

    async executeWithConcurrency(apiMethod, successCheck, operationSize, itemsArray, ...args) {
      const promisePool = [];
      const results = [];
      const chunkedItems = splitArrayIntoChunks(itemsArray, operationSize);
    
      for (const chunk of chunkedItems) {
        if (!this.core.isProcessRunning) return;
        while(promisePool.length >= this.maxConcurrentApiReq){
          await Promise.race(promisePool);
          promisePool.shift();
        }

        log(`Processing ${chunk.length} items`);
    
        const promise = apiMethod.call(this.api, chunk, ...args); // Call apiMethod with correct context
        promisePool.push(promise);
    
        promise
          .then(result => {
            results.push(...result);
            if (successCheck && !successCheck(result)) {
              log(`Error executing action ${apiMethod.name}`, 'error');
              promisePool.shift();
            }
          }) // Remove fulfilled promise from pool
          .catch(error => {
            log(`${apiMethod.name} Api error ${error}`, 'error');
            promisePool.shift();
          });
      }
      await Promise.all(promisePool);
      return results;
    }

    async getAllItems(apiMethod, ...args) {
      const items = [];
      let nextPageId = null;
      do {
        if (!this.core.isProcessRunning) return;
        const page = await apiMethod.call(this.api, ...args, nextPageId);
        if (!page?.items && this.ignoreErrors !== 'on') {
          log('No items found!', 'error');
          return [];
        }
        items.push(...page.items);
        log(`Found ${page.items.length} items`);
        nextPageId = page.nextPageId;
      } while (nextPageId);
      return items;
    }

    async getAllAlbums() {
      return await this.getAllItems(this.api.listAlbums);
    }

    async getAllSharedLinks() {
      return await this.getAllItems(this.api.listSharedLinks);
    }

    async getAllMediaInSharedLink(sharedLinkId) {
      return await this.getAllItems(this.api.listAlbumItems, sharedLinkId);
    }

    async getAllMediaInAlbum(albumId) {
      return await this.getAllItems(this.api.listAlbumItems, albumId);
    }

    async getAllTrashItems() {
      return await this.getAllItems(this.api.listTrashItems);
    }

    async getAllFavoriteItems() {
      return await this.getAllItems(this.api.listFavorites);
    }

    async getAllSearchItems(searchQuery) {
      return await this.getAllItems(this.api.search, searchQuery);
    }

    async getAllLockedFolderItems() {
      return await this.getAllItems(this.api.listLockedFolderItems);
    }

    async moveToLockedFolder(mediaItems) {
      log(`Moving ${mediaItems.length} items to locked folder`);
      const isSuccess = result => Array.isArray(result);
      const mediaIdList = mediaItems.map(item => item.mediaId);
      await this.executeWithConcurrency(this.api.moveToLockedFolder, isSuccess, this.lockedFolderOpSize, mediaIdList);
    }

    async removeFromLockedFolder(mediaItems) {
      log(`Moving ${mediaItems.length} items out of locked folder`);
      const isSuccess = result => Array.isArray(result);
      const mediaIdList = mediaItems.map(item => item.mediaId);
      await this.executeWithConcurrency(this.api.removeFromLockedFolder, isSuccess, this.lockedFolderOpSize, mediaIdList);
    }

    async moveToTrash(mediaItems) {
      log(`Moving ${mediaItems.length} items to trash`);
      const isSuccess = result => Array.isArray(result);
      const mediaIdList = mediaItems.map(item => item.mediaId);
      await this.executeWithConcurrency(this.api.moveMediaToTrash, isSuccess, this.operationSize, mediaIdList);
    }

    async restoreFromTrash(trashItems) {
      log(`Restoring ${trashItems.length} items from trash`);
      const isSuccess = result => Array.isArray(result);
      const mediaIdList = trashItems.map(item => item.mediaId);
      await this.executeWithConcurrency(this.api.restoreFromTrash, isSuccess, this.operationSize, mediaIdList);
    }

    async sendToArchive(mediaItems) {
      log(`Sending ${mediaItems.length} items to archive`);
      const isSuccess = result => Array.isArray(result);
      mediaItems = mediaItems.filter(item => item?.isArchived !== true);
      const mediaIdList = mediaItems.map(item => item.mediaId);
      if(!mediaItems){
        log('All target items are already archived!');
        return;
      }
      await this.executeWithConcurrency(this.api.setArchive, isSuccess, this.operationSize, mediaIdList, true);
    }

    async unArchive(mediaItems) {
      log(`Removing ${mediaItems.length} items from archive`);
      const isSuccess = result => Array.isArray(result);
      mediaItems = mediaItems.filter(item => item?.isArchived !== false);
      const mediaIdList = mediaItems.map(item => item.mediaId);
      if(!mediaItems){
        log('All target items are not archived!');
        return;
      }
      await this.executeWithConcurrency(this.api.setArchive, isSuccess, this.operationSize, mediaIdList, false);
    }
    
    async setAsFavorite(mediaItems) {
      log(`Setting ${mediaItems.length} items as favorite`);
      const isSuccess = result => Array.isArray(result);
      mediaItems = mediaItems.filter(item => item?.isFavorite !== true);
      if(!mediaItems){
        log('All target items are already favorite!');
        return;
      }
      const mediaIdList = mediaItems.map(item => item.mediaId);
      await this.executeWithConcurrency(this.api.setFavorite, isSuccess, this.operationSize, mediaIdList, true);
    }
    
    async unFavorite(mediaItems) {
      log(`Removing ${mediaItems.length} items from favorites`);
      const isSuccess = result => Array.isArray(result);
      mediaItems = mediaItems.filter(item => item?.isFavorite !== false);
      if(!mediaItems){
        log('All target items are not favorite!');
        return;
      }
      const mediaIdList = mediaItems.map(item => item.mediaId);
      await this.executeWithConcurrency(this.api.setFavorite, isSuccess, this.operationSize, mediaIdList, false);
    }

    async addToExistingAlbum(mediaItems, targetAlbumId) {
      log(`Adding ${mediaItems.length} items to album`);
      const isSuccess = result => Array.isArray(result);
      const productIdList = mediaItems.map(item => item.productId);
      await this.executeWithConcurrency(this.api.addItemsToAlbum, isSuccess, this.operationSize, productIdList, targetAlbumId);
    }

    async addToNewAlbum(mediaItems, targetAlbumName) {
      log(`Creating new album "${targetAlbumName}"`);
      const targetAlbumId = await this.api.createEmptyAlbum(targetAlbumName);
      await this.addToExistingAlbum(mediaItems, targetAlbumId);
    }

    async getBatchMediaInfoChunked(mediaItems) {
      log('Getting items\' media info');
      const productIdList = mediaItems.map(item => item.productId);
      const mediaInfoData = await this.executeWithConcurrency(this.api.getBatchMediaInfo, null, this.infoSize, productIdList);
      return mediaInfoData;
    }
  }

  function dateToHHMMSS(date) {
    // Options for formatting
    let options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

    // Formatted time string
    return date.toLocaleTimeString('en-GB', options);
  }
  function timeToHHMMSS(time) {
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return formattedTime;
  }
  function isPatternValid(pattern) {
    try {
      new RegExp(pattern);
      return true;
    } catch (e) {
      return e;
    }
  }

  class Core {
    constructor() {
      this.isProcessRunning = false;
      this.api = new Api();
    }

    async getAndFilterMedia(filter, source, apiSettings) {
      let mediaItems = [];
      if (source === 'library') {
        log('Reading library');
        if (filter.dateType === 'uploaded') mediaItems = await this.getLibraryItemsByUploadDate(filter, apiSettings);
        else if (filter.dateType === 'taken') mediaItems = await this.getLibraryItemsByTakenDate(filter, apiSettings);
      }
      else if (source === 'search') {
        log('Reading search results');
        mediaItems = await this.apiUtils.getAllSearchItems(filter.searchQuery);
      }
      else if (source === 'trash') {
        log('Getting trash items');
        mediaItems = await this.apiUtils.getAllTrashItems();
      }
      else if (source === 'lockedFolder') {
        log('Getting locked folder items');
        mediaItems = await this.apiUtils.getAllLockedFolderItems();
      }
      else if (source === 'favorites') {
        log('Getting favorite items');
        mediaItems = await this.apiUtils.getAllFavoriteItems();
      }
      else if (source === 'sharedLinks') {
        log('Getting shared links');
        const sharedLinks = await this.apiUtils.getAllSharedLinks();
        if (!sharedLinks) {
          log('No shared links found', 'error');
          return;
        }
        log(`Shared Links Found: ${sharedLinks.length}`);
        for (const sharedLink of sharedLinks) {
          log('Getting shared link items');
          const sharedLinkItems = await this.apiUtils.getAllMediaInSharedLink(sharedLink.linkId);
          mediaItems.push(...sharedLinkItems);
        }
      }
      else if (source === 'albums') {
        if (!filter.albumsInclude) {
          log('No target album!', 'error');
          throw new Error('no target album!');
        }
        filter.albumsInclude = Array.isArray(filter.albumsInclude) ? filter.albumsInclude : [filter.albumsInclude];
        for (const albumId of filter.albumsInclude) {
          log('Getting album items');
          mediaItems.push(...await this.apiUtils.getAllMediaInAlbum(albumId));
        }
      }

      log('Source read complete');
      log(`Found items: ${mediaItems?.length}`);

      if (!this.isProcessRunning) return;

      if (mediaItems?.length && (filter.lowerBoundaryDate || filter.higherBoundaryDate) && source !== 'library') {
        // library has its own date filter
        mediaItems = this.filterByDate(mediaItems, filter);
      }

      if (mediaItems?.length && filter.albumsExclude) {
        const itemsToExclude = [];
        filter.albumsExclude = Array.isArray(filter.albumsExclude) ? filter.albumsExclude : [filter.albumsExclude];

        for (const albumId of filter.albumsExclude) {
          log('Getting album items to exclude');
          itemsToExclude.push(...await this.apiUtils.getAllMediaInAlbum(albumId));
        }
        log('Excluding album items');
        mediaItems = mediaItems.filter(mediaItem => {
          return !itemsToExclude.some(excludeItem => excludeItem.mediaId === mediaItem.mediaId);
        });

      }
      if (mediaItems?.length && filter.excludeShared) {
        log('Getting shared links\' items to exclude');
        const itemsToExclude = [];
        const sharedLinks = await this.apiUtils.getAllSharedLinks();
        for (const sharedLink of sharedLinks) {
          const sharedLinkItems = await this.apiUtils.getAllMediaInSharedLink(sharedLink.linkId);
          itemsToExclude.push(...sharedLinkItems);
        }
        log('Excluding shared items');
        mediaItems = mediaItems.filter(mediaItem => {
          return !itemsToExclude.some(excludeItem => excludeItem.mediaId === mediaItem.mediaId);
        });

      }
      if (mediaItems?.length && filter.owned) mediaItems = this.filterOwned(mediaItems, filter);
      if (mediaItems?.length && filter.archived) mediaItems = this.filterArchived(mediaItems, filter);
      if (mediaItems?.length && filter.favorite || filter.excludeFavorites) mediaItems = this.filterFavorite(mediaItems, filter);
      if (mediaItems?.length && filter.type) mediaItems = this.filterByMediaType(mediaItems, filter);

      if (mediaItems?.length && (filter.space 
        || filter.quality
        || filter.lowerBoundarySize
        || filter.higherBoundarySize
        || filter.fileNameRegex
        || filter.descriptionRegex)) {
        mediaItems = await this.extendMediaItemsWithMediaInfo(mediaItems);
        if (mediaItems?.length && filter.fileNameRegex) mediaItems = this.fileNameFilter(mediaItems, filter);
        if (mediaItems?.length && filter.descriptionRegex) mediaItems = this.desctiptionFilter(mediaItems, filter);
        if (mediaItems?.length && filter.space) mediaItems = this.spaceFilter(mediaItems, filter);
        if (mediaItems?.length && filter.quality) mediaItems = this.qualityFilter(mediaItems, filter);
        if (mediaItems?.length && (filter.lowerBoundarySize || filter.higherBoundarySize)) mediaItems = this.sizeFilter(mediaItems, filter);
      }
      return mediaItems;
    }

    async extendMediaItemsWithMediaInfo(mediaItems) {
      const mediaInfoData = await this.apiUtils.getBatchMediaInfoChunked(mediaItems);

      const extendedMediaItems = mediaItems.map(item => {
        const matchingInfoItem = mediaInfoData.find(infoItem => infoItem.productId === item.productId);
        return { ...item, ...matchingInfoItem };
      });
      return extendedMediaItems;
    }

    async getLibraryItemsByTakenDate(filter, apiSettings) {
      let source;
      if (filter.archived === 'true') {
        source = 'archive';
      }
      else if (filter.archived === 'false') {
        source = 'library';
      }

      let lowerBoundaryDate = new Date(filter.lowerBoundaryDate).getTime();
      let higherBoundaryDate = new Date(filter.higherBoundaryDate).getTime();

      lowerBoundaryDate = isNaN(lowerBoundaryDate) ? -Infinity : lowerBoundaryDate;
      higherBoundaryDate = isNaN(higherBoundaryDate) ? Infinity : higherBoundaryDate;

      const mediaItems = [];

      let nextPageId = null;

      if ((Number.isInteger(lowerBoundaryDate || Number.isInteger(higherBoundaryDate))) && filter.intervalType === 'include') {
        let nextPageTimestamp = higherBoundaryDate !== Infinity ? higherBoundaryDate : null;
        do {
          if (!this.isProcessRunning) return;
          let mediaPage = await this.api.listItemsByTakenDate(nextPageTimestamp, source, nextPageId);
          if (!mediaPage?.items?.length && apiSettings.ignoreErrors !== 'on') {
            log('No media items on the page!', 'error');
            return mediaItems;
          }
          nextPageId = mediaPage.nextPageId;
          nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
          mediaPage.items = mediaPage.items.filter(item => item.dateTaken >= lowerBoundaryDate && item.dateTaken <= higherBoundaryDate);
          if (mediaPage?.items?.length === 0) continue;
          log(`Found ${mediaPage?.items?.length} items`);
          mediaItems.push(...mediaPage.items);
        } while (nextPageTimestamp && nextPageTimestamp > lowerBoundaryDate);
      } else if ((Number.isInteger(lowerBoundaryDate || Number.isInteger(higherBoundaryDate))) && filter.intervalType === 'exclude') {
        let nextPageTimestamp = null;
        do {
          if (!this.isProcessRunning) return;
          let mediaPage = await this.api.listItemsByTakenDate(nextPageTimestamp, source, nextPageId);
          if (!mediaPage?.items?.length && apiSettings.ignoreErrors !== 'on') {
            log('No media items on the page!', 'error');
            return mediaItems;
          }
          
          nextPageId = mediaPage.nextPageId;
          mediaPage.items = mediaPage.items.filter(item => item.dateTaken < lowerBoundaryDate || item.dateTaken > higherBoundaryDate);

          if (nextPageTimestamp > lowerBoundaryDate && nextPageTimestamp < higherBoundaryDate) {
            nextPageTimestamp = lowerBoundaryDate;
          } else {
            nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
          }

          if (mediaPage?.items?.length === 0) continue;

          log(`Found ${mediaPage?.items?.length} items`);
          mediaItems.push(...mediaPage.items);
        } while (nextPageTimestamp);
      } else {
        let nextPageTimestamp = null;
        do {
          if (!this.isProcessRunning) return;
          let mediaPage = await this.api.listItemsByTakenDate(nextPageTimestamp, source, nextPageId);
          if (!mediaPage?.items?.length && apiSettings.ignoreErrors !== 'on') {
            log('No media items on the page!', 'error');
            return mediaItems;
          }
          nextPageId = mediaPage.nextPageId;
          nextPageTimestamp = mediaPage.lastItemTimestamp - 1;
          log(`Found ${mediaPage?.items?.length} items`);
          mediaItems.push(...mediaPage.items);
        } while (nextPageTimestamp);
      }

      return mediaItems;
    }

    async getLibraryItemsByUploadDate(filter, apiSettings) {
      let lowerBoundaryDate = new Date(filter.lowerBoundaryDate).getTime();
      let higherBoundaryDate = new Date(filter.higherBoundaryDate).getTime();

      lowerBoundaryDate = isNaN(lowerBoundaryDate) ? -Infinity : lowerBoundaryDate;
      higherBoundaryDate = isNaN(higherBoundaryDate) ? Infinity : higherBoundaryDate;

      const mediaItems = [];

      let nextPageId = null;

      let skipTheRest = false;

      do {
        if (!this.isProcessRunning) return;
        let mediaPage = await this.api.listItemsByUploadedDate(nextPageId);
        if (!mediaPage?.items?.length && apiSettings.ignoreErrors !== 'on') {
          log('No media items on the page!', 'error');
          return mediaItems;
        }
        const lastTimeStamp = mediaPage.items.at(-1).dateUploaded;
        nextPageId = mediaPage.nextPageId;
        if (filter.intervalType === 'include') {
          mediaPage.items = mediaPage.items.filter(item => item.dateUploaded >= lowerBoundaryDate && item.dateUploaded <= higherBoundaryDate);
          skipTheRest = lastTimeStamp < lowerBoundaryDate;
        } else if (filter.intervalType === 'exclude') {
          mediaPage.items = mediaPage.items.filter(item => item.dateUploaded < lowerBoundaryDate || item.dateUploaded > higherBoundaryDate);
        }

        log(`Found ${mediaPage?.items?.length} items`);
        mediaItems.push(...mediaPage.items);
      } while (nextPageId && !skipTheRest);

      return mediaItems;
    }

    fileNameFilter(mediaItems, filter) {
      log('Filtering by filename');
      const regex = new RegExp(filter.fileNameRegex);
      if (filter?.fileNameMatchType === 'include') mediaItems = mediaItems.filter(item => regex.test(item.fileName));
      else if (filter?.fileNameMatchType === 'exclude') mediaItems = mediaItems.filter(item => !regex.test(item.fileName));
      log(`Item count after filtering: ${mediaItems?.length}`);
      return mediaItems;
    }

    desctiptionFilter(mediaItems, filter) {
      log('Filtering by description');
      const regex = new RegExp(filter.descriptionRegex);
      if (filter?.descriptionMatchType === 'include') mediaItems = mediaItems.filter(item => regex.test(item.descriptionFull));
      else if (filter?.descriptionMatchType === 'exclude') mediaItems = mediaItems.filter(item => !regex.test(item.descriptionFull));
      log(`Item count after filtering: ${mediaItems?.length}`);
      return mediaItems;
    }

    sizeFilter(mediaItems, filter) {
      log('Filtering by size');
      if (parseInt(filter?.higherBoundarySize) > 0) mediaItems = mediaItems.filter(item => item.size < filter.higherBoundarySize);
      if (parseInt(filter?.lowerBoundarySize) > 0) mediaItems = mediaItems.filter(item => item.size > filter.lowerBoundarySize);
      log(`Item count after filtering: ${mediaItems?.length}`);
      return mediaItems;
    }

    qualityFilter(mediaItems, filter) {
      log('Filtering by quality');
      if (filter.quality == 'original') mediaItems = mediaItems.filter(item => item.isOriginalQuality);
      else if (filter.quality == 'storage-saver') mediaItems = mediaItems.filter(item => !item.isOriginalQuality);
      log(`Item count after filtering: ${mediaItems?.length}`);
      return mediaItems;
    }

    spaceFilter(mediaItems, filter) {
      log('Filtering by space');
      if (filter.space === 'consuming') mediaItems = mediaItems.filter(item => item.takesUpSpace);
      else if (filter.space === 'non-consuming') mediaItems = mediaItems.filter(item => !item.takesUpSpace);
      log(`Item count after filtering: ${mediaItems?.length}`);
      return mediaItems;
    }

    filterByDate(mediaItems, filter) {
      log('Filtering by date');
      let lowerBoundaryDate = new Date(filter.lowerBoundaryDate).getTime();
      let higherBoundaryDate = new Date(filter.higherBoundaryDate).getTime();

      lowerBoundaryDate = isNaN(lowerBoundaryDate) ? -Infinity : lowerBoundaryDate;
      higherBoundaryDate = isNaN(higherBoundaryDate) ? Infinity : higherBoundaryDate;

      if (filter.intervalType === 'include') {
        if (filter.dateType === 'taken') {
          mediaItems = mediaItems.filter(item => item.dateTaken >= lowerBoundaryDate && item.dateTaken <= higherBoundaryDate);
        }
        else if (filter.dateType === 'uploaded') {
          mediaItems = mediaItems.filter(item => item.dateUploaded >= lowerBoundaryDate && item.dateUploaded <= higherBoundaryDate);
        }
      }
      else if (filter.intervalType === 'exclude') {
        if (filter.dateType === 'taken') {
          mediaItems = mediaItems.filter(item => item.dateTaken < lowerBoundaryDate || item.dateTaken > higherBoundaryDate);
        } else if (filter.dateType === 'uploaded') {
          mediaItems = mediaItems.filter(item => item.dateUploaded < lowerBoundaryDate || item.dateUploaded > higherBoundaryDate);
        }
      }
      log(`Item count after filtering: ${mediaItems?.length}`);
      return mediaItems;
    }

    filterByMediaType(mediaItems, filter) {
      // if has duration - video, else image
      log('Filtering by media type');
      if (filter.type === 'video') mediaItems = mediaItems.filter(item => item.duration);
      else if (filter.type === 'image') mediaItems = mediaItems.filter(item => !item.duration);
      log(`Item count after filtering: ${mediaItems?.length}`);
      return mediaItems;
    }

    filterFavorite(mediaItems, filter) {
      log('Filtering favorites');
      if (filter.favorite === 'true') {
        mediaItems = mediaItems.filter(item => item?.isFavorite !== false);
      }
      else if (filter.favorite === 'false' || filter.excludeFavorites) {
        mediaItems = mediaItems.filter(item => item?.isFavorite !== true);
      }

      log(`Item count after filtering: ${mediaItems?.length}`);
      return mediaItems;
    }

    filterOwned(mediaItems, filter) {
      log('Filtering owned');
      if (filter.owned === 'true') {
        mediaItems = mediaItems.filter(item => item?.isOwned !== false);
      }
      else if (filter.owned === 'false') {
        mediaItems = mediaItems.filter(item => item?.isOwned !== true);
      }
      log(`Item count after filtering: ${mediaItems?.length}`);
      return mediaItems;
    }

    filterArchived(mediaItems, filter) {
      log('Filtering archived');
      if (filter.archived === 'true') {
        mediaItems = mediaItems.filter(item => item?.isArchived !== false);
      }
      else if (filter.archived === 'false') {
        mediaItems = mediaItems.filter(item => item?.isArchived !== true);
      }

      log(`Item count after filtering: ${mediaItems?.length}`);
      return mediaItems;
    }

    preChecks(filter) {
      if (filter.fileNameRegex) {
        const isValid = isPatternValid(filter.fileNameRegex);
        if (isValid !== true) throw new Error(isValid);
      }
      if (filter.descriptionRegex) {
        const isValid = isPatternValid(filter.descriptionRegex);
        if (isValid !== true) throw new Error(isValid);
      }
      if (parseInt(filter.lowerBoundarySize) >= parseInt(filter.higherBoundarySize)){
        throw new Error('Invalid Size Filter');
      }
    }

    async actionWithFilter(action, filter, source, target, apiSettings) {
      try{
        this.preChecks(filter);
      }
      catch (error){
        log(error, 'error');
        return;
      }
      
      this.isProcessRunning = true;

      // dispatching event to upate the ui without importing it
      document.dispatchEvent(new Event('change'));

      this.apiUtils = new ApiUtils(this, apiSettings || apiSettingsDefault);

      try {
        const startTime = new Date();
        log(`Start Time ${dateToHHMMSS(startTime)}`);
        const mediaItems = await this.getAndFilterMedia(filter, source, apiSettings);
        if (!mediaItems?.length) log('No items to process.');
        else {
          log(`Items to process: ${mediaItems?.length}`);
          if (action.elementId === 'restoreTrash' || source === 'trash') await this.apiUtils.restoreFromTrash(mediaItems);
          if (action.elementId === 'unLock' || source === 'lockedFolder') await this.apiUtils.removeFromLockedFolder(mediaItems);
          if (action.elementId === 'lock') await this.apiUtils.moveToLockedFolder(mediaItems);
          if (action.elementId === 'toExistingAlbum') await this.apiUtils.addToExistingAlbum(mediaItems, target);
          if (action.elementId === 'toNewAlbum') await this.apiUtils.addToNewAlbum(mediaItems, target);
          if (action.elementId === 'toTrash') await this.apiUtils.moveToTrash(mediaItems);
          if (action.elementId === 'toArchive') await this.apiUtils.sendToArchive(mediaItems);
          if (action.elementId === 'unArchive') await this.apiUtils.unArchive(mediaItems);
          if (action.elementId === 'toFavorite') await this.apiUtils.setAsFavorite(mediaItems);
          if (action.elementId === 'unFavorite') await this.apiUtils.unFavorite(mediaItems);
          log(`Task completed in ${timeToHHMMSS(new Date() - startTime)}`, 'success');
        }
      } catch (error) {
        log(error, 'error');
      }
      this.isProcessRunning = false;

    }
  }

  const core = new Core();
  const apiUtils = new ApiUtils(core);

  function updateUI() {

    function toggleVisibility(element, toggle) {
      const allDescendants = element.querySelectorAll('*');
      if (toggle) {
        element.style.display = 'block';
        for (const node of allDescendants) node.disabled = false;
      } else {
        element.style.display = 'none';
        for (const node of allDescendants) node.disabled = true;
      }
    }

    async function filterPreviewUpdate() {
      const previewElement = document.querySelector('.filter-preview span');
      try {
        const description = generateFilterDescription(getForm('.filters-form'));
        previewElement.innerText = description;
      }
      catch {
        previewElement.innerText = 'Failed to generate description';
      }
    }

    function isActiveTab(tabName) {
      return document.querySelector('input[name="source"]:checked').id === tabName;
    }

    function lockedFolderTabState(){
      const lockedFolderTab = document.getElementById('lockedFolder');
      if(!window.location.href.includes('lockedfolder')){
        lockedFolderTab.disabled = true;
        lockedFolderTab.parentNode.title = 'To process items in the locked folder, you must open GPTK while in it';
      }
    }

    function updateActionButtonStates() {
      document.getElementById('unArchive').disabled = archivedExcluded;
      document.getElementById('toFavorite').disabled = favoritesOnly || isActiveTab('favorites');
      document.getElementById('unFavorite').disabled = favoritesExcluded;
      document.getElementById('toArchive').disabled = archivedOnly;
      document.getElementById('restoreTrash').disabled = !isActiveTab('trash');
      document.getElementById('toTrash').disabled = isActiveTab('trash');
      document.getElementById('lock').disabled = isActiveTab('lockedFolder');
      document.getElementById('unLock').disabled = !isActiveTab('lockedFolder');
    }


    function updateFilterVisibility() {
      const filterElements = {
        includeAlbums: document.querySelector('.include-albums'),
        owned: document.querySelector('.owned'),
        search: document.querySelector('.search'),
        favorite: document.querySelector('.favorite'),
        quality: document.querySelector('.quality'),
        size: document.querySelector('.size'),
        filename: document.querySelector('.filename'),
        description: document.querySelector('.description'),
        space: document.querySelector('.space'),
        excludeAlbums: document.querySelector('.exclude-albums'),
        archive: document.querySelector('.archive'),
        excludeShared: document.querySelector('.exclude-shared'),
        excludeFavorite: document.querySelector('.exclude-favorites')
      };

      // Default: hide all
      Object.values(filterElements).forEach(el => toggleVisibility(el, false));

      // Conditions for showing filters based on the active tab.
      if (isActiveTab('albums')) {
        toggleVisibility(filterElements.includeAlbums, true);
      }
      if (['library', 'search', 'favorites'].some(isActiveTab)) {
        toggleVisibility(filterElements.owned, true);
      }
      if (isActiveTab('search')) {
        toggleVisibility(filterElements.search, true);
        toggleVisibility(filterElements.favorite, true);
        toggleVisibility(filterElements.archive, true);
      }
      if (!isActiveTab('trash')) {
        toggleVisibility(filterElements.quality, true);
        toggleVisibility(filterElements.size, true);
        toggleVisibility(filterElements.filename, true);
        toggleVisibility(filterElements.description, true);
        toggleVisibility(filterElements.space, true);
        if (!isActiveTab('lockedFolder')) {
          toggleVisibility(filterElements.excludeAlbums, true);
        }
        if (!isActiveTab('sharedLinks')) {
          toggleVisibility(filterElements.excludeShared, true);
        }
      }
      if (isActiveTab('library')) {
        toggleVisibility(filterElements.excludeFavorite, true);
      }
    }

    lockedFolderTabState();

    const filter = getForm('.filters-form');

    // console.log(filter);

    const favoritesOnly = filter.favorite === 'true';
    const favoritesExcluded = filter.excludeFavorites === 'true' || filter.favorite === 'false';
    const archivedOnly = filter.archived === 'true';
    const archivedExcluded = filter.archived === 'false';

    if (core.isProcessRunning) {
      disableActionBar(true);
      document.getElementById('stopProcess').style.display = 'block';
    } else {
      document.getElementById('stopProcess').style.display = 'none';
      disableActionBar(false);
      updateActionButtonStates();
    }

    updateFilterVisibility();
    filterPreviewUpdate();
  }

  // eslint-disable-next-line no-undef
  const version = `v${"2.0.0-dev"}`;
  // eslint-disable-next-line no-undef
  const homepage = "https://github.com/xob0t/Google-Photos-Toolkit#readme";

  function htmlTemplatePrep(gptkMainTemplate){
    return gptkMainTemplate
      .replace('%version%', version)
      .replace('%homepage%', homepage);
  }

  function insertUi() {
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

  function getFromStorage(key) {
    if (typeof Storage !== 'undefined') {
      const userStorage = JSON.parse(localStorage.getItem(windowGlobalData.account)) || {};
      const storedData = userStorage[key];

      if (storedData) {
        console.log('Retrieved data from localStorage:', key);
        return storedData;
      } else {
        console.log('No data found in localStorage for key:', key);
        return null;
      }
    } else {
      console.log('Sorry, your browser does not support localStorage.');
      return null;
    }
  }

  function addAlbums(albums) {
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

  const actions = [
    {
      elementId: 'toExistingAlbum',
      targetId: 'existingAlbum'
    },
    {
      elementId: 'toNewAlbum',
      targetId: 'newAlbumName'
    },
    { elementId: 'toTrash' },
    { elementId: 'restoreTrash' },
    { elementId: 'toArchive' },
    { elementId: 'unArchive' },
    { elementId: 'toFavorite' },
    { elementId: 'unFavorite' },
    { elementId: 'lock' },
    { elementId: 'unLock' }
  ];

  function userConfirmation(action, filter, source) {
    function generateWarning(action, filter) {
      const filterDescription = generateFilterDescription(filter);
      const sourceHuman = document.querySelector('input[name="source"]:checked+label').textContent.trim();
      const actionElement = document.getElementById(action.elementId);
      const warning = [];
      warning.push(`Account: ${windowGlobalData.account}`);
      warning.push(`\nSource: ${sourceHuman}`);
      warning.push(`\n${filterDescription}`);
      warning.push(`\nAction: ${actionElement.title}`);
      return warning.join(' ');
    }
    const warning = generateWarning(action, filter);
    const confirmation = window.confirm(`${warning}\nProceed?`);
    if (!confirmation) return false;
    return true;
  }

  async function runAction(actionId) {
    const action = actions.find(action => action.elementId === actionId);
    // user input value if action has a target
    const target = document.getElementById(action?.targetId)?.value;
    // id of currently selected source element
    const source = document.querySelector('input[name="source"]:checked').id;
    
    // check filter validity
    const filtersForm = document.querySelector('.filters-form');
    if (!filtersForm.checkValidity()){
      filtersForm.reportValidity();
      return;
    }

    // Parsed filter object
    const filter = getForm('.filters-form');
    // Parsed settings object
    const apiSettings = getForm('.settings-form');
    if (!userConfirmation(action, filter)) return;

    // Disable action bar while process is running
    disableActionBar(true);
    // add class to indicate which action is running
    document.getElementById(actionId).classList.add('running');
    // Run it
    await core.actionWithFilter(action, filter, source, target, apiSettings);
    // remove 'running' class
    document.getElementById(actionId).classList.remove('running');
    // Update the ui
    updateUI();
    // force show main action bar
    showActionButtons();
  }

  function showExistingAlbumContainer() {
    document.querySelector('.action-buttons').style.display = 'none';
    document.querySelector('.to-existing-container').style.display = 'flex';
  }

  function showNewAlbumContainer() {
    document.querySelector('.action-buttons').style.display = 'none';
    document.querySelector('.to-new-container').style.display = 'flex';
  }

  function showActionButtons() {
    document.querySelector('.action-buttons').style.display = 'flex';
    document.querySelector('.to-existing-container').style.display = 'none';
    document.querySelector('.to-new-container').style.display = 'none';
  }

  function actionsListenersSetUp() {
    for (const action of actions) {
      const actionElement = document.getElementById(action.elementId);
      if (actionElement.type === 'button') {
        actionElement.addEventListener('click', async function (event) {
          event.preventDefault();
          await runAction(actionElement.id);
        });
      } else if (actionElement.tagName.toLowerCase() === 'form') {
        actionElement.addEventListener('submit', async function (event) {
          event.preventDefault();
          await runAction(actionElement.id);
        });
      }
    }

    const showExistingAlbumForm = document.querySelector('#showExistingAlbumForm');
    showExistingAlbumForm.addEventListener('click', showExistingAlbumContainer);

    const showNewAlbumForm = document.querySelector('#showNewAlbumForm');
    showNewAlbumForm.addEventListener('click', showNewAlbumContainer);

    const returnButtons = document.querySelectorAll('.return');
    for (const button of returnButtons) {
      button?.addEventListener('click', showActionButtons);
    }
  }

  function saveToStorage(key, value) {
    if (typeof Storage !== 'undefined') {
      let userStorage = JSON.parse(localStorage.getItem(windowGlobalData.account)) || {};
      userStorage[key] = value;
      localStorage.setItem(windowGlobalData.account, JSON.stringify(userStorage));
      console.log('Data saved to localStorage:', key);
    } else {
      console.log('Sorry, your browser does not support localStorage.');
    }
  }

  function albumSelectsControlsSetUp() {
    const selectAllButtons = document.querySelectorAll('[name="selectAll"]');
    for (const selectAllButton of selectAllButtons) {
      selectAllButton?.addEventListener('click', selectAllAlbums);
    }

    const selectSharedButtons = document.querySelectorAll('[name="selectShared"]');
    for (const selectSharedButton of selectSharedButtons) {
      selectSharedButton?.addEventListener('click', selectSharedAlbums);
    }

    const selectNotSharedButtons = document.querySelectorAll('[name="selectNonShared"]');
    for (const selectNotSharedButton of selectNotSharedButtons) {
      selectNotSharedButton?.addEventListener('click', selectNotSharedAlbums);
    }

    const resetAlbumSelectionButtons = document.querySelectorAll('[name="resetAlbumSelection"]');
    for (const resetAlbumSelectionButton of resetAlbumSelectionButtons) {
      resetAlbumSelectionButton?.addEventListener('click', resetAlbumSelection);
    }

    const refreshAlumbsButtons = document.querySelectorAll('.refresh-albums');
    for (const refreshAlumbsButton of refreshAlumbsButtons) {
      refreshAlumbsButton?.addEventListener('click', refreshAlbums);
    }
  }

  function selectAllAlbums() {
    let parent = this.parentNode.parentNode;
    let closestSelect = parent.querySelector('select');
    for (const option of closestSelect.options) {
      if (option.value) option.selected = true;
    }
    updateUI();
  }

  function selectSharedAlbums() {
    updateUI();
    let parent = this.parentNode.parentNode;
    let closestSelect = parent.querySelector('select');
    for (const option of closestSelect.options) {
      if (option.value) option.selected = option.classList.contains('shared');
    }
    updateUI();
  }

  function selectNotSharedAlbums() {
    let parent = this.parentNode.parentNode;
    let closestSelect = parent.querySelector('select');
    for (const option of closestSelect.options) {
      if (option.value) option.selected = !option.classList.contains('shared');

    }
    updateUI();
  }

  function resetAlbumSelection() {
    let parent = this.parentNode.parentNode;
    let closestSelect = parent.querySelector('select');
    for (const option of closestSelect.options) option.selected = false;
    updateUI();
  }

  async function refreshAlbums() {
    // ugly
    core.isProcessRunning = true;
    let albums = null;
    try{
      albums = await apiUtils.getAllAlbums();
      addAlbums(albums);
      saveToStorage('albums', albums);
      log('Albums Refreshed');
    }
    catch{
      log('Error refreshing albums', 'error');
    }
    core.isProcessRunning = false;
    updateUI();
  }

  function controlButttonsListeners(){
    const clearLogButton = document.getElementById('clearLog');
    clearLogButton.addEventListener('click', clearLog);
    const stopProcessButton = document.getElementById('stopProcess');
    stopProcessButton.addEventListener('click', stopProcess);
  }

  function clearLog(){
    const logContainer = document.getElementById('logArea');
    const logElements = Array.from(logContainer.childNodes);
    for(const logElement of logElements){
      logElement.remove();
    }
  }

  function stopProcess(){
    log('Stopping the process');
    core.isProcessRunning = false;
  }

  function advancedSettingsListenersSetUp() {

    function saveApiSettings(event) {
      event.preventDefault();

      const userInptSettings = getForm('.settings-form');

      userInptSettings.ignoreErrors = ignoreErrorsInput.checked;
      // Save values to localStorage
      saveToStorage('apiSettings', userInptSettings);
      log('Api settings saved');
    }

    function restoreApiDefaults() {

      // Save default values to localStorage
      saveToStorage('apiSettings', apiSettingsDefault);

      // Update the form with default values
      ignoreErrorsInput.checked = apiSettingsDefault.ignoreErrors;
      maxConcurrentApiReqInput.value = apiSettingsDefault.maxConcurrentApiReq;
      operationSizeInput.value = apiSettingsDefault.operationSize;
      lockedFolderOpSizeInput.value = apiSettingsDefault.lockedFolderOpSize;
      infoSizeInput.value = apiSettingsDefault.infoSize;
      log('Default api settings restored');
    }
    const ignoreErrorsInput = document.querySelector('input[name="ignoreErrors"]');
    const maxConcurrentApiReqInput = document.querySelector('input[name="maxConcurrentApiReq"]');
    const operationSizeInput = document.querySelector('input[name="operationSize"]');
    const lockedFolderOpSizeInput = document.querySelector('input[name="lockedFolderOpSize"]');
    const infoSizeInput = document.querySelector('input[name="infoSize"]');
    const defaultButton = document.querySelector('button[name="default"]');
    const settingsForm = document.querySelector('.settings-form');

    const restoredSettings = getFromStorage('apiSettings');

    ignoreErrorsInput.checked = restoredSettings?.ignoreErrors || apiSettingsDefault.ignoreErrors;
    maxConcurrentApiReqInput.value = restoredSettings?.maxConcurrentApiReq || apiSettingsDefault.maxConcurrentApiReq;
    operationSizeInput.value = restoredSettings?.operationSize || apiSettingsDefault.operationSize;
    lockedFolderOpSizeInput.value = restoredSettings?.lockedFolderOpSize || apiSettingsDefault.lockedFolderOpSize;
    infoSizeInput.value = restoredSettings?.infoSize || apiSettingsDefault.infoSize;

    // Add event listener for form submission
    settingsForm.addEventListener('submit', saveApiSettings);
    // Add event listener for "Default" button click
    defaultButton.addEventListener('click', restoreApiDefaults);
  }

  async function filterListenersSetUp() {
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

  async function initUI() {
    insertUi();
    actionsListenersSetUp();
    filterListenersSetUp();
    controlButttonsListeners();
    albumSelectsControlsSetUp();
    advancedSettingsListenersSetUp();
    updateUI();

    const cachedAlbums = getFromStorage('albums');
    if (cachedAlbums) {
      log('Cached Albums Restored');
      addAlbums(cachedAlbums);
    }
  }

  initUI();

})();

(function () {
  'use strict';
  var currentTab = null;
  var currentSortKey = 'artist';

  function popContent () {
    var contentView = document.getElementById('content-view');
    contentView.removeChild(contentView.lastChild);
  }
  function activateLibraryTab () {
    if (currentTab !== 'library') {
      currentTab = 'library';
      redraw();
    }
  }

  function activatePlaylistsTab () {
    if (currentTab !== 'playlists') {
      currentTab = 'playlists';
      redraw();
    }
  }

  function redraw () {
    redrawTopBar();
    if (currentTab === 'playlists') {
      redrawPlaylistsContent();
    } else if (currentTab === 'library') {
      redrawLibraryContent();
    }
  }

  function redrawTopBar () {
    var buttonList = document.getElementById('top-bar-button-list');
    var buttonId = currentTab + '-button';
    for (var i = 0; i < buttonList.children.length; i++) {
      var child = buttonList.children[i];
      if (child.id === buttonId) {
        child.classList.add('active');
      } else {
        child.classList.remove('active');
      }
    }
  }

  function prepareSortValue (str) {
    return str.trim().replace(/^The /, '').trim();
  }
  function executeSort (arr) {
    return arr.slice().sort(function (a, b) {
      var aValue = prepareSortValue(a[currentSortKey]);
      var bValue = prepareSortValue(b[currentSortKey]);
      return aValue.localeCompare(bValue);
    });
  }
  function sortAndRedraw (sortKey) {
    if (currentTab === 'library') {
      if (sortKey !== currentSortKey) {
        currentSortKey = sortKey;
        redraw();
      }
    } else {
      throw '[' + sortKey + '] sort is attempted when not in the right tab';
    }
  }
  function removeAllChildren (ele) {
    while (ele.lastChild) {
      ele.removeChild(ele.lastChild);
    }
  }
  function createSortButton (sortKey) {
    var button = document.createElement('button');
    button.classList.add('purple-button');
    button.classList.add('sort-method-button');

    var text = document.createElement('span');
    text.textContent = 'Sort by ' + sortKey;

    button.appendChild(text);
    button.addEventListener('click', function (e) {
      sortAndRedraw(sortKey);
    });

    return button;
  }
  function createSortMethodBar () {
    var bar = document.createElement('div');
    bar.classList.add('sort-method-button-bar');

    bar.appendChild(createSortButton('artist'));
    bar.appendChild(createSortButton('title'));
    return bar;
  }
  function redrawLibraryContent () {
    var musicList = document.createElement('ul');
    musicList.classList.add('music-item-list');

    musicList.appendChild(createSortMethodBar());
    executeSort(window.MUSIC_DATA['songs']).forEach(function (song) {
      musicList.appendChild(createSongItemNode(song));
    });

    var contentView = document.getElementById('content-view');
    removeAllChildren(contentView);
    contentView.appendChild(musicList);
  }
  function redrawPlaylistsContent () {
    var button = createNewPlaylistButtonNode();

    var playlistList = document.createElement('ul');
    playlistList.classList.add('music-item-list');
    playlistList.appendChild(button);
    window.MUSIC_DATA['playlists'].forEach(function (playlist) {
      playlistList.appendChild(createPlaylistItemNode(playlist));
    });

    var contentView = document.getElementById('content-view');
    removeAllChildren(contentView);
    contentView.appendChild(playlistList);
  }
  function createPlaylistSelectionBackgroundNode () {
    var background = document.createElement('div');
    background.classList.add('modal-dim');
    background.classList.add('modal-background');
    return background;
  }
  function createPlaylistSelectionTitleBarNode (closeModalCallback) {
    var titleBar = document.createElement('div');
    titleBar.classList.add('playlist-selection-title');

    var title = document.createElement('span');
    title.textContent = 'Choose playlist';

    var cancel = document.createElement('span');
    cancel.classList.add('playlist-selection-cancel');
    addGlyphicon(cancel, 'remove');
    cancel.addEventListener('click', closeModalCallback);

    titleBar.appendChild(title);
    titleBar.appendChild(cancel);
    return titleBar;
  }
  function createPlaylistSelectionPlaylistNode (playlist, closeModalCallback) {
    var ele = document.createElement('span');
    ele.textContent = playlist['name'];
    ele.classList.add('playlist-selection-item');
    ele.classList.add('playlist-selection-row');
    ele.addEventListener('click', closeModalCallback);
    return ele;
  }
  function createPlaylistSelectionModalNode () {
    var modal = document.createElement('div');
    modal.classList.add('playlist-selection');

    function closeModalCallback (e) {
      popContent();
      popContent();
    }

    modal.appendChild(createPlaylistSelectionTitleBarNode(closeModalCallback));
    window.MUSIC_DATA['playlists'].forEach(function (playlist) {
      modal.appendChild(createPlaylistSelectionPlaylistNode(playlist, closeModalCallback));
    });
    return modal;
  }
  function createSongItemNode (song) {
    var item = document.createElement('li');
    item.classList.add('music-item');

    var musicIcon = document.createElement('div');
    musicIcon.classList.add('music-cover-thumbnail');

    var playButton = document.createElement('span');
    playButton.classList.add('music-item-button');
    addGlyphicon(playButton, 'play');

    var addButton = document.createElement('span');
    addButton.classList.add('music-item-button');
    addGlyphicon(addButton, 'plus-sign');
    addButton.addEventListener('click', function (e) {
      var contentView = document.getElementById('content-view');
      contentView.appendChild(createPlaylistSelectionBackgroundNode());
      contentView.appendChild(createPlaylistSelectionModalNode());
    });

    item.appendChild(musicIcon);
    item.appendChild(createMusicTitleSubtitleNode(song['title'], song['artist']));
    item.appendChild(addButton);
    item.appendChild(playButton);

    return item;
  }

  function createMusicTitleSubtitleNode (title, subtitle) {
    var node = document.createElement('div');
    node.classList.add('music-title-subtitle');
    node.appendChild(createMusicTitleNode(title));
    node.appendChild(createMusicSubtitleNode(subtitle));
    return node;
  }

  function createMusicTitleNode (text) {
    var musicTitle = document.createElement('span');
    musicTitle.classList.add('music-title');
    musicTitle.classList.add('text-cut-short');
    musicTitle.textContent = text;
    return musicTitle;
  }

  function createMusicSubtitleNode (text) {
    var musicSubtitle = document.createElement('span');
    musicSubtitle.classList.add('music-subtitle');
    musicSubtitle.classList.add('text-cut-short');
    musicSubtitle.textContent = text;
    return musicSubtitle;
  }

  function createNewPlaylistButtonNode () {
    var button = document.createElement('button');
    button.id = 'new-playlist-button';
    button.classList.add('purple-button');

    var icon = document.createElement('span');
    addGlyphicon(icon, 'plus');

    var text = document.createElement('span');
    text.textContent = 'Playlist';

    button.appendChild(icon);
    button.appendChild(text);

    return button;
  }
  function createPlaylistItemNode (playlist) {
    var item = document.createElement('li');
    item.classList.add('music-item');

    var musicIcon = document.createElement('div');
    musicIcon.classList.add('music-cover-thumbnail');

    var expandButton = document.createElement('span');
    expandButton.classList.add('music-item-button');
    addGlyphicon(expandButton, 'chevron-right');

    item.appendChild(musicIcon);
    item.appendChild(createMusicTitleSubtitleNode(playlist['name']));
    item.appendChild(expandButton);

    return item;
  }
  function addGlyphicon (ele, name) {
    ele.classList.add('glyphicon');
    ele.classList.add('glyphicon-' + name);
  }

  function initialize () {
    var libraryButton = document.getElementById('library-button');
    libraryButton.addEventListener('click', function (e) {
      activateLibraryTab();
    });
    var playlistsButton = document.getElementById('playlists-button');
    playlistsButton.addEventListener('click', function (e) {
      activatePlaylistsTab();
    });
    activateLibraryTab();
  }
  initialize();
})();

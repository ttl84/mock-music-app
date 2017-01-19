var currentTab = null;
function activateLibraryTab() {
  if (currentTab !== 'library') {
    currentTab = 'library';
    redraw();
  }
}

function activatePlaylistsTab() {
  if (currentTab !== 'playlists') {
    currentTab = 'playlists';
    redraw();
  }
}

function redraw() {
  redrawTopBar();
  if(currentTab === 'playlists') {
    redrawPlaylistsContent();
  } else if(currentTab === 'library') {
    redrawLibraryContent();
  }
}

function redrawTopBar() {
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

function removeAllChildren(ele) {
  while(ele.lastChild) {
    ele.removeChild(ele.lastChild);
  }
}
function redrawLibraryContent() {
  var musicList = document.createElement('ul');
  musicList.classList.add('music-item-list');
  window.MUSIC_DATA['songs'].forEach(function(song) {
    musicList.appendChild(createSongItemNode(song));
  });
}
function createSongItemNode(song) {
  var item = document.createElement('li');
  item.classList.add('music-item');

  var musicIcon = document.createElement('div');
  musicIcon.classList.add('music-cover-thumbnail');

  var expandButton = document.createElement('span');
  expandButton.classList.add('music-item-button');
  addGlyphicon(expandButton, 'chevron-right');

  item.appendChild(musicIcon);
  item.appendChild(createMusicTitleSubtitleNode(song['title'], song['artist']));
  item.appendChild(expandButton);

  return item;
}

function createMusicTitleSubtitleNode(title, subtitle) {
  var node = document.createElement('div');
  node.classList.add('music-title-subtitle');
  node.appendChild(createMusicTitleNode(title));
  node.appendChild(createMusicSubtitleNode(subtitle));
  return node;
}

function createMusicTitleNode(text) {
  var musicTitle = document.createElement('span');
  musicTitle.classList.add('music-title');
  musicTitle.textContent = text;
  return musicTitle;
}

function createMusicSubtitleNode(text) {
  var musicSubtitle = document.createElement('span');
  musicSubtitle.classList.add('music-subtitle');
  musicSubtitle.textContent = text;
  return musicSubtitle;
}
function redrawPlaylistsContent() {
  var button = createNewPlaylistButtonNode();

  var playlistList = document.createElement('ul');
  playlistList.classList.add('music-item-list');
  window.MUSIC_DATA['playlists'].forEach(function(playlist) {
    playlistList.appendChild(createPlaylistItemNode(playlist));
  });

  var contentView = document.getElementById('content-view');
  removeAllChildren(contentView);
  contentView.appendChild(button);
  contentView.appendChild(playlistList);
}
function createNewPlaylistButtonNode() {
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
function createPlaylistItemNode(playlist) {
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
function addGlyphicon(ele, name) {
  ele.classList.add('glyphicon');
  ele.classList.add('glyphicon-' + name);
}
function createText(t) {
  var ele = document.createElement('span');
  ele.textContent = t;
  return ele;
}

(function main() {
  activatePlaylistsTab();
})();

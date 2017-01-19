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
function redrawPlaylistsContent() {
  var button = createNewPlaylistButtonNode();

  var playlistList = document.createElement('ul');
  playlistList.id = 'playlist-list';
  playlistList.classList.add('music-item-list');
  var playlistListData = window.MUSIC_DATA['playlists'];
  playlistListData.forEach(function(playlist) {
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

  var musicTitle = document.createElement('span');
  musicTitle.classList.add('music-title');
  musicTitle.textContent = playlist['name'];

  var expandButton = document.createElement('span');
  expandButton.classList.add('music-item-button');
  addGlyphicon(expandButton, 'chevron-right');


  item.appendChild(musicIcon);
  item.appendChild(musicTitle);
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

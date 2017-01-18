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
  var playlistList = document.getElementById('playlist-list');
  removeAllChildren(playlistList);
  var playlistListData = window.MUSIC_DATA['playlists'];
  playlistListData.forEach(function(playlist) {
    playlistList.appendChild(createPlaylistItemNode(playlist));
  });
}
function createPlaylistItemNode(playlist) {
  var item = document.createElement('li');
  item.classList.add('music-item');

  var musicIcon = document.createElement('div');
  musicIcon.classList.add('music-cover-thumbnail');

  var musicTitle = document.createElement('span');
  musicTitle.classList.add('music-title');

  var expandButton = document.createElement('span');
  addGlyphicon(expandButton, 'chevron-right');
  expandButton.classList.add('playlist-expand-button');

  item.appendChild(musicIcon);
  item.appendChild(musicTitle);
  item.appendChild(expandButton);
}
function addGlyphicon(elename) {
  ele.classList.add('glyphicon');
  ele.classList.add('glyphicon-' + name);
}
function createText(t) {
  var ele = document.createElement('span');
  ele.textContent = t;
  return ele;
}

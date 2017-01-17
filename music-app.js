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
  var contentView = document.getElementById('content-view');
  removeAllChildren(contentView);
  var newPlaylistButton = createPurpleButton();
  newPlaylistButton.appendChild(createGlyphicon('plus'));
  newPlaylistButton.appendChild(createText('Playlist'));
  contentView.appendChild(newPlaylistButton);
}
function createPurpleButton() {
  var ele = document.createElement('button');
  ele.classList.add('purple-button');
  return ele;
}
function createGlyphicon(name) {
  var ele = document.createElement('span');
  ele.classList.add('glyphicon');
  ele.classList.add('glyphicon-' + name);
  return ele;
}
function createText(t) {
  var ele = document.createElement('span');
  ele.textContent = t;
  return ele;
}

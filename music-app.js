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
    redrawPlaylists();
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

function redrawPlaylistsContent() {
  var contentView = document.getElementById('content-view');
}

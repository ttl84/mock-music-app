"use strict";
var libraryButton = document.getElementById('library-button');
var playlistButton = document.getElementById('playlist-button');
var searchButton = document.getElementById('search-button');

function PlayerState() {
  this.currentTab = null;
}
PlayerState.prototype.activateLibraryTab = function() {
  if(this.currentTab !== 'library') {
    this.currentTab = 'library';
  }
  libraryButton.classList.add('active');
  playlistButton.classList.remove('active');
  searchButton.classList.remove('active');
};

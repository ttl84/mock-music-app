$(function () {
  'use strict'
  // states
  var currentTab = null
  var currentSortKey = 'artist'
  var currentSelectedSongID = null
  var currentSelectedPlaylistID = null
  var currentSearchTerm = ''
  var currentPlaylistResults = []
  var currentSongResults = []
  var currentPendingPlaylistName = null
  var MUSIC_DATA = {
  }

  // singleton instances
  var currentMusicItemListInstance = null
  var currentSearchBarInstance = null
  var currentSearchInputInstance = null

  function popContent () {
    var contentView = document.getElementById('content-view')
    contentView.removeChild(contentView.lastChild)
  }
  function activateLibraryTab () {
    if (currentTab !== 'library') {
      currentTab = 'library'
      window.history.pushState({}, 'hello', 'library')
      redraw()
    }
  }

  function activatePlaylistsTab () {
    if (currentTab !== 'playlists') {
      currentTab = 'playlists'
      window.history.pushState({}, 'hello', 'playlists')
      redraw()
    }
  }
  function activateSearchTab () {
    if (currentTab !== 'search') {
      currentTab = 'search'
      window.history.pushState({}, 'hello', 'search')
      redraw()
    }
  }

  function redraw () {
    redrawTopBar()
    if (currentTab === 'playlists') {
      redrawPlaylistListContent()
    } else if (currentTab === 'library') {
      redrawLibraryContent()
    } else if (currentTab === 'search') {
      redrawSearchContent()
    } else if (currentTab === 'playlist-content') {
      redrawPlaylistContent()
    }
  }

  function redrawTopBar () {
    var buttonList = document.getElementById('top-bar-button-list')
    var buttonId = currentTab + '-button'
    for (var i = 0; i < buttonList.children.length; i++) {
      var child = buttonList.children[i]
      if (child.id === buttonId) {
        child.classList.add('active')
      } else {
        child.classList.remove('active')
      }
    }
    if (currentTab === 'playlist-content') {
      document.getElementById('playlists-button').classList.add('active')
    }
  }
  function redrawLibraryContent () {
    var musicList = getMusicItemListInstance()
    removeAllChildren(musicList)

    musicList.appendChild(createSortMethodBar())
    ajaxGetSongs(function (songs) {
      executeSort(songs).forEach(function (song) {
        musicList.appendChild(createSongItemNode(song))
      })
      var contentView = document.getElementById('content-view')
      removeAllChildren(contentView)
      contentView.appendChild(musicList)
    })
  }
  function redrawPlaylistListContent () {
    var button = createNewPlaylistButtonBarNode()

    var playlistList = document.createElement('ul')
    playlistList.classList.add('music-item-list')
    playlistList.appendChild(button)
    ajaxGetPlaylists(function (playlists) {
      playlists.forEach(function (playlist) {
        playlistList.appendChild(createPlaylistItemNode(playlist))
      })

      var contentView = document.getElementById('content-view')
      removeAllChildren(contentView)
      contentView.appendChild(playlistList)
    })
  }
  function redrawPlaylistContent () {
    var playlistPromise = new Promise(ajaxGetPlaylists).then(function (playlists) {
      return playlists.find(function (playlist) {
        return playlist['id'] === currentSelectedPlaylistID
      })
    })
    var songmapPromise = new Promise(ajaxGetSongs).then(function (songs) {
      return createID2SongMap(songs)
    })

    Promise.all([playlistPromise, songmapPromise]).then(function (values) {
      var playlist = values[0]
      var songMap = values[1]

      var playlistTitle = createPlaylistTitleNode(playlist['name'])
      var songList = document.createElement('ul')
      songList.classList.add('music-item-list')
      songList.appendChild(playlistTitle)
      playlist['songs'].forEach(function (id) {
        songList.appendChild(createSongItemNode(songMap[id]))
      })
      var contentView = document.getElementById('content-view')
      removeAllChildren(contentView)
      contentView.appendChild(songList)
    })
  }
  function redrawSearchContent () {
    var resultList = getMusicItemListInstance()
    removeAllChildren(resultList)

    var contentView = document.getElementById('content-view')
    removeAllChildren(contentView)
    contentView.appendChild(getSearchBarInstance())
    contentView.appendChild(resultList)

    getSearchInputInstance().value = ''
  }
  function redrawSearchResults () {
    var resultList = getMusicItemListInstance()
    removeAllChildren(resultList)

    if (currentPlaylistResults.length > 0) {
      currentPlaylistResults.forEach(function (playlist) {
        resultList.appendChild(createPlaylistItemNode(playlist))
      })
    }
    if (currentSongResults.length > 0) {
      currentSongResults.forEach(function (song) {
        resultList.appendChild(createSongItemNode(song))
      })
    }
  }
  function prepareSortValue (str) {
    return str.trim().replace(/^The /, '').trim()
  }
  function executeSort (arr) {
    return arr.slice().sort(function (a, b) {
      var aValue = prepareSortValue(a[currentSortKey])
      var bValue = prepareSortValue(b[currentSortKey])
      return aValue.localeCompare(bValue)
    })
  }

  function executePlaylistSearch (playlists) {
    return playlists.filter(function match (playlist) {
      return playlist['name'].search(currentSearchTerm) !== -1
    })
  }
  function executeSongSearch (songs) {
    return songs.filter(function match (song) {
      return song['title'].search(currentSearchTerm) !== -1 || song['artist'].search(currentSearchTerm) !== -1
    })
  }
  function sortAndRedraw (sortKey) {
    if (currentTab === 'library') {
      if (sortKey !== currentSortKey) {
        currentSortKey = sortKey
        redraw()
      }
    } else {
      throw '[' + sortKey + '] sort is attempted when not in the right tab'
    }
  }
  function removeAllChildren (ele) {
    while (ele.lastChild) {
      ele.removeChild(ele.lastChild)
    }
  }
  function getMusicItemListInstance () {
    if (!currentMusicItemListInstance) {
      currentMusicItemListInstance = document.createElement('ul')
      currentMusicItemListInstance.classList.add('music-item-list')
    }
    return currentMusicItemListInstance
  }
  function getSearchBarInstance () {
    if (!currentSearchBarInstance) {
      var bar = document.createElement('div')
      bar.id = 'search-bar'
      bar.classList.add('content-view-flex-row')
      bar.appendChild(getSearchInputInstance())

      currentSearchBarInstance = bar
    }
    return currentSearchBarInstance
  }
  function getSearchInputInstance () {
    if (!currentSearchInputInstance) {
      currentSearchInputInstance = createSearchInputNode()
      currentSearchInputInstance.classList.add('content-view-flex-row-item')
    }
    return currentSearchInputInstance
  }
  function createSearchInputNode () {
    var input = document.createElement('input')
    input.classList.add('search-bar')
    input.setAttribute('placeholder', 'Search')
    input.setAttribute('type', 'text')
    input.addEventListener('input', function (e) {
      currentSearchTerm = new RegExp(input.value, 'i')
      var playlistSearchPromise = new Promise(ajaxGetPlaylists).then(function (playlists) {
        currentPlaylistResults = executePlaylistSearch(playlists)
      })
      var songSearchPromise = new Promise(ajaxGetSongs).then(function (songs) {
        currentSongResults = executeSongSearch(songs)
      })
      Promise.all([playlistSearchPromise, songSearchPromise]).then(function () {
        redrawSearchResults()
      })
    })
    return input
  }
  function createID2SongMap (songs) {
    var songMap = []
    songs.forEach(function (song) {
      songMap[song['id']] = song
    })
    return songMap
  }
  function createPlaylistTitleNode (name) {
    var title = document.createElement('span')
    title.textContent = name
    title.classList.add('playlist-content-title')
    return title
  }
  function createSortButton (sortKey) {
    var button = document.createElement('button')
    button.classList.add('purple-button')
    button.classList.add('content-view-flex-row-item')

    var text = document.createElement('span')
    text.textContent = 'Sort by ' + sortKey

    button.appendChild(text)
    button.addEventListener('click', function (e) {
      sortAndRedraw(sortKey)
    })

    return button
  }
  function createSortMethodBar () {
    var bar = document.createElement('div')
    bar.classList.add('content-view-flex-row')

    bar.appendChild(createSortButton('artist'))
    bar.appendChild(createSortButton('title'))
    return bar
  }

  function createPlaylistSelectionBackgroundNode () {
    var background = document.createElement('div')
    background.classList.add('modal-dim')
    background.classList.add('modal-background')
    return background
  }
  function createPlaylistSelectionTitleBarNode (closeModalCallback) {
    var titleBar = document.createElement('div')
    titleBar.classList.add('playlist-selection-title')

    var title = document.createElement('span')
    title.textContent = 'Choose playlist'

    var cancel = document.createElement('span')
    cancel.classList.add('playlist-selection-cancel')
    addGlyphicon(cancel, 'remove')
    cancel.addEventListener('click', function (e) {
      closeModalCallback()
    })

    titleBar.appendChild(title)
    titleBar.appendChild(cancel)
    return titleBar
  }
  function createPlaylistSelectionPlaylistNode (playlist, closeModalCallback) {
    var ele = document.createElement('span')
    ele.textContent = playlist['name']
    ele.classList.add('playlist-selection-item')
    ele.classList.add('playlist-selection-row')
    ele.addEventListener('click', function (e) {
      currentSelectedPlaylistID = playlist['id']
      ajaxAddToPlaylist(function (response) {
        ajaxGetPlaylists(function (playlists) {
          MUSIC_DATA['playlists'].find(function match (playlist) {
            return playlist['id'] === currentSelectedPlaylistID
          })['songs'].push(currentSelectedSongID)
          currentSelectedSongID = null
          currentSelectedPlaylistID = null
          closeModalCallback()
        }, function error (err) {
          currentSelectedSongID = null
          currentSelectedPlaylistID = null
          closeModalCallback()
          console.log('ajax error: ' + err)
        })

      })
    })
    return ele
  }
  function createPlaylistSelectionModalNode () {
    var modal = document.createElement('div')
    modal.classList.add('playlist-selection')

    function closeModalCallback () {
      popContent()
      popContent()
    }

    modal.appendChild(createPlaylistSelectionTitleBarNode(closeModalCallback))
    ajaxGetPlaylists(function (playlists) {
      playlists.forEach(function (playlist) {
        modal.appendChild(createPlaylistSelectionPlaylistNode(playlist, closeModalCallback))
      })
    })

    return modal
  }
  function createSongItemNode (song) {
    var item = document.createElement('li')
    item.classList.add('music-item')

    var musicIcon = document.createElement('div')
    musicIcon.classList.add('music-cover-thumbnail')

    var playButton = document.createElement('span')
    playButton.classList.add('music-item-button')
    addGlyphicon(playButton, 'play')

    var addButton = document.createElement('span')
    addButton.classList.add('music-item-button')
    addGlyphicon(addButton, 'plus-sign')
    addButton.addEventListener('click', function (e) {
      currentSelectedSongID = song['id']
      var contentView = document.getElementById('content-view')
      contentView.appendChild(createPlaylistSelectionBackgroundNode())
      contentView.appendChild(createPlaylistSelectionModalNode())
    })

    item.appendChild(musicIcon)
    item.appendChild(createMusicTitleSubtitleNode(song['title'], song['artist']))
    item.appendChild(addButton)
    item.appendChild(playButton)

    return item
  }

  function createMusicTitleSubtitleNode (title, subtitle) {
    var node = document.createElement('div')
    node.classList.add('music-title-subtitle')
    node.appendChild(createMusicTitleNode(title))
    node.appendChild(createMusicSubtitleNode(subtitle))
    return node
  }

  function createMusicTitleNode (text) {
    var musicTitle = document.createElement('span')
    musicTitle.classList.add('music-title')
    musicTitle.classList.add('text-cut-short')
    musicTitle.textContent = text
    return musicTitle
  }

  function createMusicSubtitleNode (text) {
    var musicSubtitle = document.createElement('span')
    musicSubtitle.classList.add('music-subtitle')
    musicSubtitle.classList.add('text-cut-short')
    musicSubtitle.textContent = text
    return musicSubtitle
  }
  function createFlexInputFieldNode () {
    var input = document.createElement('input')
    input.classList.add('content-view-flex-row-item')
    input.classList.add('search-bar')
    input.setAttribute('type', 'text')
    return input
  }
  function createFlexButtonNode () {
    var button = document.createElement('button')
    button.classList.add('purple-button')
    button.classList.add('content-view-flex-row-item')
    return button
  }
  function createFlexBarNode (type) {
    if (!type) {
      type = 'div'
    }
    var bar = document.createElement(type)
    bar.classList.add('content-view-flex-row')
    return bar
  }
  function createFlexBarItemNode (type) {
    if (!type) {
      type = 'div'
    }
    var item = document.createElement(type)
    item.classList.add('content-view-flex-row-item')
    return item
  }

  function createNewPlaylistButtonNode () {
    var button = createFlexButtonNode()

    var icon = document.createElement('span')
    addGlyphicon(icon, 'plus')

    var text = document.createElement('span')
    text.textContent = 'Playlist'

    button.appendChild(icon)
    button.appendChild(text)
    return button
  }
  function createNewPlaylistButtonBarNode () {
    var bar = createFlexBarNode()

    var newPlaylistButton = createNewPlaylistButtonNode()
    bar.appendChild(newPlaylistButton)
    newPlaylistButton.addEventListener('click', function (e) {
      var form = document.createElement('form')
      form.classList.add('content-view-flex-row-item')
      bar.removeChild(newPlaylistButton)
      bar.appendChild(form)

      var errorBar = createFlexBarNode()
      var errorMessageArea = createFlexBarItemNode('span')
      errorMessageArea.classList.add('error-text')
      errorBar.appendChild(errorMessageArea)

      var bar1 = createFlexBarNode()
      form.appendChild(bar1)

      var inputField = createFlexInputFieldNode()
      bar1.appendChild(inputField)

      var bar2 = createFlexBarNode()
      form.appendChild(bar2)

      var submitButton = createFlexButtonNode()
      bar2.appendChild(submitButton)
      submitButton.textContent = 'create'
      submitButton.setAttribute('type', 'button')
      submitButton.addEventListener('click', function (e) {
        if (typeof (inputField.value) === 'string' && inputField.value !== '') {
          currentPendingPlaylistName = inputField.value
          ajaxAddNewPlaylist(function (result) {
            MUSIC_DATA['playlists'].push(result['value'])
            bar.removeChild(form)
            bar.appendChild(newPlaylistButton)
            redraw()
          }, function (err) {
            errorMessageArea.textContent = JSON.stringify(err)
            form.insertBefore(errorBar, bar1)
          })
        } else {
          errorMessageArea.textContent = 'empty name is not allowed'
          form.insertBefore(errorBar, bar1)
        }
      })

      var cancelButton = createFlexButtonNode()
      bar2.appendChild(cancelButton)
      cancelButton.textContent = 'cancel'
      cancelButton.setAttribute('type', 'button')
      cancelButton.addEventListener('click', function (e) {
        bar.removeChild(form)
        bar.appendChild(newPlaylistButton)
      })
    })
    return bar
  }
  function createPlaylistItemNode (playlist) {
    var item = document.createElement('li')
    item.classList.add('music-item')

    var musicIcon = document.createElement('div')
    musicIcon.classList.add('music-cover-thumbnail')

    var expandButton = document.createElement('span')
    expandButton.classList.add('music-item-button')
    addGlyphicon(expandButton, 'chevron-right')

    item.appendChild(musicIcon)
    item.appendChild(createMusicTitleSubtitleNode(playlist['name']))
    item.appendChild(expandButton)
    item.addEventListener('click', function (e) {
      currentSelectedPlaylistID = playlist['id']
      currentTab = 'playlist-content'
      redraw()
    })

    return item
  }
  function addGlyphicon (ele, name) {
    ele.classList.add('glyphicon')
    ele.classList.add('glyphicon-' + name)
  }

  function ajaxGetSongs (success, error) {
    if (MUSIC_DATA['songs'] === undefined) {
      $.ajax({
        url: '/api/songs',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
          MUSIC_DATA['songs'] = data['songs']
          success(MUSIC_DATA['songs'])
        },
        error: function (jqxhr, description, errorThrown) {
          error(jqxhr.responseJSON)
        }
      })
    } else {
      success(MUSIC_DATA['songs'])
    }
  }

  function ajaxGetPlaylists (success, error) {
    if (MUSIC_DATA['playlists'] === undefined) {
      $.ajax({
        url: '/api/playlists',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
          MUSIC_DATA['playlists'] = data['playlists']
          success(MUSIC_DATA['playlists'])
        },
        error: function (jqxhr, description, errorThrown) {
          error(jqxhr.responseJSON)
        }
      })
    } else {
      success(MUSIC_DATA['playlists'])
    }
  }

  function ajaxAddToPlaylist (success, error) {
    if (currentSelectedPlaylistID !== null && currentSelectedSongID !== null) {
      $.ajax({
        url: '/api/playlists',
        method: 'POST',
        data: {
          'method': 'add-song-to-playlist',
          'playlist-id': currentSelectedPlaylistID,
          'song-id': currentSelectedSongID
        },
        dataType: 'json',
        success: function (data) {
          if (success !== undefined) {
            success(data)
          }
        },
        error: function (jqxhr, description, errorThrown) {
          if (error !== undefined) {
            error(jqxhr.responseJSON)
          }
        }
      })
    } else {
      throw "playlist or song is not selected"
    }
  }

  function ajaxAddNewPlaylist (success, error) {
    if (typeof (currentPendingPlaylistName) === 'string' && currentPendingPlaylistName !== '') {
      $.ajax({
        url: '/api/playlists',
        method: 'POST',
        data: {
          'method': 'add-new-playlist',
          'playlist-name': currentPendingPlaylistName
        },
        dataType: 'json',
        success: function (data) {
          if (success !== undefined) {
            success(data)
          }
        },
        error: function (jqxhr, description, errorThrown) {
          if (error !== undefined) {
            error(jqxhr.responseJSON)
          }
        }
      })
    } else {
      throw "playlist name is not string"
    }
  }

  $('#library-button').click(function (e) {
    activateLibraryTab()
  })
  $('#playlists-button').click(function (e) {
    activatePlaylistsTab()
  })
  $('#search-button').click(function (e) {
    activateSearchTab()
  })

  function switchTabBasedOnPath () {
    if (window.location.pathname === '/playlists') {
      activatePlaylistsTab()
    } else if (window.location.pathname === '/library') {
      activateLibraryTab()
    } else if (window.location.pathname === '/search') {
      activateSearchTab()
    }
  }

  switchTabBasedOnPath()

  window.addEventListener('popstate', function () {
    switchTabBasedOnPath()
  })
})

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
  var MUSIC_DATA = {
  }

  // singleton instances
  var currentMusicItemListInstance = null
  var currentSearchBarInstance = null
  var currentSearchInputInstance = null
  var currentUserNameInputInstance = null
  var currentUserPasswordInputInstance = null
  var currentLoginButtonInstance = null

  function switchTabCleanUp () {
    getSearchInputInstance().value = ''
    currentSelectedSongID = null
    currentSelectedPlaylistID = null
  }

  function activateLoginTab () {
    if (currentTab !== 'login') {
      currentTab = 'login'
      window.history.pushState({}, 'hello', 'login')
      switchTabCleanUp()
      redraw()
    }
  }

  function activateLibraryTab () {
    if (currentTab !== 'library') {
      currentTab = 'library'
      window.history.pushState({}, 'hello', 'library')
      switchTabCleanUp()
      redraw()
    }
  }

  function activatePlaylistsTab () {
    if (currentTab !== 'playlists') {
      currentTab = 'playlists'
      window.history.pushState({}, 'hello', 'playlists')
      switchTabCleanUp()
      redraw()
    }
  }
  function activateSearchTab () {
    if (currentTab !== 'search') {
      currentTab = 'search'
      window.history.pushState({}, 'hello', 'search')
      switchTabCleanUp()
      redraw()
    }
  }

  function redraw () {
    redrawTopBar()
    if (currentTab === 'login') {
      redrawLoginContent()
    } else if (currentTab === 'playlists') {
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
    if (currentTab === 'login') {
      buttonList.classList.add('hidden')
    } else {
      buttonList.classList.remove('hidden')
    }
  }

  function redrawLoginContent () {
    var contentView = document.getElementById('content-view')
    removeAllChildren(contentView)

    var column = createFlexColumn()
    var username = getUserNameInputInstance()
    var password = getUserPasswordInputInstance()
    var login = getLoginButtonInstance()
    login.addEventListener('click', e => {
      ajaxLogin(username.value, password.value).then(result => {
        activatePlaylistsTab()
      }, error => {
        console.log(error.reason)
      })
    })
    column.appendChild(username)
    column.appendChild(password)
    column.appendChild(login)

    contentView.appendChild(column)
  }

  function redrawLibraryContent () {
    var musicList = getMusicItemListInstance()
    removeAllChildren(musicList)

    musicList.appendChild(createSortMethodBar())
    getSongs().then(function (songs) {
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
    getPlaylists().then(function (playlists) {
      playlists.forEach(function (playlist) {
        playlistList.appendChild(createPlaylistItemNode(playlist))
      })

      var contentView = document.getElementById('content-view')
      removeAllChildren(contentView)
      contentView.appendChild(playlistList)
    })
  }
  function redrawPlaylistContent () {
    var playlistPromise = getPlaylists().then(function (playlists) {
      return playlists.find(function (playlist) {
        return playlist['id'] === currentSelectedPlaylistID
      })
    })
    var songmapPromise = getSongs().then(function (songs) {
      return createID2SongMap(songs)
    })

    Promise.all([playlistPromise, songmapPromise]).then(function (values) {
      var playlist = values[0]
      var songMap = values[1]

      var playlistHeader = createFlexRow()
      var playlistTitle = createPlaylistTitleNode(playlist['name'])
      playlistTitle.classList.add('flex-item')
      var addUserButton = createButtonNode()
      addUserButton.classList.add('purple-button')
      addUserButton.classList.add('flex-item')
      var text = document.createElement('span')
      text.textContent = 'Add user'
      addUserButton.appendChild(text)
      addUserButton.addEventListener('click', e => {
        var pGetUsers = ajaxGetUsers()

        var modalContent = createModalContent()
        modalContent.classList.add('flex-column')

        var background = createModalBackground()
        background.appendChild(modalContent)

        var contentView = document.getElementById('content-view')
        contentView.appendChild(background)

        pGetUsers.then(result => {
          var users = result['users']
          users.forEach(user => {
            console.log(JSON.stringify(user))
          })
        })
      })
      playlistHeader.appendChild(playlistTitle)
      playlistHeader.appendChild(addUserButton)

      var songList = getMusicItemListInstance()
      removeAllChildren(songList)
      songList.appendChild(playlistHeader)
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

    if (getSearchInputInstance().value !== '') {
      redrawSearchResults()
    }
  }
  function redrawSearchResults () {
    var resultList = getMusicItemListInstance()
    removeAllChildren(resultList)

    if (getSearchInputInstance().value === '') {
      return
    }

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
  function getUserNameInputInstance () {
    if (!currentUserNameInputInstance) {
      currentUserNameInputInstance = createTextInputNode()
      currentUserNameInputInstance.classList.add('flex-item')
      currentUserNameInputInstance.classList.add('text-input-bar')
      currentUserNameInputInstance.setAttribute('placeholder', 'Username')
    }
    return currentUserNameInputInstance
  }
  function getUserPasswordInputInstance () {
    if (!currentUserPasswordInputInstance) {
      currentUserPasswordInputInstance = createTextInputNode()
      currentUserPasswordInputInstance.classList.add('flex-item')
      currentUserPasswordInputInstance.classList.add('text-input-bar')
      currentUserPasswordInputInstance.setAttribute('placeholder', 'Password')
    }
    return currentUserPasswordInputInstance
  }
  function getLoginButtonInstance () {
    if (!currentLoginButtonInstance) {
      currentLoginButtonInstance = createButtonNode()
      currentLoginButtonInstance.classList.add('purple-button')
      currentLoginButtonInstance.classList.add('flex-item')

      var text = document.createElement('span')
      text.textContent = 'Log in'

      currentLoginButtonInstance.appendChild(text)
    }

    return currentLoginButtonInstance
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
    var input = createTextInputNode()
    input.classList.add('text-input-bar')
    input.setAttribute('placeholder', 'Search')
    input.addEventListener('input', function (e) {
      currentSearchTerm = new RegExp(input.value, 'i')
      var playlistSearchPromise = getPlaylists().then(function (playlists) {
        currentPlaylistResults = executePlaylistSearch(playlists)
      })
      var songSearchPromise = getSongs().then(function (songs) {
        currentSongResults = executeSongSearch(songs)
      })
      Promise.all([playlistSearchPromise, songSearchPromise]).then(function () {
        redrawSearchResults()
      })
    })
    return input
  }
  function createFlexColumn () {
    var column = document.createElement('div')
    column.classList.add('flex-column')
    return column
  }
  function createFlexRow () {
    var row = document.createElement('div')
    row.classList.add('flex-row')
    return row
  }
  function createTextInputNode () {
    var input = document.createElement('input')
    input.setAttribute('type', 'text')
    return input
  }
  function createButtonNode () {
    var button = document.createElement('button')
    return button
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
    var button = createFlexButtonNode()

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

  function createModalContent () {
    var modalContent = document.createElement('div')
    modalContent.classList.add('modal-content')

    return modalContent
  }

  function createModalBackground () {
    var background = document.createElement('div')
    background.classList.add('modal')
    background.id = 'modal-background'
    return background
  }
  function createPlaylistSelectionModalNode () {
    var background = document.createElement('div')
    background.classList.add('modal')
    background.id = 'current-modal'
    function closeModalCallback () {
      var myself = document.getElementById('current-modal')
      myself.parentNode.removeChild(myself)
      currentSelectedSongID = null
      redraw()
    }

    var modalContent = document.createElement('div')
    background.appendChild(modalContent)
    modalContent.classList.add('modal-content')

    modalContent.appendChild(createPlaylistSelectionTitleBarNode(closeModalCallback))
    getPlaylists().then(function (playlists) {
      playlists.forEach(function (playlist) {
        var row = createPlaylistSelectionPlaylistNode(playlist, closeModalCallback)
        modalContent.appendChild(row)
      })
    })
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
      ajaxAddToPlaylist(currentSelectedSongID, playlist['id']).then(function (_) {
        getPlaylists().then(function (playlists) {
          playlists.find(function match (ele) {
            return playlist['id'] === ele['id']
          })['songs'].push(currentSelectedSongID)
          closeModalCallback()
        })
      }, function error (err) {
        closeModalCallback()
        console.log(err)
      })
    })
    return ele
  }

  function createSongItemNode (song) {
    var item = document.createElement('li')
    item.classList.add('music-item')

    var musicIcon = document.createElement('div')
    musicIcon.classList.add('music-cover-thumbnail')

    var buttonGroup = document.createElement('div')
    buttonGroup.classList.add('music-item-button-group')

    var playButton = document.createElement('span')
    playButton.classList.add('music-item-button')
    addGlyphicon(playButton, 'play')

    var addButton = document.createElement('span')
    addButton.classList.add('music-item-button')
    addGlyphicon(addButton, 'plus-sign')
    addButton.addEventListener('click', function (e) {
      currentSelectedSongID = song['id']
      var contentView = document.getElementById('content-view')
      contentView.appendChild(createPlaylistSelectionModalNode())
    })

    var removeButton = document.createElement('span')
    removeButton.classList.add('music-item-button')
    addGlyphicon(removeButton, 'remove')
    removeButton.addEventListener('click', function (e) {
      var songID = song['id']
      var playlistID = currentSelectedPlaylistID
      var playlist = MUSIC_DATA['playlists'].find(function (playlist) {
        return playlist['id'] === currentSelectedPlaylistID
      })
      var songIndex = playlist['songs'].indexOf(song['id'])
      if (songIndex > -1) {
        playlist['songs'].splice(songIndex, 1)
      }

      ajaxRemoveSongFromPlaylist(songID, playlistID).then(_ => {
        item.parentNode.removeChild(item)
      }, error => {
        console.log(error)
      })
    })

    item.appendChild(musicIcon)
    item.appendChild(createMusicTitleSubtitleNode(song['title'], song['artist']))
    item.appendChild(buttonGroup)

    buttonGroup.appendChild(playButton)
    buttonGroup.appendChild(addButton)
    if (Number.isInteger(currentSelectedPlaylistID)) {
      buttonGroup.appendChild(removeButton)
    }

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
    input.classList.add('text-input-bar')
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
        ajaxAddNewPlaylist(inputField.value).then(function (result) {
          MUSIC_DATA['playlists'].push({
            'id': result['id'],
            'name': result['name'],
            'songs': []
          })
          bar.removeChild(form)
          bar.appendChild(newPlaylistButton)
          redraw()
        }, function (err) {
          errorMessageArea.textContent = err.reason
          form.insertBefore(errorBar, bar1)
        })
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

    var buttonGroup = document.createElement('div')
    buttonGroup.classList.add('music-item-button-group')

    var expandButton = document.createElement('span')
    expandButton.classList.add('music-item-button')
    addGlyphicon(expandButton, 'chevron-right')

    item.appendChild(musicIcon)
    item.appendChild(createMusicTitleSubtitleNode(playlist['name']))
    item.appendChild(buttonGroup)

    buttonGroup.appendChild(expandButton)
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

  function ajaxFetchSongs () {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: '/api/songs',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
          resolve(data)
        },
        error: function (jqxhr, description, errorThrown) {
          if (jqxhr.responseJSON) {
            reject(jqxhr.responseJSON)
          } else {
            reject({
              'status': 'error',
              'blame': 'server'
            })
          }
        }
      })
    })
  }
  function getSongs (forceFetch) {
    if (forceFetch || MUSIC_DATA['songs'] === undefined) {
      return ajaxFetchSongs().then(function (songs) {
        MUSIC_DATA['songs'] = songs
        return songs
      })
    } else {
      return Promise.resolve(MUSIC_DATA['songs'])
    }
  }

  function ajaxFetchPlaylists () {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: '/api/playlists',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
          resolve(data)
        },
        error: function (jqxhr, description, errorThrown) {
          if (jqxhr.responseJSON) {
            reject(jqxhr.responseJSON)
          } else {
            reject({
              'status': 'error',
              'blame': 'server'
            })
          }
        }
      })
    })
  }

  function getPlaylists (forceFetch) {
    if (forceFetch || MUSIC_DATA['playlists'] === undefined) {
      return ajaxFetchPlaylists().then(function (playlists) {
        MUSIC_DATA['playlists'] = playlists
        return playlists
      })
    } else {
      return Promise.resolve(MUSIC_DATA['playlists'])
    }
  }

  function ajaxAddToPlaylist (songID, playlistID) {
    if ((typeof songID === 'number') && (typeof playlistID === 'number')) {
      return new Promise(function (resolve, reject) {
        $.ajax({
          url: '/api/playlists/' + playlistID,
          method: 'POST',
          data: {
            'song': songID
          },
          dataType: 'json',
          success: function (data) {
            resolve(data)
          },
          error: function (jqxhr, description, errorThrown) {
            if (jqxhr.responseJSON) {
              reject(jqxhr.responseJSON)
            } else {
              reject({
                'status': 'error',
                'blame': 'server'
              })
            }
          }
        })
      })
    } else {
      return Promise.reject({
        'status': 'error',
        'blame': 'client',
        'reason': 'missing required playlist or song ID'
      })
    }
  }

  function ajaxRemoveSongFromPlaylist (songID, playlistID) {
    if ((typeof songID === 'number') && (typeof playlistID === 'number')) {
      return new Promise(function (resolve, reject) {
        $.ajax({
          url: '/api/playlists/' + playlistID,
          method: 'DELETE',
          data: {
            'song': songID
          },
          dataType: 'json',
          success: function (data) {
            resolve(data)
          },
          error: function (jqxhr, description, errorThrown) {
            if (jqxhr.responseJSON) {
              reject(jqxhr.responseJSON)
            } else {
              reject({
                'status': 'error',
                'blame': 'server'
              })
            }
          }
        })
      })
    } else {
      return Promise.reject({
        'status': 'error',
        'blame': 'client',
        'reason': 'missing required playlist or song ID'
      })
    }
  }

  function ajaxAddNewPlaylist (playlistName) {
    if (typeof (playlistName) === 'string' && playlistName !== '') {
      return new Promise(function (resolve, reject) {
        $.ajax({
          url: '/api/playlists',
          method: 'POST',
          data: {
            'name': playlistName
          },
          dataType: 'json',
          success: function (data) {
            resolve(data)
          },
          error: function (jqxhr, description, errorThrown) {
            if (jqxhr.responseJSON) {
              reject(jqxhr.responseJSON)
            } else {
              reject({
                'status': 'error',
                'blame': 'server'
              })
            }
          }
        })
      })
    } else {
      return Promise.reject({
        'status': 'error',
        'blame': 'client',
        'reason': 'playlist name must be a non empty string'
      })
    }
  }
  function ajaxLogin (username, password) {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: '/login',
        method: 'POST',
        data: {
          'username': username,
          'password': password
        },
        dataType: 'json',
        success: function (data) {
          resolve(data)
        },
        error: function (jqxhr, description, errorThrown) {
          if (jqxhr.responseJSON) {
            reject(jqxhr.responseJSON)
          } else {
            reject({
              'status': 'error',
              'blame': 'server'
            })
          }
        }
      })
    })
  }

  function ajaxGetUsers () {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: '/api/users/',
        method: 'GET',
        success: function (data) {
          resolve(data)
        },
        error: function (jqxhr, description, errorThrown) {
          if (jqxhr.responseJSON) {
            reject(jqxhr.responseJSON)
          } else {
            reject({
              'status': 'error',
              'blame': 'server'
            })
          }
        }
      })
    })
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
    if (window.location.pathname === '/login') {
      activateLoginTab()
    } else if (window.location.pathname === '/playlists') {
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

function getCookie (name) {
  var cookie = '; ' + document.cookie
  var tmp = cookie.split('; ' + name + '=')
  if (tmp.length === 2) {
    return tmp[1].split(';')[0]
  }
}

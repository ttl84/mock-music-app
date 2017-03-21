node version: 6.94

Note:
The addSongToPlaylist api is a POST message, so duplicate songs can be added
to a playlist. This is a problem because the playlist schema is unordered. When
deleting a non unique song in a playlist, it will delete the first instance of
the song instead of the exact one that was selected.

example playlist:
====================
A
B
A <- click delete on this instance of A
====================

result:
====================
A <- this instance of A is deleted instead because it is the first A in the list
B
A
====================

Please keep this in mind if you are testing deletion of non unique songs.

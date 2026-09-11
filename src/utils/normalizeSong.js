export function normalizeSong(song) {
  return {
    id: song.id || song.identifier,
    title: song.title || song.song,
    artist: song.primaryArtists || song.artist || song.author || 'Unknown Artist',
    album: song.album || song.albumName || 'Unknown Album',
    cover: song.image || song.image_url || song.artworkUrl || '',
    audioUrl:
      song.media_url ||
      song.mediaUrl ||
      song.downloadUrl ||
      song.encryptedMediaUrl ||
      '',
    duration: Number(song.duration || 0),
    genre: song.language || 'Hindi',
    year: Number(song.year || 0),
    liked: false,
  }
}
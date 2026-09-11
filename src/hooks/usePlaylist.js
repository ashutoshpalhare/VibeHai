import { usePlaylistContext } from '../context/PlaylistContext'

export function usePlaylist() {
  return usePlaylistContext()
}
import { useLibraryContext } from '../context/LibraryContext'

export function useLibrary() {
  return useLibraryContext()
}
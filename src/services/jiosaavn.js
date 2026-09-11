const API_BASE =
  import.meta.env.VITE_JIOSAAVN_API ||
  'https://saavnapi-nine.vercel.app'

export async function searchSongs(query) {
  if (!query?.trim()) return []

  const response = await fetch(
    `${API_BASE}/result?query=${encodeURIComponent(query)}`
  )

  if (!response.ok) {
    throw new Error('JioSaavn API request failed')
  }

  return response.json()
}
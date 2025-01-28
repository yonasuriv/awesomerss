export async function fetchImage(query: string): Promise<string> {
  try {
    const response = await fetch(`https://www.googleapis.com/customsearch/v1?q=${query}&searchType=image&key=YOUR_API_KEY`);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].link;
    }
  } catch (error) {
    console.error('Failed to fetch image from Google:', error);
  }

  // Fallback to an alternative image source
  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&client_id=YOUR_UNSPLASH_API_KEY`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small;
    }
  } catch (error) {
    console.error('Failed to fetch image from Unsplash:', error);
  }

  // Default image if all else fails
  return 'default-image-url';
}

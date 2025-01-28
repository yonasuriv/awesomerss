const DAILY_DEV_API = 'https://app.daily.dev/api';

export async function getDailyDevUser(): Promise<null | any> {
  try {
    const response = await fetch(`${DAILY_DEV_API}/user`, {
      credentials: 'include',
    });
    
    // Return null for any non-200 response without logging an error
    if (!response.ok) return null;
    
    return response.json();
  } catch (error) {
    // Return null for any network errors without logging
    return null;
  }
}

export async function getDailyDevFeed(page = 0): Promise<any> {
  try {
    const response = await fetch(`${DAILY_DEV_API}/feed?page=${page}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      // If not logged in or any other error, fetch public feed
      const publicResponse = await fetch(`${DAILY_DEV_API}/posts/popular?page=${page}`);
      if (!publicResponse.ok) {
        throw new Error('Unable to fetch Daily.dev feed');
      }
      return publicResponse.json();
    }
    
    return response.json();
  } catch (error) {
    // Only log actual feed fetch errors
    console.error('Error fetching Daily.dev feed:', error);
    throw error;
  }
}

export function openDailyDevLogin() {
  window.open('https://app.daily.dev/onboarding', '_blank', 'width=600,height=800');
}
# Awesome RSS

Awesome RSS is a personal feed aggregator that fetches and displays RSS feeds from various sources.

## Features

- Fetches RSS feeds every 6 hours and saves them to XML files.
- Displays feed items with titles, descriptions, and images.
- Handles CORS issues and improves loading times.

## Usage

1. Clone the repository.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Build the project: `npm run build`
5. Start the scheduler: `npm run start:scheduler`

## Configuration

- Update the `src/utils/imageFetcher.ts` file with your Google and Unsplash API keys.
- Add your RSS feed URLs to the `src/scheduler.ts` file.

## License

This project is licensed under the MIT License.
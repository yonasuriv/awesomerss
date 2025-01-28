# Nitro RSS

My Personal RSS feed reader; Nitro RSS is a personal feed aggregator that fetches and displays top notch content from several hand-picked sources.

## Features

- ⚡ Fast and efficient feed loading with Lazy Load.
- 🌓 Dark/Light mode with persistent preference.
- 📱 Responsive design.
- 🎨 Beautiful UI with smooth transitions.
- 🏷️ Category-based filtering.

## TO-DO

- [x] Fetches RSS feeds every 6 hours and saves them to XML files.
- [x] Displays feed items with titles, descriptions, and images.
- [ ] 

## Usage

1. Clone the repository.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Build the project: `npm run build`
5. Start the scheduler: `npm run start:scheduler`

## Configuration

To add or modify RSS feeds, edit the `src/config/feeds.config.ts` file. Each feed should have the following structure:

```typescript
{
  name: "Feed Name",
  url: "https://feed-url.com/rss",
  category: "Category Name"
}
```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   
3. Fork this repository
4. Update the `base` property in `vite.config.ts` with your repository name
5. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Set the source to "GitHub Actions"
6. Push your changes to the main branch

The site will be automatically deployed to GitHub Pages.

## License

This project is licensed under the MIT License.
# Nitro RSS 

![Image](https://github.com/user-attachments/assets/336a680b-158d-458b-9c1a-7c7308be871e)

Personal RSS feed reader with dark mode support and category filtering. Build your own locally or go live.

> Current Status: Alpha

## Features

- 🌓 Dark/Light mode with persistent preference
- 📱 Responsive design
- 🏷️ Category-based filtering
- 🎨 Beautiful UI with smooth transitions
- ⚡ Fast and efficient feed loading

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

## Deployment

1. Fork this repository
2. Update the `base` property in `vite.config.ts` with your repository name
3. Enable GitHub Pages in your repository settings:
   - Go to Settings > Pages
   - Set the source to "GitHub Actions"
4. Push your changes to the main branch

The site will be automatically deployed to GitHub Pages.

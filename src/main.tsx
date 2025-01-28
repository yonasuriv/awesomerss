import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

async function fetchData(url: string) {
  try {
    const response = await fetch(url, {
      mode: 'no-cors'
    });
    // ...existing code...
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

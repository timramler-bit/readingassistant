
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("Tim the Teacher: Entry point reached. Mounting App...");

const mountApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Target container '#root' not found in HTML.");
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Tim the Teacher: UI mounted successfully!");
  } catch (err) {
    console.error("Tim the Teacher: Mounting failed:", err);
    throw err; // Re-throw to trigger window.onerror
  }
};

// Ensure DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}

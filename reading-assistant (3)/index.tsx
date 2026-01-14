
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("Tim the Teacher: Initializing application...");

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Tim the Teacher: Application mounted successfully.");
} catch (err) {
  console.error("Tim the Teacher: Render crash:", err);
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = "position:fixed;bottom:20px;left:20px;right:20px;background:#7f1d1d;color:white;padding:15px;border-radius:10px;font-family:monospace;z-index:10000;border:2px solid #ef4444;";
  errorDiv.innerHTML = `<b>Render Error:</b> ${err.message}`;
  document.body.appendChild(errorDiv);
}

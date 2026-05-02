import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/tkn/sw.js')
      .then(reg => console.log('SW Registered', reg))
      .catch(err => console.error('SW Registration failed', err));
  });
}

createRoot(document.getElementById("root")!).render(<App />);

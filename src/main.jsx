import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { performanceMonitor } from './utils/performance';

// Initialize performance monitoring
if (process.env.NODE_ENV === 'production') {
  performanceMonitor;
}

createRoot(document.getElementById("root")).render(<App />);

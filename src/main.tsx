import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "@fontsource/nunito-sans/400.css"; // peso 400 por defecto
import "@fontsource/nunito-sans/700.css"; // bold
import './styles/index.css';

// Error handler global
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
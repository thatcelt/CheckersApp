import { createRoot } from 'react-dom/client';
import App from './App.tsx';

declare global {
    interface Window {
        Telegram: any;
    }
};

if (window.Telegram?.WebApp) {
	const tg = window.Telegram.WebApp;
	tg.ready();
	tg.disableVerticalSwipes();
	tg.expand();
	tg.lockOrientation();

	const platform = tg.platform;
	console.log(platform)
	tg.requestFullscreen();
} else {
	console.error('Telegram WebApp API не найден.');
}

createRoot(document.getElementById('root')!).render(<App />);
import { FC, lazy, ReactNode, useEffect, useState } from 'react';
import '../styles/PreLoadingPage.css';

const PreLoadingPage: FC<{ children: ReactNode }> = ({ children }) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [progress, setProgress] = useState(0);
    const lazyComponents = [
        () => import('./PreLoadingPage.tsx'),
        () => import('./LevelSelectingPage.tsx'),
        () => import('./GamesPage.tsx'),
        () => import('./GameOnlinePage.tsx'),
        () => import('./GameWithBotPage.tsx'),
        () => import('./ProfilePage.tsx'),
        () => import('./RatingPage.tsx'),
        () => import('./FriendsPage.tsx')
    ];

    let isLoading = false;
    useEffect(() => {
        if (isLoading) return;
        isLoading = true;
        
        const totalComponents = lazyComponents.length;
        let loadedComponents = 0;

        const loadComponents = async () => {
            for (const lazyComponent of lazyComponents) {
                lazy(lazyComponent);
                await new Promise(resolve => setTimeout(resolve, (Math.floor(Math.random() * 1) + 0.5) * 1000));
                loadedComponents++;
                
                const progressPercentage = (loadedComponents / totalComponents) * 100;
                setProgress(progressPercentage);

                if (loadedComponents === totalComponents)
                    setShouldRender(true);
            }
        };

        loadComponents();

        return () => {
            setShouldRender(false);
        };
    }, []);

    return shouldRender ? children : <>
        <div className="loading-container">
            <span>HAPPY GAMES</span>
            <div className="loading-image">
                <img src="../src/resources/assets/Group.svg" />
                <div className="spinner"></div>
                <div className="loading-text">Loading</div>
                <div className="progress">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    </>;
};

export default PreLoadingPage;
import { FC, lazy, ReactNode, useEffect, useState } from 'react';
import '../styles/PreLoadingPage.css';
import { LAZY_COMPONENTS } from '../utils/constants';
import { useNavigate } from 'react-router-dom';

const PreLoadingPage: FC<{ children: ReactNode }> = ({ children }) => {
    const [shouldRender, setShouldRender] = useState(false);
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate()

    let isLoading = false;
    useEffect(() => {
        if (isLoading) return;
        isLoading = true;
        let loadedComponents = 0

        const loadComponents = async () => {
            for (const lazyComponent of LAZY_COMPONENTS) {
                lazy(lazyComponent);
                await new Promise(resolve => setTimeout(resolve, 500));
                loadedComponents++
                
                const progressPercentage = (loadedComponents / LAZY_COMPONENTS.length) * 100;
                setProgress(progressPercentage);

                if (loadedComponents === LAZY_COMPONENTS.length)
                    setShouldRender(true);
                navigate('/games')
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
                <img src="../../public/Group.svg"/>
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
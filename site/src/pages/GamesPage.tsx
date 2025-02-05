import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthorization } from '../hooks/useAuthorization';
import { getLocalizedString } from '../utils/utils';
import BottomPanel from '../components/BottomPanel';
import GamesPairButtons from '../components/GamesPairButtons';
import '../styles/GamesPage.css';

const GamesPage: FC = () => {
    const navigate = useNavigate();
    const authContext = useAuthorization();
    
    return (
        <>
            <div className="games-container">
                <div className="underbuttons-container">
                    <img src="../src/resources/assets/icon-48.svg" alt="HappyGames" />
                    <span>{getLocalizedString(authContext, 'checkersTitle')}</span>
                </div>
                <div className="general-button animated" onClick={() => navigate('/play')}>
                    {getLocalizedString(authContext, 'playOnline')}
                </div>
                <GamesPairButtons authContext={authContext} navigate={navigate}/>
                <BottomPanel activeVariant="games" />
            </div>
            <div className="games-shining" />
        </>
    )
}

export default GamesPage;
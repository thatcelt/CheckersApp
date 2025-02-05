import { FC, MouseEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthorization } from '../hooks/useAuthorization';
import { getLocalizedString } from '../utils/utils';
import { modalController } from '../context/ModalProvider';
import BottomPanelButton from './BottomPanelButton';
import '../styles/BottomPanel.css';
import { surrender } from '../utils/apiWrapper';
import { useGame } from '../hooks/useGame';

const BottomPanel: FC<{ activeVariant: string, socket?: WebSocket }> = ({ activeVariant, socket }) => {
    const navigate = useNavigate();
    const gameContext = useGame()
    const authContext = useAuthorization();
    const [navigatePath, setNavigatePath] = useState<string>('')

    useEffect(() => {
        const activeElement = document.getElementById(activeVariant);
        if (activeElement !== null) {
            activeElement.style.outline = '1px solid #FFB835';
            activeElement.style.color = 'black';
            if (activeVariant !== 'games')
                activeElement.style.borderRadius = '12px';
        }

        if(authContext.user?.language == 'ru' || authContext.user?.language == 'ua') {
            const element = document.querySelector(".panel-container") as HTMLDivElement;
            if (element != null)
                element.style.fontSize = '8px';
        } 
    }, [activeVariant]);

    const onClickNavigate = (event: MouseEvent<HTMLDivElement>) => {
        if (Number(localStorage.getItem('selectionChanged')) === 1) {
            window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }
        setNavigatePath(event.currentTarget.id);
    
        if (activeVariant === "games") {
            if ((socket?.readyState === WebSocket.OPEN) || (gameContext.gameSocket?.readyState === WebSocket.OPEN)) {
                modalController.createModal({
                    title: getLocalizedString(authContext, 'exitMenu'),
                    message: getLocalizedString(authContext, 'exitMenuDescription'),
                    button1: getLocalizedString(authContext, 'yes'),
                    button2: getLocalizedString(authContext, 'no'),
                    onButton1Submit: async () => {
                        await surrender(gameContext.gameId);
                        if (socket) socket.close();
                        else if (gameContext.gameSocket) {
                            gameContext.gameSocket.close();
                            gameContext.resetGame(gameContext);
                        };
                        navigate(`/${navigatePath}`);
                    }
                });
                return;
            } else {
                console.warn('WebSocket не активен');
            }
        }
    
        navigate(`/${event.currentTarget.id}`);
    };

    const clickGamesHandler = useCallback(() => {
        modalController.createModal({
            title: getLocalizedString(authContext, 'soonGames'),
            message: getLocalizedString(authContext, 'waitForIt')
        })
    }, []);

    return (
        <>
            <div className="panel-container">
                <BottomPanelButton name="friends" onClick={onClickNavigate} icon="friends_icon"/>
                <BottomPanelButton name="rating" onClick={onClickNavigate} icon="cup_icon"/>
                <div className="rectangle" id="games" onClick={(e) => onClickNavigate(e)}>
                    <div className="variant-play" id="games">
                        <img src="../src/resources/assets/play.png" />
                        {getLocalizedString(authContext, 'play')}
                    </div>
                </div>
                <BottomPanelButton name="games" onClick={clickGamesHandler} icon="button_soon_icon"/>
                <BottomPanelButton name="profile" onClick={onClickNavigate} icon="user_icon"/>
            </div>
        </>
    );
};

export default BottomPanel;

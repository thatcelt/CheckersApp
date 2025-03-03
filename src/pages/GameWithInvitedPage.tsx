import { FC, memo, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PlayerCard from '../components/PlayerCard';
import { useAuthorization } from '../hooks/useAuthorization';
import { useGame } from "../hooks/useGame";
import { enableTimer, getLocalizedString, updateActivePlayer } from "../utils/utils";
import ChipsContainer from "../components/ChipsContainer";
import ActionGameButton from "../components/ActionGameButton";
import Desk from "../components/Desk";
import BottomPanel from "../components/BottomPanel";
import { drawRequest, joinGame, surrender, token } from "../utils/apiWrapper";
import { modalController } from "../context/ModalProvider";
import '../styles/GameWithBotPage.css'
import { useSocket } from "../hooks/useSocket";
import { API_URL } from "../utils/constants";
import SocketProvider from '../context/SocketContext'
import { useLocation } from 'react-router-dom';
import GameProvider from '../context/GameContext'

const GameWithInvited: FC = () => {
    const location = useLocation();
    const { gameId, isCreator } = location.state || {};
    const authContext = useAuthorization();
    const gameContext = useGame();
    const socketContext = useSocket();
    const playersContainers: MutableRefObject<HTMLDivElement | null>[] = [
        useRef(null),
        useRef(null)
    ];

    const [timerEnableFlag, setTimerEnableFlag] = useState<boolean>(false);
    const timerIntervalRef = useRef<number | undefined>(undefined);
    
    let players = useMemo(() => {
        return [
            {
                userId: undefined,
                nickname: authContext.user?.username,
                avatar: authContext.user?.profilePicture,
                objectId: '1',
                type: 'player'

            },
            {
                userId: undefined,
                nickname: getLocalizedString(authContext, 'search'),
                avatar: '',
                objectId: 'searching',
                type: 'player2'
            }
        ];
    }, [authContext.user]);

    const createGame = useCallback(async () => {
        try {
            gameContext.resetGame(gameContext);

            if (isCreator) {
                socketContext.setWebSocketURI(`wss://${API_URL}/api/v1/game?gameId=${gameId}&token=${token}`);
                socketContext.setOnMessageHandler(gameContext.handleMessage);
                gameContext.setGameId(gameId);
                gameContext.setCurrentColor(1);
            } else {
                const joinResults = await joinGame(gameId);
                const deskContainer = document.getElementById('desk-view');
                if (deskContainer) deskContainer.style.rotate = '180deg';
                players = [
                    {
                        userId: joinResults.game.players[0].userId,
                        nickname: joinResults.game.players[0].username,
                        avatar: joinResults.game.players[0].profilePicture,
                        objectId: 'joinedData',
                        type: 'player'
        
                    },
                    {
                        userId: joinResults.game.players[1].userId,
                        nickname: joinResults.game.players[1].username,
                        avatar: joinResults.game.players[1].profilePicture,
                        objectId: 'joinedData2',
                        type: 'player2'
                    }
                ];
                gameContext.setPlayers(players);
                gameContext.setGameId(gameId);
                socketContext.setWebSocketURI(`wss://${API_URL}/api/v1/game?gameId=${gameId}&token=${token}`);
                socketContext.setOnMessageHandler(gameContext.handleMessage);
                gameContext.setCurrentColor(2);
            }
        } catch (error) {
            console.error('Ошибка при создании игры:', error);
        }
    }, []);
    
    useEffect(() => {
        createGame();
        gameContext.setPlayers(players);
    }, [createGame, players]);

    useEffect(() => {
        if(gameContext.gameId) {
            updateActivePlayer(gameContext.currentTurn, playersContainers);
        }
        return () => {
            setTimerEnableFlag(false);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = undefined;
            }
        }
    }, [gameContext.gameId]);

    useEffect(() => {
        updateActivePlayer(gameContext.currentTurn, playersContainers);

        if (!timerEnableFlag && gameContext.currentTurn == 2) 
            setTimerEnableFlag(true);
        
        if (!timerEnableFlag) return;
    
        if (timerIntervalRef.current)
            clearInterval(timerIntervalRef.current);
        
        if (+gameContext.currentTurn == 1)
            enableTimer(gameContext.firstCounter, timerIntervalRef, gameContext.setFirstCounter, gameContext);
        else
            enableTimer(gameContext.secondCounter, timerIntervalRef, gameContext.setSecondCounter, gameContext);

        return () => {
            if (timerIntervalRef.current) 
                clearInterval(timerIntervalRef.current);
        };
    }, [gameContext.currentTurn]);

    const onClickGiveUp = useCallback(() => {
        if (gameContext.playersRef.current.filter(x => x.userId).length <= 1) return;

        modalController.createModal({
            title: getLocalizedString(authContext, 'giveUp'),
            message: getLocalizedString(authContext, 'areYouSureGiveUp'),
            button1: getLocalizedString(authContext, 'confirm'),
            button2: getLocalizedString(authContext, 'cancel'),
            onButton1Submit: async () => {
                gameContext.gameSocket?.close();
                await surrender(gameContext.gameId);
            }
        })
    }, [authContext, gameContext.gameId]);

    const onClickDraw = useCallback(() => {
        if (gameContext.playersRef.current.filter(x => x.userId).length <= 1) return;
        
        modalController.createModal({
            title: getLocalizedString(authContext, 'suggestDraw'),
            message: getLocalizedString(authContext, 'areYouSureDraw'),
            button1: getLocalizedString(authContext, 'accept'),
            button2: getLocalizedString(authContext, 'reject'),
            onButton1Submit: () => drawRequest(gameContext.gameId)
        });
    }, [authContext, gameContext.gameId]);
    return (
        <>
            <div className="game-container">
                <div className="players-container">
                    {gameContext.players.map((player, index) => (
                        <PlayerCard refContainer={playersContainers[index]}
                            nickname={player.nickname}
                            avatar={player.avatar}
                            key={index}
                            objectId={player.objectId}
                            type={player.type}
                        />
                    ))}
                </div>
                <div className="received-chips">
                    <ChipsContainer earnedChips={gameContext.earnedWhiteChips} type='white' currentTurn={gameContext.currentTurn}/>
                    <ChipsContainer earnedChips={gameContext.earnedBlackChips} type='black' currentTurn={gameContext.currentTurn}/>
                </div>
                <Desk/>
                <div className="action-buttons-container">
                    <ActionGameButton title={getLocalizedString(authContext, 'giveUp')} icon='../../public/giveup.png' onClick={onClickGiveUp}/>
                    <ActionGameButton title={getLocalizedString(authContext, 'draw')} icon='../../public/draw.png' onClick={onClickDraw}/>
                </div>

                <BottomPanel activeVariant="games" socket={socketContext.ws.current!} gameId={gameContext.gameId}/>
                <div className="game-shining" />
            </div>
        </>
    )
}

const GameWithInvitedPage: FC = () => {
    return (
        <GameProvider>  
            <SocketProvider>
                <GameWithInvited />
            </SocketProvider>
        </GameProvider>
    )
};


export default memo(GameWithInvitedPage);
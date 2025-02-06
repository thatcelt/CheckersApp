import { FC, memo, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PlayerCard from '../components/PlayerCard';
import { useGame } from '../hooks/useGame';
import { useAuthorization } from '../hooks/useAuthorization';
import { API_URL, BOT_PLAYER_DATA } from '../utils/constants';
import '../styles/GameWithBotPage.css'
import ChipsContainer from '../components/ChipsContainer';
import Desk from '../components/Desk';
import BottomPanel from '../components/BottomPanel';
import { enableTimer, getLocalizedString, updateActivePlayer } from '../utils/utils';
import { modalController } from '../context/ModalProvider';
import { surrender, createGameWithBot, connectGameWithBotSocket, token } from '../utils/apiWrapper';
import ActionGameButton from '../components/ActionGameButton';
import { useParams } from 'react-router-dom';
import { DifficultyType } from '../utils/types';
import { useSocket } from '../hooks/useSocket';
import SocketProvider from '../context/SocketContext'

const GameWithBot: FC = () => {
    const authContext = useAuthorization();
    const gameContext = useGame();
    const socketContext = useSocket();

    const playersContainers: MutableRefObject<HTMLDivElement | null>[] = [
        useRef(null),
        useRef(null)
    ];

    const [timerEnableFlag, setTimerEnableFlag] = useState<boolean>(false);
    const timerIntervalRef = useRef<number | undefined>(undefined);
    const params = useParams();
    
    const players = useMemo(() => {
        return [
            {
                nickname: authContext.user?.username,
                avatar: authContext.user?.profilePicture,
                objectId: '1',
                type: 'player'

            },
            BOT_PLAYER_DATA
        ];
    }, [authContext.user]);

    const createGame = useCallback(async () => {
        const result = await createGameWithBot(params.difficulty as unknown as DifficultyType);
        gameContext.setGameId(result.gameId)
    }, [params.difficulty]);

    useEffect(() => {
        createGame(); 
        gameContext.setPlayers(players);
    }, [createGame, players]);

    useEffect(() => {
        if (gameContext.gameId) {
            socketContext.setOnMessageHandler(gameContext.handleMessage);
            socketContext.setWebSocketURI(`wss://${API_URL}/api/v1/game/vsBot?gameId=${gameContext.gameId}&token=${token}`);
            updateActivePlayer(gameContext.currentTurn, playersContainers);
        }

        return () => {
            setTimerEnableFlag(false);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = undefined;
            }
        }
    }, [gameContext.gameId, connectGameWithBotSocket]);

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
        modalController.createModal({
            title: getLocalizedString(authContext, 'giveUp'),
            message: getLocalizedString(authContext, 'areYouSureGiveUp'),
            button1: getLocalizedString(authContext, 'confirm'),
            button2: getLocalizedString(authContext, 'cancel'),
            onButton1Submit: async () => {
                gameContext.gameSocket?.close()
                gameContext.resetGame(gameContext)
                await surrender(gameContext.gameId)
            }
        })
    }, [authContext, gameContext.gameId])
    
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
                    <ActionGameButton title={getLocalizedString(authContext, 'giveUp')} icon='../src/resources/assets/giveup.png' onClick={onClickGiveUp}/>
                </div>

                <BottomPanel activeVariant="games" socket={socketContext.ws.current!}/>
                <div className="game-shining" />
            </div>
        </>
    )
}

const GameWithBotPage: FC = () => {
    return (
        <SocketProvider>
            <GameWithBot />
        </SocketProvider>
    )
};

export default memo(GameWithBotPage);
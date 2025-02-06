import { FC, memo, MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "../hooks/useGame";
import { enableTimer, updateActivePlayer } from "../utils/utils";
import ChipsContainer from "../components/ChipsContainer";
import Desk from "../components/Desk";
import BottomPanel from "../components/BottomPanel";
import { createGameOnOneDevice, token } from "../utils/apiWrapper";
import '../styles/GameWithBotPage.css'
import { useSocket } from "../hooks/useSocket";
import { API_URL } from "../utils/constants";
import SocketProvider from '../context/SocketContext'

const GameOnOneDevice: FC = () => {
    const gameContext = useGame();
    const socketContext = useSocket();
    const playersContainers: MutableRefObject<HTMLDivElement | null>[] = [
        useRef(null),
        useRef(null)
    ];

    const [timerEnableFlag, setTimerEnableFlag] = useState<boolean>(false);
    const timerIntervalRef = useRef<number | undefined>(undefined);

    const createGame = useCallback(async () => {
        gameContext.resetGame(gameContext)
        const gameResults = await createGameOnOneDevice()
        gameContext.setGameId(gameResults!.gameId);
        socketContext.setWebSocketURI(`wss://${API_URL}/api/v1/game/oneDevice?gameId=${gameResults!.gameId}&token=${token}`);
        socketContext.setOnMessageHandler(gameContext.handleMessage);
        gameContext.setCurrentColor(1);
    }, []);
    
    useEffect(() => {
        createGame();
    }, [createGame]);

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
        gameContext.setCurrentColor(gameContext.currentColor == 1 ? 2 : 1)
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

    return (
        <>
            <div className="game-container">
                <div
                    className="friends-time-block" style={{'marginBottom': '20px', transform: "rotate(180deg)"}}>
                    <div className="friends-time-container" id="friends-time-container-2" ref={playersContainers[1]}>
                        {`${Math.floor(gameContext.secondCounter / 60)}:${String(gameContext.secondCounter % 60).padStart(2, '0')}`}
                    </div>
                </div>
                <div className="received-chips">
                    <ChipsContainer earnedChips={gameContext.earnedWhiteChips} type='white' currentTurn={gameContext.currentTurn}/>
                    <ChipsContainer earnedChips={gameContext.earnedBlackChips} type='black' currentTurn={gameContext.currentTurn}/>
                </div>
                <Desk/>
                <div className="received-chips" style={{marginTop: '20px'}}>
                    <ChipsContainer earnedChips={gameContext.earnedWhiteChips} type='white' currentTurn={gameContext.currentTurn}/>
                    <ChipsContainer earnedChips={gameContext.earnedBlackChips} type='black' currentTurn={gameContext.currentTurn}/>
                </div>
                <div className="friends-time-block" style={{'marginTop': '20px'}}>
                    <div className="friends-time-container" id="friends-time-container-1">
                        {`${Math.floor(gameContext.firstCounter / 60)}:${String(gameContext.firstCounter % 60).padStart(2, '0')}`}
                    </div>
                </div>
                <BottomPanel activeVariant="games" socket={socketContext.ws.current!}/>
                <div className="game-shining" />
            </div>
        </>
    )
}


const GameOnOneDevicePage: FC = () => {
    return (
        <SocketProvider>
            <GameOnOneDevice />
        </SocketProvider>
    )
};


export default memo(GameOnOneDevicePage);
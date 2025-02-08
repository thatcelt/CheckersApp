import { createContext, FC, memo, ReactNode, useMemo, useState, useRef, useEffect } from 'react';
import { GameContextType, NextMoveStructure, PlayerData } from './types';
import { EMPTY_BOARD } from '../utils/constants';
import { animateMove, getLocalizedString, updateBoardDisplay } from '../utils/utils';
import { useAuthorization } from '../hooks/useAuthorization';
import { modalController } from './ModalProvider';
import { LanguageTranslations } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import { invitePlayer } from '../utils/apiWrapper';

export const GameContext = createContext<GameContextType | undefined>(undefined)

const GameProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [board, setBoard] = useState<number[][]>(EMPTY_BOARD);
    const [gameId, setGameId] = useState<string>('');
    const [firstCounter, setFirstCounter] = useState<number>(600);
    const [secondCounter, setSecondCounter] = useState<number>(600);
    const [possibleMultipleMoves, setPossibleMultipleMoves] = useState<number[][]>([]);
    const [chipsColor, setChipsColor] = useState<number>(1);
    const [currentTurn, setCurrentTurn] = useState<number>(1);
    const [gameSocket, setGameSocket] = useState<WebSocket | null>(null);
    const [counterInterval, ,] = useState<number>(0);
    const [isJumping, _setJumping] = useState<boolean>(false);
    const [players, setPlayers] = useState<PlayerData[]>([]);
    const [earnedWhiteChips, setEarnedWhiteChips] = useState<number>(0);
    const [earnedBlackChips, setEarnedBlackChips] = useState<number>(0);
    const [moves, setMoves] = useState<number[][][]>([]);
    const [activePiece, setActivePiece] = useState<number[] | null>(null);
    const [currentColor, setCurrentColor] = useState<number>(1);
    const playersRef = useRef<PlayerData[]>(players);
    useEffect(() => {
        playersRef.current = players;
    }, [players]);

    const navigate = useNavigate();
    const queue: (() => Promise<void>)[] = [];
    let isProcessing: Boolean = false;
    const processQueue = async () => {
        if (isProcessing) return;
        isProcessing = true;

        while (queue.length > 0) {
            const task = queue.shift();
            if (task) await task();
        }

        isProcessing = false;
    };

    const authContext = useAuthorization();

    const resetGame = (gameContext: GameContextType) => {
        gameContext.setBoard(EMPTY_BOARD);
        gameContext.setGameId('');
        gameContext.setFirstCounter(600);
        gameContext.setSecondCounter(600);
        gameContext.setPossibleMultipleMoves([]);
        gameContext.setChipsColor(1);
        gameContext.setCurrentTurn(1);
        gameContext.setGameSocket(null);
        if (gameContext.gameSocket?.readyState === WebSocket.OPEN) {
            gameContext.gameSocket.close();
        }
        gameContext.setActivePiece(null);
        gameContext.setPlayers([]);
        gameContext.setEarnedWhiteChips(0);
        gameContext.setEarnedBlackChips(0);
        gameContext.setMoves([]);
        queue.length = 0;
    };
   
    function handleMessage(socket: WebSocket, gameContext: GameContextType, message: any) {
        if (message.winner) {
            modalController.createModal({
                title: `${getLocalizedString(authContext, 'resultsTitle')}: ${getLocalizedString(authContext, message.winner as keyof LanguageTranslations)}`,
                message: getLocalizedString(authContext, message.reason as keyof LanguageTranslations),
                button1: getLocalizedString(authContext, 'rematch'),
                button2: getLocalizedString(authContext, 'ok'),
                onButton1Submit: async () => {
                    const target = playersRef.current.find(x => x.userId !== authContext.user?.userId);
                    if (!target) {
                        const path = window.location.pathname;
                        navigate('/games', { replace: true }); 
                        setTimeout(() => navigate(path, { replace: true }), 0); 
                        return;
                    }
                    
                    socket?.close();
                    resetGame(gameContext);
                    modalController.closeModal();

                    navigate('/games');
                    await new Promise(r => setTimeout(() => r(true), 1000));
                
                    const result = await invitePlayer(target.userId!);
                    switch (result.message) {
                        case 'FRIEND_ALREADY_IN_GAME':
                        case 'YOU_ARE_ALREADY_IN_GAME':
                            modalController.createModal({
                                title: getLocalizedString(authContext, 'inviteFailed'),
                                message: getLocalizedString(authContext, 'inviteFailedDescription')
                            });
                            break;

                        case 'FRIEND_IS_OFFLINE':
                            modalController.createModal({
                                title: getLocalizedString(authContext, 'inviteFailed'),
                                message: getLocalizedString(authContext, 'inviteFailedOffline')
                            });
                            break;

                        case 'INVITE_REQUESTED':
                            navigate('/play-with-invited', { state: { gameId: result.game, isCreator: true } });
                            break;
                    }
                },
                onButton2Submit: async () => {
                    socket?.close();
                    resetGame(gameContext);
                    navigate('/games');
                }
            });

            socket?.close();
            return;
        }

        switch (message.t) {
            case 'DRAW_REQUESTED':
                modalController.createModal({
                    title: getLocalizedString(authContext, 'suggestDraw'),
                    message: getLocalizedString(authContext, 'areYouSureDraw'),
                    button1: getLocalizedString(authContext, 'accept'),
                    button2: getLocalizedString(authContext, 'reject'),
                    onButton1Submit: () => socket?.send(JSON.stringify({ action: 'ACCEPT_DRAW' }))
                });
                break;

            case 'NEXT_MOVE':
                if (message.players) {
                    setPlayers(
                        [{
                            userId: message.players[0].userId,
                            nickname: message.players[0].username,
                            avatar: message.players[0].profilePicture,
                            objectId: 'joinedData',
                            type: 'player'
            
                        },
                        {
                            userId: message.players[1].userId,
                            nickname: message.players[1].username,
                            avatar: message.players[1].profilePicture,
                            objectId: 'joinedData2',
                            type: 'player2'
                        }]
                    );
                }
                
                queue.push(async () => {
                    const nextMoveAnswer: NextMoveStructure = message
                    setMoves(nextMoveAnswer.possibleMoves);
                    gameContext.setCurrentTurn(nextMoveAnswer.currentTurn);
                    gameContext.setBoard(nextMoveAnswer.board);
                    const flatBoard = nextMoveAnswer.board.flat();
                    gameContext.setEarnedBlackChips(12 - flatBoard.filter((element) => element === 2 || element === 4).length);
                    gameContext.setEarnedWhiteChips(12 - flatBoard.filter((element) => element === 1 || element === 3).length);

                    updateBoardDisplay(authContext, nextMoveAnswer.board);
                });

                break;
            
            case 'CURRENT_MOVE':
                queue.push(async () => {
                    const currentMoveAnswer: { move: number[][] } = message;
                    await animateMove(authContext, gameContext, currentMoveAnswer.move[0], currentMoveAnswer.move[1]);
                });
                
                break;
        }

        processQueue();
    }

    const gameContextValues = useMemo(() => ({ playersRef, handleMessage, resetGame, currentColor, setCurrentColor, activePiece, setActivePiece, moves, setMoves, earnedBlackChips, earnedWhiteChips, board, gameId, firstCounter, secondCounter, possibleMultipleMoves, setPossibleMultipleMoves, chipsColor, currentTurn, gameSocket, counterInterval, isJumping, players, setPlayers, setCurrentTurn, setFirstCounter, setSecondCounter, setGameId, setChipsColor, setGameSocket, setBoard, setEarnedBlackChips, setEarnedWhiteChips }), [earnedBlackChips, earnedWhiteChips, board, gameId, firstCounter, secondCounter, possibleMultipleMoves, chipsColor, currentTurn, gameSocket, counterInterval, isJumping, players, setPlayers, setCurrentTurn, setFirstCounter, setSecondCounter, setGameId, setChipsColor, setGameSocket, setBoard, setEarnedBlackChips, setEarnedWhiteChips, moves, activePiece, setActivePiece, currentColor, resetGame, setCurrentColor])

    return (
        <GameContext.Provider value={gameContextValues}>
            {children}
        </GameContext.Provider>
    )
}

export default memo(GameProvider);
import { createContext, FC, memo, ReactNode, useMemo, useState } from 'react';
import { GameContextType, NextMoveStructure, PlayerData } from './types';
import { EMPTY_BOARD } from '../utils/constants';
import { animateMove, getLocalizedString, updateBoardDisplay } from '../utils/utils';
import { useAuthorization } from '../hooks/useAuthorization';
import { modalController } from './ModalProvider';
import { LanguageTranslations } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import { createGame, invitePlayer } from '../utils/apiWrapper';

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
    const [currentColor, setCurrentColor] = useState<number>(1)
    const navigate = useNavigate()
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
        if (gameContext.gameSocket?.readyState === WebSocket.OPEN)
            gameContext.gameSocket.close();
        gameContext.setActivePiece(null);
        gameContext.setPlayers([]);
        gameContext.setEarnedWhiteChips(0);
        gameContext.setEarnedBlackChips(0);
        gameContext.setMoves([]);
        queue.length = 0;
    };
   
    function handleMessage(gameContext: GameContextType, message: any) {
        if (message.winner) {
            modalController.createModal({
                title: `${getLocalizedString(authContext, 'resultsTitle')}: ${getLocalizedString(authContext, message.winner as keyof LanguageTranslations)}`,
                message: getLocalizedString(authContext, message.reason as keyof LanguageTranslations),
                button1: getLocalizedString(authContext, 'rematch'),
                button2: getLocalizedString(authContext, 'ok'),
                onButton1Submit: async () => {
                    const target = gameContext.players.filter(x => x.userId !== authContext.user?.userId);
                    if (!target?.length) return;

                    gameSocket?.close();
                    resetGame(gameContext);
                    modalController.closeModal();

                    navigate('/games');
                    await new Promise(r => setTimeout(() => r(true), 1000));
                
                    const game = await createGame('private');
                    if (!game || game.message !== 'GAME_CREATED')
                        return;
                    
                    console.log(gameContext.players, '=', target)
                    await invitePlayer(target[0].userId!, game.gameId);
                    navigate('/play-with-invited', { state: { gameId: game.gameId, isCreator: true } });
                },
                onButton2Submit: async () => {
                    gameSocket?.close();
                    resetGame(gameContext);
                    navigate('/games');
                }
            });

            gameContext.gameSocket?.close();
            return;
        }

        switch (message.t) {
            case 'NEXT_MOVE':
                if (message.players) {
                    gameContext.setPlayers(
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

    const gameContextValues = useMemo(() => ({ handleMessage, resetGame, currentColor, setCurrentColor, activePiece, setActivePiece, moves, setMoves, earnedBlackChips, earnedWhiteChips, board, gameId, firstCounter, secondCounter, possibleMultipleMoves, setPossibleMultipleMoves, chipsColor, currentTurn, gameSocket, counterInterval, isJumping, players, setPlayers, setCurrentTurn, setFirstCounter, setSecondCounter, setGameId, setChipsColor, setGameSocket, setBoard, setEarnedBlackChips, setEarnedWhiteChips }), [earnedBlackChips, earnedWhiteChips, board, gameId, firstCounter, secondCounter, possibleMultipleMoves, chipsColor, currentTurn, gameSocket, counterInterval, isJumping, players, setPlayers, setCurrentTurn, setFirstCounter, setSecondCounter, setGameId, setChipsColor, setGameSocket, setBoard, setEarnedBlackChips, setEarnedWhiteChips, moves, activePiece, setActivePiece, currentColor, resetGame, setCurrentColor])

    return (
        <GameContext.Provider value={gameContextValues}>
            {children}
        </GameContext.Provider>
    )
}

export default memo(GameProvider);
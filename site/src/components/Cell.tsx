import { FC, memo, MouseEvent, useCallback } from 'react';
import { CellProps } from '../props/cellProps';
import '../styles/Cell.css';
import { useGame } from '../hooks/useGame';
import { useAuthorization } from '../hooks/useAuthorization';
import { animateMove, clearPossibleMoves, updateBoardDisplay } from '../utils/utils';
import { getCaptures } from '../utils/getCaptures';
import { useSocket } from '../hooks/useSocket';
import { BOARD_SIZE, Piece } from '../utils/types';
import { CHIPS_ANIMATION_OPTIONS, CHIPS_KEYFRAMES } from '../utils/constants';

const Cell: FC<CellProps> = ({ cellId, cellColor, children }) => {
    const gameContext = useGame();
    const authContext = useAuthorization();
    const socketContext = useSocket();

    const updateGameState = async (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
        await animateMove(authContext, gameContext, [fromRow, fromCol], [toRow, toCol]);
    
        socketContext.send({ action: 'MOVE', move: [[fromRow, fromCol], [toRow, toCol]] });
    };
    
    const clearAndDisplayBoard = () => {
        clearPossibleMoves(gameContext);
        updateBoardDisplay(authContext, gameContext.board);
    };

    const executeMultipleMoves = async (captures: number[][], fromRow: number, fromCol: number) => {
        for (const capture of captures) {
            clearAndDisplayBoard();
            await updateGameState(fromRow, fromCol, capture[0], capture[1]);
            fromRow = capture[0];
            fromCol = capture[1];

            if (gameContext.board[fromRow][fromCol] == Piece.WHITE_PIECE && fromRow == 0) {
                console.log('замена на дамку белую')
                gameContext.board[fromRow][fromCol] = Piece.WHITE_KING;
                gameContext.setBoard([...gameContext.board]);
                await new Promise(resolve => setTimeout(resolve, 500));
            } else if (gameContext.board[fromRow][fromCol] == Piece.BLACK_PIECE && fromCol == BOARD_SIZE - 1) {
                console.log('замена на дамку черную')
                gameContext.board[fromRow][fromCol] = Piece.BLACK_KING;
                gameContext.setBoard([...gameContext.board]);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            await new Promise(resolve => setTimeout(resolve, 600));
        }
    };

    const isCellValidForCurrentPlayer = (
        clickedPiece: number,
        currentTurn: number
    ): boolean => {
        return (
            (currentTurn === 1 && [1, 3].includes(clickedPiece) && gameContext.currentColor == 1) ||
            (currentTurn === 2 && [2, 4].includes(clickedPiece) && gameContext.currentColor == 2)
        );
    };

    const animateMovableChips = (row: number, column: number) => {
        const cellElement = document.getElementsByClassName(`chip-image-${row}-${column}`)
        if (cellElement.length > 0) {
            cellElement[0].animate(CHIPS_KEYFRAMES, CHIPS_ANIMATION_OPTIONS);
        }
    }

    const onClickToChip = useCallback((event: MouseEvent<HTMLDivElement>) => {
        const boardLength = gameContext.board.length;
        const clickedCellIndex = Number(event.currentTarget.id.slice(5));
        const flattenedBoard = gameContext.board.flat();
        const clickedPiece = flattenedBoard[clickedCellIndex];
        const row = Math.floor(clickedCellIndex / boardLength);
        const column = clickedCellIndex % boardLength;

        if (gameContext.players[1].objectId == 'searching') return
    
        if (
            gameContext.currentColor === 1 && ![0, 1, 3, 9].includes(clickedPiece) ||
            gameContext.currentColor === 2 && ![0, 2, 4, 9].includes(clickedPiece)
        ) {
            clearAndDisplayBoard();
            return;
        }
    
        if (clickedPiece === 9) {
            const move = gameContext.possibleMultipleMoves.length > 1
                ? gameContext.possibleMultipleMoves.find(move => move[0] === row && move[1] === column)
                : gameContext.moves.find(move =>
                    move[1][0] === row &&
                    move[1][1] === column &&
                    move[0][0] === gameContext.activePiece!![0] &&
                    move[0][1] === gameContext.activePiece!![1]
                );

            if (move) {
                gameContext.setMoves([]);
                gameContext.setPossibleMultipleMoves([]);
    
                let [fromRow, fromCol] = gameContext.activePiece!!;
                const captures = getCaptures(gameContext.board, [fromRow, fromCol]);
                if (captures.length > 1) {
                    executeMultipleMoves(captures, fromRow, fromCol);
                } else {
                    clearAndDisplayBoard();
                    updateGameState(fromRow, fromCol, row, column);
                }
    
                gameContext.setActivePiece([]);
            }
        } 
        else if (isCellValidForCurrentPlayer(clickedPiece, gameContext.currentTurn)) {
            clearAndDisplayBoard();
            gameContext.setActivePiece([row, column]);
            gameContext.setPossibleMultipleMoves([]);
    
            const captures = getCaptures(gameContext.board, [row, column]);
            if (captures.length > 1) {
                gameContext.board[captures[captures.length - 1][0]][captures[captures.length - 1][1]] = 9;
                gameContext.setBoard(gameContext.board);

                updateBoardDisplay(authContext, gameContext.board);
                gameContext.setPossibleMultipleMoves(captures);
                return;
            }
            const moves = gameContext.moves.filter(move =>
                JSON.stringify(move[0]) === JSON.stringify([row, column])
            );
    
            if (moves.length > 0) {
                moves.forEach(move => {
                    gameContext.board[move[1][0]][move[1][1]] = 9;
                });
                gameContext.setBoard(gameContext.board);
                updateBoardDisplay(authContext, gameContext.board);
            } else {
                gameContext.moves.forEach((move: number[][]) => {
                    animateMovableChips(move[0][0], move[0][1]);
                });
            }
        }
    }, [gameContext, authContext]);

    return (
        <div onClick={(e) => onClickToChip(e)}
            id={`cell-${cellId}`}
            className="cell"
            style={{ background: cellColor }}
        >
            {children}
        </div>
    )
}

export default memo(Cell);
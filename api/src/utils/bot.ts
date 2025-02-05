import { BOARD_SIZE, Position, Piece, DifficultyTypes } from '../constants';
import { Game } from './game';

class Bot {
    private difficulty: DifficultyTypes;
    private board: Map<string, number>;

    constructor(difficulty: DifficultyTypes) {
        this.difficulty = difficulty;
        this.board = new Map<string, number>();
    }

    getMove(game: Game): Position[] | null {
        let moves: Position[] | null = null;
        switch (this.difficulty) {
            case DifficultyTypes.EASY:
                moves = this.getRandomMove(game);
                break;
            case DifficultyTypes.MEDIUM:
                moves = this.getMinimaxMove(game, 1);
                break;
            case DifficultyTypes.HARD:
                moves = this.getMinimaxMove(game, 2, true);
                break;
        }

        return moves;
    }

    getRandomMove(game: Game): Position[] | null {
        const validMoves = game.getAllValidMoves(2);
        return validMoves.length > 0 ? validMoves[Math.floor(Math.random() * validMoves.length)] : null;
    }

    getMinimaxMove(game: Game, depth: number, alphaBeta: boolean = false): Position[] | null {
        let bestMove: [number, number][] | null = null;
        let bestScore = -Infinity;
        let alpha = -Infinity;
        let beta = Infinity;

        for (const move of game.getAllValidMoves(2)) {
            const gameCopy = this.getGameCopy(game);
            gameCopy.movePiece(move[0], move[1]);
            const score = alphaBeta
                ? this.minimax(gameCopy, depth - 1, false, alpha, beta)
                : this.minimax(gameCopy, depth - 1, false);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            if (alphaBeta) {
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
        }
        return bestMove;
    }

    minimax(game: Game, depth: number, isMaximizing: boolean, alpha: number = -Infinity, beta: number = Infinity): number {
        const boardState = JSON.stringify(game.board);
        if (this.board.has(boardState))
            return this.board.get(boardState)!;

        const winner = game.checkForWinner();
        if (depth === 0 || winner) {
            const score = this.evaluateBoard(game);
            this.board.set(boardState, score);
            return score;
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of game.getAllValidMoves(2)) {
                const gameCopy = this.getGameCopy(game);
                gameCopy.movePiece(move[0], move[1]);
                const evalScore = this.minimax(gameCopy, depth - 1, false, alpha, beta);
                maxEval = Math.max(maxEval, evalScore);
                alpha = Math.max(alpha, evalScore);
                if (beta <= alpha) break;
            }
            this.board.set(boardState, maxEval);
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of game.getAllValidMoves(2)) {
                const gameCopy = this.getGameCopy(game);
                gameCopy.movePiece(move[0], move[1]);
                const evalScore = this.minimax(gameCopy, depth - 1, true, alpha, beta);
                minEval = Math.min(minEval, evalScore);
                beta = Math.min(beta, evalScore);
                if (beta <= alpha) break;
            }
            this.board.set(boardState, minEval);
            return minEval;
        }
    }

    private evaluateBoard(game: Game): number {
        let score = 0;
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const piece = game.board[row][col];
                if (piece == Piece.BLACK_PIECE) {
                    score += 1 + row;
                    if (this.isPieceInDanger(game, row, col)) score -= 5;
                } else if (piece == Piece.BLACK_KING) {
                    score += 3;
                } else if (piece == Piece.WHITE_PIECE) {
                    score -= 1 - (BOARD_SIZE - row - 1);
                    if (this.isPieceInDanger(game, row, col)) score += 5;
                } else if (piece == Piece.WHITE_KING) {
                    score -= 3;
                }
            }
        }
        return score;
    }

    getGameCopy(game: Game): Game {
        const obj = new Game();
        obj.board = structuredClone(game.board);
        obj.currentTurn = game.currentTurn;
        obj.mustCapture = game.mustCapture;
        obj.capturingPiece = game.capturingPiece || null;
        return obj;
    }

    isPieceInDanger(game: Game, row: number, col: number): boolean {
        const piece = game.board[row][col];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        const enemyPiece = [Piece.BLACK_KING, Piece.BLACK_PIECE].includes(piece) ? Piece.WHITE_PIECE : Piece.BLACK_PIECE;
        const enemyKing = [Piece.BLACK_KING, Piece.BLACK_PIECE].includes(piece) ? Piece.WHITE_KING : Piece.BLACK_KING;

        for (const [dr, dc] of directions)
            if (row + dr >= 0 && row + dr < BOARD_SIZE && col + dc >= 0 && col + dc < BOARD_SIZE)
                if ([enemyPiece, enemyKing].includes(game.board[row + dr][col + dc]))
                    if (row - dr >= 0 && row - dr < BOARD_SIZE && col - dc >= 0 && col - dc < BOARD_SIZE)  
                        if (game.board[row - dr][col - dc] == Piece.EMPTY)
                            return true;
        return false;
    }
}

export {
    Bot
}
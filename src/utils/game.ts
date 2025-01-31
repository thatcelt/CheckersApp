import { Turn } from "../constants";
import { Piece } from "./getCaptures";

type Position = [number, number];
type Move = [Position, Position];
const BOARD_SIZE = 8;

class Game {
    board: Piece[][];
    currentTurn: Turn;
    mustCapture: boolean;
    capturingPiece: Position | null;

    constructor(board: Piece[][] | null = null) {
        this.board = board || Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(Piece.EMPTY));
        this.currentTurn = Turn.White;
        this.mustCapture = false;
        this.capturingPiece = null;
    }

    movePiece(from: Position, to: Position) {
        const piece = this.board[from[0]][from[1]];

        this.board[to[0]][to[1]] = piece;
        this.board[from[0]][from[1]] = Piece.EMPTY;
        
        if (Math.abs(from[0] - to[0]) === 2 && ![Piece.WHITE_KING, Piece.BLACK_KING].includes(piece as Piece)) {
            const row = (from[0] + to[0]) / 2;
            const column = (from[1] + to[1]) / 2;
            this.board[row][column] = Piece.EMPTY;
        } else if (Math.abs(from[0] - to[0]) >= 2 && [Piece.WHITE_KING, Piece.BLACK_KING].includes(piece as Piece)) {
            const directionRow = (to[0] - from[0]) / Math.abs(to[0] - from[0]);
            const directionColumn = (to[1] - from[1]) / Math.abs(to[1] - from[1]);
            let row = from[0] + directionRow;
            let column = from[1] + directionColumn;
            let isCaptured = false;
      
            while (row !== to[0] && column !== to[1]) {
                if (this.board[row][column] !== Piece.EMPTY) {
                    this.board[row][column] = Piece.EMPTY;
                    isCaptured = true;
                    break;
                }

                row += directionRow;
                column += directionColumn;
            }
      
            if (!isCaptured) {
                this.capturingPiece = null;
                this.currentTurn = this.currentTurn == Turn.White ? Turn.Black : Turn.White;
                return;
            }
        }
      
        if (piece == Piece.WHITE_PIECE && to[0] == 0)
            this.board[to[0]][to[1]] = Piece.WHITE_KING;
        else if (piece == Piece.BLACK_PIECE && to[0] == BOARD_SIZE - 1)
            this.board[to[0]][to[1]] = Piece.BLACK_KING;

        if (Math.abs(from[0] - to[0]) >= 2) {
            const furtherCaptures = this.getValidMoves(to[0], to[1], true);
            if (furtherCaptures.length > 0) {
                this.capturingPiece = [to[0], to[1]];
                this.mustCapture = true;
                return;
            }
        }

        this.currentTurn = this.currentTurn == Turn.White ? Turn.Black : Turn.White;
        this.capturingPiece = null;
        this.mustCapture = false;
    }

    getValidMoves(row: number, column: number, capturingOnly = false): Position[] {
        const piece = this.board[row][column];
        if (piece == Piece.WHITE_PIECE || piece == Piece.BLACK_PIECE)
            return this.getValidMovesForPiece(row, column, piece, capturingOnly);
        else if (piece == Piece.WHITE_KING || piece == Piece.BLACK_KING)
            return this.getValidMovesForKing(row, column, piece, capturingOnly);
        return [];
    }
    
    getValidMovesForPiece(row: number, column: number, piece: Piece, capturingOnly: boolean): Position[] {
        const directions = piece == Piece.WHITE_PIECE ? [ [ -1, -1 ], [ -1, 1 ] ] : [ [ 1, -1 ], [ 1, 1 ] ];
        const validMoves: Position[] = [];
        const captures: Position[] = [];
    
        for (const [directionRow, directionColumn] of directions) {
            const r = row + directionRow;
            const c = column + directionColumn;
    
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && this.board[r][c] === Piece.EMPTY && !capturingOnly)
                validMoves.push([r, c]);

            const captureRow = r + directionRow;
            const captureColumn = c + directionColumn;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && captureRow >= 0 && captureRow < BOARD_SIZE && captureColumn >= 0 && captureColumn < BOARD_SIZE && this.board[r][c] != Piece.EMPTY && this.board[r][c] % 2 != piece % 2 && this.board[captureRow][captureColumn] == Piece.EMPTY)
                captures.push([captureRow, captureColumn]);
        }
    
        return captures.length > 0 ? captures : validMoves;
    }
    
    getValidMovesForKing(row: number, column: number, piece: Piece, capturingOnly: boolean): Position[] {
        const directions = [ [ -1, -1 ], [ -1, 1 ], [ 1, -1 ], [ 1, 1 ] ];
        const validMoves: Position[] = [];
        const captures: Position[] = [];
        
        for (const [directionRow, directionColumn] of directions) {
            let r = row + directionRow;
            let c = column + directionColumn;
            let jumped = false;
    
            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
                if (this.board[r][c] === Piece.EMPTY && !capturingOnly && !jumped)
                    validMoves.push([r, c]);
                else if (this.board[r][c] % 2 !== piece % 2) {
                    const captureRow = r + directionRow;
                    const captureColumn = c + directionColumn;
                    if (captureRow >= 0 && captureRow < BOARD_SIZE && captureColumn >= 0 && captureColumn < BOARD_SIZE && this.board[captureRow][captureColumn] === Piece.EMPTY) {
                        captures.push([captureRow, captureColumn]);
                        jumped = true;
                    }

                    break;
                } else if (this.board[r][c] !== Piece.EMPTY && this.board[r][c] % 2 == piece % 2) 
                    break;
                
                r += directionRow;
                c += directionColumn;
            }
        }
    
        return captures.length > 0 ? captures : validMoves;
    }
    
    getAllValidMoves(color: Piece): Move[] {
        const moves: Move[] = [];
        const capturingMoves: Move[] = [];
    
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let column = 0; column < BOARD_SIZE; column++) {
                if (this.board[row][column] === color || this.board[row][column] === color + 2) {
                    const validMoves = this.getValidMoves(row, column);
                    for (const move of validMoves) {
                        if (Math.abs(move[0] - row) > 1)
                            capturingMoves.push([[row, column], move]);
                        else
                            moves.push([[row, column], move]);
                    }
                }
            }
        }
    
        return capturingMoves.length > 0 ? capturingMoves : moves;
    }
    
    checkForWinner(): string | null {
        const whiteMovesLeft = this.getAllValidMoves(Piece.WHITE_PIECE);
        const blackMovesLeft = this.getAllValidMoves(Piece.BLACK_PIECE);
        return whiteMovesLeft.length == 0 ? 'BLACK' : blackMovesLeft.length == 0 ? 'WHITE' : null;
    }    
}

export {
    Game,
    Piece,
    Position,
    Move,
    Turn,
    BOARD_SIZE
}
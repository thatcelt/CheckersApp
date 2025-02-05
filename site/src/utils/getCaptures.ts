import { Piece, Position, BOARD_SIZE } from './types';

function getCaptures(board: Piece[][], pieceCoordinates: Position): Position[] {
    const piece = board[pieceCoordinates[0]][pieceCoordinates[1]];
    
    for (let i = 0; i < board.length; i++)
        for (let j = 0; j < board[i].length; j++)
            if (board[i][j] == Piece.SELECT)
                board[i][j] = Piece.EMPTY;
            
    const captures: Position[] = [];
    
    const findCaptures = (position: Position, visited: Set<string>) => {
        const moves = Array.from(new Set(getValidMoves(board, position[0], position[1], true)));
        if (moves.length > 1) return;

        for (const move of moves) {
            const moveKey = `${move[0]},${move[1]}`;
            if (visited.has(moveKey)) continue;

            const directionRow = (move[0] - position[0]) / Math.abs(move[0] - position[0]);
            const directionCol = (move[1] - position[1]) / Math.abs(move[1] - position[1]);
            let r = position[0] + directionRow;
            let c = position[1] + directionCol;
            let jumpedPiece: Position | null = null;

            while (r !== move[0] || c !== move[1]) {
                if ([Piece.WHITE_PIECE, Piece.BLACK_PIECE, Piece.WHITE_KING, Piece.BLACK_KING].includes(board[r][c])) {
                    if (jumpedPiece) break;
                    jumpedPiece = [r, c];
                } else if (board[r][c] !== 0)
                    break;
                r += directionRow;
                c += directionCol;
            }

            if (!jumpedPiece) continue;

            board[move[0]][move[1]] = piece;
            board[position[0]][position[1]] = 0;
            board[jumpedPiece[0]][jumpedPiece[1]] = 0;

            captures.push(move as Position);
            findCaptures(move as Position, new Set([...visited, moveKey]));

            board[move[0]][move[1]] = 0;
            board[position[0]][position[1]] = piece;
            board[jumpedPiece[0]][jumpedPiece[1]] = (piece % 2) + 1;
        }
    };

    findCaptures(pieceCoordinates, new Set([`${pieceCoordinates[0]},${pieceCoordinates[1]}`]));
    return captures;
}    

function getValidMoves(board: Piece[][], row: number, col: number, capturingOnly = false): Position[] {
    const piece = board[row][col];
    if (piece == Piece.WHITE_PIECE || piece == Piece.BLACK_PIECE)
        return getValidMovesForPiece(board, row, col, piece, capturingOnly);
    else if (piece == Piece.WHITE_KING || piece == Piece.BLACK_KING)
        return getValidMovesForKing(board, row, col, piece, capturingOnly);
    return [];
}

function getValidMovesForPiece(board: Piece[][], row: number, column: number, piece: Piece, capturingOnly: boolean): Position[] {
    const directions = [ [1, -1], [1, 1], [-1, -1], [-1, 1] ];
    const validMoves: Position[] = [];
    const captures: Position[] = [];

    for (const [directionRow, directionColumn] of directions) {
        const r = row + directionRow;
        const c = column + directionColumn;

        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] == Piece.EMPTY && !capturingOnly)
            if ((directionRow < 0 && piece == Piece.WHITE_PIECE) || (directionRow > 0 && piece == Piece.BLACK_PIECE))
                validMoves.push([r, c]);

        const captureRow = r + directionRow;
        const captureColumn = c + directionColumn;
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && captureRow >= 0 && captureRow < BOARD_SIZE && captureColumn >= 0 && captureColumn < BOARD_SIZE && board[r][c] != Piece.EMPTY && board[r][c] % 2 != piece % 2 && board[captureRow][captureColumn] == Piece.EMPTY)
             captures.push([captureRow, captureColumn]);
    }

    return captures.length > 0 ? captures : validMoves;
}

function getValidMovesForKing(board: Piece[][], row: number, column: number, piece: Piece, capturingOnly: boolean): Position[] {
    const directions = [ [-1, -1], [-1, 1], [1, -1], [1, 1] ];
    const validMoves: Position[] = [];
    const captures: Position[] = [];

    for (const [directionRow, directionColumn] of directions) {
        let r = row + directionRow;
        let c = column + directionColumn;
        let jumped = false;
        let jumpedPiece = false; 

        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            if (board[r][c] === Piece.EMPTY) {
                if (!capturingOnly && !jumped) {
                    validMoves.push([r, c]);
                } else if (jumpedPiece) {
                    captures.push([r, c]);
                }
            } else if (board[r][c] % 2 !== piece % 2) {
                if (jumpedPiece) break; 
                jumpedPiece = true;
            } else {
                break;
            }

            r += directionRow;
            c += directionColumn;
        }
    }

    return captures.length > 0 ? captures : validMoves;
}

export {
    getCaptures
};
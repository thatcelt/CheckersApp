import { Piece, Turn, Game } from '../utils/game'; 


describe('GameLogic', () => {
    let game: any;

    beforeEach(() => {
        game = new Game([
            [0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 2, 0, 2, 0, 2, 0, 2],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0]
        ]);
    });

    test('Инициализация доски', () => {
        const initialBoard = game.board;
        expect(initialBoard[0][1]).toBe(Piece.BLACK_PIECE);
        expect(initialBoard[7][0]).toBe(Piece.WHITE_PIECE);
        expect(initialBoard[3][3]).toBe(Piece.EMPTY);
    });

    test('Проверка всех возможных ходов для шашки на правильность', () => {
        const moves = game.getValidMoves(2, 1);
        expect(moves).toEqual(expect.arrayContaining([[3, 0], [3, 2]]));
    });

    test('Проверка на становление дамкой из обычной фишки', () => {
        game.movePiece([6, 1], [0, 1]);
        expect(game.board[0][1]).toBe(Piece.WHITE_KING);
    });

    test('Проверка на кушоние фишек', () => {
        game.board[5][4] = Piece.WHITE_PIECE; 
        game.board[4][5] = Piece.BLACK_PIECE;
        game.movePiece([5, 4], [3, 6]);
        expect(game.board[4][5]).toBe(Piece.EMPTY);
        expect(game.board[3][6]).toBe(Piece.WHITE_PIECE);
    });

    test('Проверка на победителя когда не осталось других шашек', () => {
        game.board = Array.from({ length: 8 }, () => Array(8).fill(0)); 
        game.board[0][1] = Piece.BLACK_PIECE; 
        const winner = game.checkForWinner();
        expect(winner).toBe('BLACK');
    });

    test('Проверка простаты игоря', () => {
        game.board[5][0] = Piece.WHITE_PIECE;
        game.board[4][1] = Piece.EMPTY;
        game.movePiece([5, 0], [4, 1]);

        expect(game.board[4][1]).toBe(Piece.WHITE_PIECE);
        expect(game.board[5][0]).toBe(Piece.EMPTY);
        expect(game.currentTurn).toBe(Turn.Black);
    });

    test('Проверка на захват фигуры противника', () => {
        game.board[5][0] = Piece.WHITE_PIECE;
        game.board[4][1] = Piece.BLACK_PIECE;
        game.board[3][2] = Piece.EMPTY; 

        game.movePiece([5, 0], [3, 2]);

        expect(game.board[3][2]).toBe(1);
        expect(game.board[4][1]).toBe(0);
        expect(game.board[5][0]).toBe(0);
    });

    test('Превращение белой фишки в дамку', () => {
        game.board[1][0] = Piece.WHITE_PIECE;
        game.board[0][1] = Piece.EMPTY;

        game.movePiece([1, 0], [0, 1]);

        expect(game.board[0][1]).toBe(Piece.WHITE_KING);
    });

    test('Превращение черной фишки в дамку', () => {
        game.board[6][1] = Piece.BLACK_PIECE;
        game.board[7][0] = Piece.EMPTY; 

        game.currentTurn = Turn.Black;
        game.movePiece([6, 1], [7, 0]);

        expect(game.board[7][0]).toBe(Piece.BLACK_KING);
    });

    test('Возможность дамке двигаться на несколько клеток', () => {
        game.board[4][4] = Piece.WHITE_KING; 
        game.board[2][2] = Piece.EMPTY;

        game.movePiece([4, 4], [2, 2]);

        expect(game.board[2][2]).toBe(3);
        expect(game.board[4][4]).toBe(0);
    });

    test('Проверка захвата фишек дамкой', () => {
        game.board = Array.from({ length: 8 }, () => Array(8).fill(0)); 

        game.board[5][5] = Piece.WHITE_KING;
        game.board[4][4] = Piece.BLACK_PIECE; 
        game.board[3][3] = Piece.EMPTY;
        game.board[2][2] = Piece.BLACK_PIECE;
        game.board[1][1] = Piece.EMPTY; 

        game.movePiece([5, 5], [3, 3]);
        game.movePiece([3, 3], [1, 1]);

        expect(game.board[1][1]).toBe(3);
        expect(game.board[5][5]).toBe(0);
        expect(game.board[4][4]).toBe(0);
        expect(game.board[2][2]).toBe(0);
    });

    test('Проверка на обязательные ходы', () => {
        game.board = Array.from({ length: 8 }, () => Array(8).fill(0)); 

        game.board[5][0] = Piece.WHITE_PIECE;
        game.board[4][1] = Piece.BLACK_PIECE; 
        game.board[3][2] = Piece.EMPTY;
        game.board[5][4] = Piece.WHITE_PIECE;

        const validMoves = game.getAllValidMoves(Piece.WHITE_PIECE);
        expect(validMoves).toEqual([[[5, 0], [3, 2]]]);
    });

    test('Не должно определять победителя, если есть доступные ходы', () => {
        game.board[5][0] = Piece.WHITE_PIECE;
        game.board[4][1] = Piece.EMPTY;
        game.board[6][2] = Piece.BLACK_PIECE;

        const winner = game.checkForWinner();
        expect(winner).toBeNull();
    });

    test('Проверка на правильное чредование ходов', () => {
        game.board[5][0] = Piece.WHITE_PIECE;
        game.board[4][1] = Piece.EMPTY;

        game.movePiece([5, 0], [4, 1]);
        expect(game.currentTurn).toBe(Turn.Black);

        game.board[2][1] = Piece.BLACK_PIECE;
        game.board[3][2] = Piece.EMPTY; 
        game.movePiece([2, 1], [3, 2]);

        expect(game.currentTurn).toBe(Turn.White);
    });

    test('Проверка глаз бога смерти #1', () => {
        game.board = [
            [0, 2, 0, 2, 0, 2, 0, 0],
            [2, 0, 2, 0, 2, 0, 0, 0],
            [0, 0, 0, 0, 0, 4, 0, 0],
            [1, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];

        const result = game.getValidMoves(2, 5, true);
        expect(result).toStrictEqual([[7, 0]]);
    });

    test('Проверка глаз бога смерти #2', () => {
        game.board = [
            [0, 2, 0, 2, 0, 2, 0, 0],
            [2, 0, 2, 0, 2, 0, 0, 0],
            [0, 0, 0, 0, 0, 4, 0, 0],
            [1, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 2, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];

        const result = game.getValidMoves(2, 5, true);
        expect(result).toStrictEqual([]);
    });

    test('Проверка глаз бога смерти #3', () => {
        game.board = [
            [0, 2, 0, 2, 0, 2, 0, 0],
            [2, 0, 2, 0, 2, 0, 0, 0],
            [0, 0, 0, 0, 0, 4, 0, 0],
            [1, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 0, 0],
            [2, 0, 0, 0, 0, 0, 0, 0]
        ];

        const result = game.getValidMoves(2, 5, true);
        expect(result).toStrictEqual([]);
    });

    test('Проверка глаз бога смерти #4', () => {
        game.board = [
            [0, 2, 0, 2, 0, 2, 0, 0],
            [2, 0, 2, 0, 2, 0, 0, 0],
            [0, 0, 0, 0, 0, 4, 0, 0],
            [1, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 1, 0, 0, 0, 1, 0],
            [0, 2, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];

        const result = game.getValidMoves(2, 5, true);
        expect(result).toStrictEqual([]);
    });

    test('Проверка на блуд', () => {
        game.board = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 2, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];

        game.currentTurn = Turn.Black;
        game.movePiece([2, 5], [4, 3]);

        expect(game.mustCapture).toBe(true);
        expect(game.capturingPiece).toEqual([4, 3]);
        expect(game.currentTurn).toBe(Turn.Black);
        
        game.movePiece([4, 3], [6, 1]);

        expect(game.mustCapture).toBe(false);
        expect(game.capturingPiece).toBeNull();
        expect(game.currentTurn).toBe(Turn.White);
    });
});

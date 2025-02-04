import { Game, BOARD_SIZE, Piece, Position, Move } from "./game";

class BotMonteCarlo {
    private level: string;
    private iterations: number;

    constructor(level: string) {
        this.level = level;
        this.iterations = level === "hard" ? 5000 : level === "medium" ? 2000 : 500;
    }

    getMove(logic: Game): Move | null {
        if (this.level === "easy") {
            return this.getRandomMove(logic);
        } else if (this.level === "hard") {
            return Math.random() > 0.5 ? this.getMCTSBestMove(logic) : this.getAlphaBetaBestMove(logic);
        } else {
            return this.getMCTSBestMove(logic);
        }
    }

    private getRandomMove(logic: Game): Move | null {
        const validMoves = logic.getAllValidMoves(2);
        return validMoves.length > 0 ? validMoves[Math.floor(Math.random() * validMoves.length)] : null;
    }

    private getMCTSBestMove(logic: Game): Move | null {
        let root = new MCTSNode(this.getGameCopy(logic));
        for (let i = 0; i < this.iterations; i++) {
            let node = root.select();
            let winner = node.rollout();
            node.backpropagate(winner);
        }
        return root.getBestMove();
    }

    private getAlphaBetaBestMove(logic: Game): Move | null {
        let bestMove: Move | null = null;
        let bestValue = -Infinity;
        for (const move of logic.getAllValidMoves(2)) {
            const newGame = this.getGameCopy(logic);
            newGame.movePiece(move[0], move[1]);
            let moveValue = this.alphaBeta(newGame, 5, -Infinity, Infinity, false);
            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }
        }
        return bestMove;
    }

    private alphaBeta(logic: Game, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number {
        if (depth === 0 || logic.checkForWinner()) {
            return this.evaluateBoard(logic);
        }

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of logic.getAllValidMoves(2)) {
                const newGame = this.getGameCopy(logic);
                newGame.movePiece(move[0], move[1]);
                let evalValue = this.alphaBeta(newGame, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evalValue);
                alpha = Math.max(alpha, evalValue);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of logic.getAllValidMoves(1)) {
                const newGame = this.getGameCopy(logic);
                newGame.movePiece(move[0], move[1]);
                let evalValue = this.alphaBeta(newGame, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evalValue);
                beta = Math.min(beta, evalValue);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    private evaluateBoard(logic: Game): number {
        let score = 0;
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                let piece = logic.board[row][col];
                if (piece === Piece.BLACK_PIECE) score += 5;
                else if (piece === Piece.BLACK_KING) score += 10;
                else if (piece === Piece.WHITE_PIECE) score -= 5;
                else if (piece === Piece.WHITE_KING) score -= 10;
            }
        }
        return score;
    }

    getGameCopy(game: Game): Game {
        const newLogic = new Game();
        newLogic.board = game.board.map(row => [...row]);
        newLogic.currentTurn = game.currentTurn;
        newLogic.mustCapture = game.mustCapture;
        newLogic.capturingPiece = game.capturingPiece || null;
        return newLogic;
    }
}

class MCTSNode {
    game: Game;
    parent: MCTSNode | null;
    children: Map<string, MCTSNode>;
    wins: number;
    visits: number;

    constructor(game: Game, parent: MCTSNode | null = null) {
        this.game = game;
        this.parent = parent;
        this.children = new Map();
        this.wins = 0;
        this.visits = 0;
    }

    select(): MCTSNode {
        if (this.children.size === 0) {
            return this.expand();
        }
        return [...this.children.values()].reduce((best, child) => 
            child.uctValue() > best.uctValue() ? child : best);
    }

    expand(): MCTSNode {
        for (const move of this.game.getAllValidMoves(2)) {
            const newGame = this.getGameCopy();
            newGame.movePiece(move[0], move[1]);
            const key = JSON.stringify(move);
            if (!this.children.has(key)) {
                const newNode = new MCTSNode(newGame, this);
                this.children.set(key, newNode);
                return newNode;
            }
        }
        return this;
    }

    rollout(): number {
        let simulation = this.getGameCopy();
        while (!simulation.checkForWinner()) {
            const validMoves = simulation.getAllValidMoves(simulation.currentTurn as unknown as Piece);
            if (validMoves.length === 0) break;
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            simulation.movePiece(randomMove[0], randomMove[1]);
        }
        return simulation.checkForWinner() === "BLACK" ? 1 : 0;
    }

    backpropagate(result: number): void {
        this.visits++;
        this.wins += result;
        if (this.parent) {
            this.parent.backpropagate(1 - result);
        }
    }

    uctValue(): number {
        if (this.visits === 0) return Infinity;
        return this.wins / this.visits + Math.sqrt(2 * Math.log(this.parent!.visits) / this.visits);
    }

    getBestMove(): Move | null {
        if (this.children.size === 0) return null;
    
        let bestMove: Move | null = null;
        let maxVisits = -Infinity;
    
        for (const [move, child] of this.children.entries()) {
            if (child.visits > maxVisits) {
                bestMove = JSON.parse(move) as Move;
                maxVisits = child.visits;
            }
        }
    
        return bestMove;
    }
    

    getGameCopy(): Game {
        const minianus = new Game();
        minianus.board = this.game.board.map(row => [...row]);
        minianus.currentTurn = this.game.currentTurn;
        minianus.mustCapture = this.game.mustCapture;
        minianus.capturingPiece = this.game.capturingPiece || null;
        return minianus;
    }
}

export { BotMonteCarlo };

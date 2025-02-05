import { AuthorizationContextType, GameContextType } from "../context/types";
import { BOARD_SIZE, LanguageTranslations, Piece, Translations } from "./types";
import translations from "../resources/locales/locales.json";
import { MutableRefObject, SetStateAction } from "react";

export function getLocalizedString(authContextOrLanguage: AuthorizationContextType | string, key: keyof LanguageTranslations): string  {
    let choosenLanguage
    if(typeof authContextOrLanguage == "string") {
        choosenLanguage = authContextOrLanguage
    } else {
        choosenLanguage = authContextOrLanguage.user?.language
    }
    const lang = choosenLanguage as keyof Translations;
    // @ts-ignore
    return translations[lang][key];
};

export const enableTimer = (counter: number, timeInterval: MutableRefObject<number | undefined>, setCounter: (value: SetStateAction<number>) => void, gameContext: GameContextType) => {
    // @ts-ignore
    timeInterval.current = setInterval(() => {
        setCounter((prevTime: number) => {
        const newTime = Math.max(prevTime - 1, 0);
        counter = newTime;

        if (newTime === 0) {
            if (timeInterval.current) {
                clearInterval(timeInterval.current);
                timeInterval.current = undefined;
            }

            gameContext.setFirstCounter(600);
            gameContext.setSecondCounter(600);
        }

        return newTime;
    });
    }, 1000);
}

export const updateActivePlayer = (currentTurn: number, playersContainers: MutableRefObject<HTMLDivElement | null>[]) => {
    if (!playersContainers[0].current || !playersContainers[1].current) return;
    
    if (currentTurn == 2) {
        playersContainers[0].current.style.border = '';
        playersContainers[1].current.style.border = '2px solid #FFB835';
    } else {
        playersContainers[1].current.style.border = '';
        playersContainers[0].current.style.border = '2px solid #FFB835';
    }
}

const updateCellDisplay = (authContext: AuthorizationContextType, cell: HTMLElement, value: number) => {
    let child = cell.querySelector('img') as HTMLImageElement;
    
    if (!child && value !== 0) {
        child = document.createElement('img');
        cell.appendChild(child);
    }

    if (!child) return;

    const assetMap: Record<number, { src: string; id: string } | null > = {
        1: { src: '../src/resources/assets/whitechip.png', id: 'chip-cell-id' },
        2: { src: '../src/resources/assets/blackchip.png', id: 'chip-cell-id' },
        3: { src: '../src/resources/assets/whiteking.png', id: 'chip-cell-id' },
        4: { src: '../src/resources/assets/blackking.png', id: 'chip-cell-id' },
        9: authContext.user?.possibleMoves
            ? { src: '../src/resources/assets/move.png', id: 'move-cell-id' }
            : null
    };

    if (value === 0) {
        child.remove();
        return;
    }

    const newProps = assetMap[value];
    if (newProps && (child.src !== newProps.src || child.id !== newProps.id)) {
        child.src = newProps.src;
        child.id = newProps.id;
    }
};

export const animateMove = (authContext: AuthorizationContextType, gameContext: GameContextType, from: number[], to: number[]): Promise<void> => {
    const fromCell = document.getElementById(`cell-${from[0] * gameContext.board.length + from[1]}`)!;
    const toCell = document.getElementById(`cell-${to[0] * gameContext.board.length + to[1]}`)!;

    return new Promise((resolve) => {
        const piece = fromCell.querySelector('img');
        if (piece) {
            const fromRect = fromCell.getBoundingClientRect();
            const toRect = toCell.getBoundingClientRect();
            const deltaX = toRect.left - fromRect.left;
            const deltaY = toRect.top - fromRect.top;

            // Обновление состояния доски
            gameContext.board[to[0]][to[1]] = gameContext.board[from[0]][from[1]];
            gameContext.board[from[0]][from[1]] = 0;
            gameContext.setBoard([...gameContext.board]);

            const body = document.body;
            const pieceClone = piece.cloneNode(true) as HTMLImageElement;
            body.appendChild(pieceClone);
            updateCellDisplay(authContext, fromCell, 0);

            const rect = fromCell.getBoundingClientRect();
            pieceClone.style.position = 'fixed';
            pieceClone.style.left = `${rect.left}px`;
            pieceClone.style.top = `${rect.top}px`;
            pieceClone.style.width = `${rect.width}px`;
            pieceClone.style.height = `${rect.width}px`;
            pieceClone.style.zIndex = '4';
            pieceClone.style.willChange = 'transform opacity';
            pieceClone.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.4s ease';
            pieceClone.style.transform = `translate3d(0, 0, 0)`;

            piece.style.opacity = '0';
            requestAnimationFrame(() => {
                pieceClone.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
            });


            pieceClone.addEventListener('transitionend', function handleTransitionEnd() {
                pieceClone.removeEventListener('transitionend', handleTransitionEnd);
                pieceClone.remove(); 
                
                piece.style.opacity = '1';

                updateCellDisplay(authContext, toCell, gameContext.board[to[0]][to[1]]);
                
                resolve();
            });
        } else {
            resolve();
        }
    });
};

export const updateBoardDisplay = (authContext: AuthorizationContextType, board: number[][]) => {
    board.flat().forEach((value, index) => {
        const cell = document.getElementById(`cell-${index.toString()}`);
        if (cell) {
            updateCellDisplay(authContext, cell, value);
        }
    });
};

export const clearPossibleMoves = (gameContext: GameContextType) => {
    gameContext.board = gameContext.board.map((row) =>
        row.map((cell) => (cell === 9 ? 0 : cell))
    );

    gameContext.setBoard(gameContext.board);
};

export const formatDate = (date: Date) => {
    return {
        time: date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        date: date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
    };
};

export const animateOppositeChip = (authContext: AuthorizationContextType, gameContext: GameContextType, from: number[], to: number[]): Promise<void> => {
    return new Promise((resolve) => {
        const fromCell = document.getElementById(
            `cell-${from[0] * gameContext.board.length + from[1]}`
        );
        const toCell = document.getElementById(
            `cell-${to[0] * gameContext.board.length + to[1]}`
        );

        if (fromCell && toCell) {
            const piece = fromCell.querySelector('img');
            if (piece) {
                const fromRect = fromCell.getBoundingClientRect();
                const toRect = toCell.getBoundingClientRect();
                const deltaX = toRect.left - fromRect.left;
                const deltaY = toRect.top - fromRect.top;

                const clone = piece.cloneNode(true) as HTMLImageElement;
                clone.style.position = 'absolute';
                clone.style.left = `${fromRect.left}px`;
                clone.style.top = `${fromRect.top}px`;
                clone.style.width = `${fromRect.width}px`;
                clone.style.height = `${fromRect.height}px`;
                clone.style.transition = 'transform 0.45s ease';

                piece.style.visibility = 'hidden';

                document.body.appendChild(clone);

                requestAnimationFrame(() => {
                    clone.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                });

                const handleTransitionEnd = () => {
                    cleanupClone(); 
                    resolve(); 
                };

                clone.addEventListener('transitionend', handleTransitionEnd);

                const cleanupTimeout = setTimeout(() => {
                    cleanupClone();
                    resolve();
                }, 500); 

                const cleanupClone = () => {
                    clone.removeEventListener('transitionend', handleTransitionEnd);
                    document.body.removeChild(clone);
                    clearTimeout(cleanupTimeout); 
                };

                // @ts-ignore
                resolve().then(() => {
                    updateCellDisplay(authContext, fromCell, 0);
                    updateCellDisplay(
                        authContext,
                        toCell,
                        gameContext.board[to[0]][to[1]]
                    );
                    piece.style.visibility = 'visible'; 
                });
            } else {
                resolve();
            }
        } else {
            resolve(); 
        }
    });
}
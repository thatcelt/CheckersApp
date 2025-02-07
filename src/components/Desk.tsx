import { FC, memo, useEffect } from 'react';
import '../styles/Desk.css';
import { useGame } from '../hooks/useGame';
import { DESK_MATRIX } from '../utils/constants';
import { CellRow } from './CellRow';

const Desk: FC = () => {
    const gameContext = useGame();

    useEffect(() => {
        gameContext.board = [
            [0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 2, 0, 2, 0, 2, 0, 2],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0]
        ];
    }, []);

    return (
        <>
        <div className="desk-container" id="desk-view">
            <div className="desk-space">
                {DESK_MATRIX.map((row, index) =>
                    <CellRow elementInRow={row} key={index} row={index} />
                )}
            </div>
        </div>
        </>
    );
};

export default memo(Desk);

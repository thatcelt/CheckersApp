import { FC, useCallback } from 'react';
import '../styles/CellRow.css';
import { BLACK_CHIP_IMAGE, BLACK_POSITIONS, EMPTY_IMAGE, WHITE_CELLS, WHITE_CHIP_IMAGE, WHITE_POSITIONS } from '../utils/constants';
import Cell from './Cell';
import '../styles/CellRow.css'

export const CellRow: FC<{ elementInRow: number[], row: number }> = ({elementInRow, row}) => {

    const currentCellColor = useCallback((element: number): string => {
        if (WHITE_CELLS.includes(element))
            return '#FFFFFF';
        else 
            return '#7B7B7B';
    }, []);

    const currentChip = useCallback((element: number): string => {
        if (BLACK_POSITIONS.includes(element))
            return BLACK_CHIP_IMAGE;
        else if (WHITE_POSITIONS.includes(element))
            return WHITE_CHIP_IMAGE;
        else 
            return EMPTY_IMAGE;
    }, []);
    
    return (
        <>
        <div className="cells-row">
            {
                elementInRow.map((element, index) => 
                    <Cell cellId={element.toString()} key={index} cellColor={currentCellColor(element)}>
                        {
                            <img src={currentChip(element)} id="chip-cell-id" className={`chip-image-${row}-${index}`} loading='lazy'/>
                        }
                    </Cell>
                )
            }
        </div>
        </>
    )
};
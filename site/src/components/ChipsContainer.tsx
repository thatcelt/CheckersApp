import { FC } from "react"
import { RIGHT_BACKLIGHTS } from "../utils/constants";

const ChipsContainer: FC<{ currentTurn: number, earnedChips: number, type: string }> = ({ currentTurn, earnedChips, type }) => {

    return (
        <>
        <div
            className={`white-chips-container ${currentTurn == RIGHT_BACKLIGHTS.get(type) ? 'chips-container-active' : ''}`}
        >
            <img src={`../src/resources/assets/${type}chips.png`} alt={type} id={`${type}chipsimage`} />
            X{earnedChips}
        </div>
        </>
    )
}

export default ChipsContainer;
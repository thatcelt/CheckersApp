import { FC, memo } from "react";

const ActionGameButton: FC<{ title: string, icon: string, onClick: () => void }> = ({ title, icon, onClick }) => {
    return (
        <>
        <div className="game-button" onClick={onClick}>
            <img src={icon} alt={title} />
            <div className="action-button-text-area">
                <span className="action-button-text">
                    {title}
                </span>
            </div>
        </div>
        </>
    )
}

export default memo(ActionGameButton);
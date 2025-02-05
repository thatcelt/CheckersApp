import { FC, memo } from "react";

const SettingsCard: FC<{ textArea: string, textEnd?: string, onClick: () => void }> = ({ textArea, textEnd, onClick }) => {
    return (
        <>
        <div className="settings-card" onClick={onClick}>
            <div className="settings-text-area">{textArea}</div>
            {textEnd ? <div className="setting-card-end">
                {textEnd}
                <img className="settings-card-img" src="../src/resources/assets/arrow.svg" alt="Arrow" />
            </div> : <img className="settings-card-img" src="../src/resources/assets/arrow.svg" alt="Arrow" />}
        </div>
        </>
    )
}

export default memo(SettingsCard);
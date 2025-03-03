import { FC, useEffect, useState } from 'react';
import '../styles/PlayerCard.css';
import { PlayerCardProps } from '../props/playerCardProps';
import { useGame } from '../hooks/useGame';

const PlayerCard: FC<PlayerCardProps> = ({ refContainer, nickname, avatar, objectId, type }) => {
    const gameContext = useGame();
    const [searchState, setSearchState] = useState<string>('...');

    if (!nickname)
        nickname = 'Player';
    if (nickname.length > 12)
        nickname = nickname.slice(0, 9) + '...'; 

    let nicknameTag;
    if (type && ['player', 'player2'].includes(type))
        nicknameTag = 'player-other-info';
    else
        nicknameTag = 'bot-other-info';

    const currentCounter = type === 'bot' ? gameContext.secondCounter : type === 'player2' ? gameContext.secondCounter : gameContext.firstCounter;

    useEffect(() => {
        const intervalId = setInterval(() => {
            setSearchState(prev => `Searching${'.'.repeat(prev.split('.').slice(1).length < 3 ? prev.split('.').slice(1).length + 1 : 0)}`);
        }, 1000);
        
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return (
        <>
        <div
            className="player-container" id={objectId.toString()} ref={refContainer}>
            <div className="player-general-info" style={objectId.toString() == 'searching' ? {margin: 'auto'} : {}}>
                <span className={nicknameTag} style={objectId.toString() == 'searching' ? {fontSize: '20px'} : {}}>{objectId.toString() === 'searching' ? searchState : nickname}</span>
            </div>
            {objectId.toString() !== 'searching' && (
                <div className="player-other-info">
                    <img src={avatar} />
                    <div className="time-block">
                        <div className="time-container" id={`time-container-${objectId}`}>
                            {`${Math.floor(currentCounter / 60)}:${String(currentCounter % 60).padStart(2, '0')}`}
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default PlayerCard;

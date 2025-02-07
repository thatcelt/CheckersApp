import { FC } from 'react';
import { getLocalizedString } from '../utils/utils';
import { useAuthorization } from '../hooks/useAuthorization';

const RatingProfileCard: FC<{ scores?: number, profilePicture?: string, position?: number }> = ({ scores, profilePicture, position }) => {
    const authContext = useAuthorization();
    
    return (
        <div className="scores-card animated">
            <img
                src={profilePicture || '/assets/bot.svg'}
                alt="User Avatar"
                className="scores-avatar"
            />
            <div className="scores-info">
                <span className="scores-info-nickname">{getLocalizedString(authContext, 'currentRating')} #{position}</span>
                <div className="scores-count">
                    <img src="../src/resources/assets/star.png" alt="Star Icon" />
                    <div className="my-scores-count-container">
                        <span>{scores}</span>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default RatingProfileCard;
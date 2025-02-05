import { FC } from "react";
import '../styles/RatingCard.css'
import { RatingCardProps } from "../props/ratingCardProps";

const RatingCard: FC<RatingCardProps> = ({avatar, nickname, scores, index}) => {
    if(nickname.length > 15) nickname = nickname.slice(0, 12) + '...';
    
    return (
        <>
        <div

            className="rating-card-container">
            <div className="rating-card-avatar">
                <img src={avatar}/>
            </div>
            <div className="rating-card-info">
                <div className="rating-card-info-general">
                    {nickname}
                </div>
                <div className="rating-scores-container">
                    <img src="../src/resources/assets/star.png"/>
                    <div className="rating-scores-count-container">
                        <span>{scores}</span>
                    </div>
                </div>
            </div>
            <div className="place">
                <span>#{index + 1}</span>
            </div>
        </div>
        </>
    )
}

export default RatingCard
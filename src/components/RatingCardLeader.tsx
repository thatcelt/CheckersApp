import { FC } from "react";
import { RatingCardProps } from "../props/ratingCardProps";

const RatingLeaderCard: FC<RatingCardProps> = ({avatar, nickname, scores, index}) => {
    const cupPath = `../src/resources/assets/${index + 1}.png`
    const placeColors = new Map()
        .set(0, '#FFB835')
        .set(1, '#FCD385')
        .set(2, '#FAE0B1')
    if (nickname.length > 15) nickname = nickname.slice(0, 12) + '...';

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
                <div className="rating-scores-list-container">
                    <div className="rating-scores-container">
                        <img src="../src/resources/assets/star.png"/>
                        <div className="rating-scores-count-container">
                            <span>{scores}</span>
                        </div>
                    </div>
                    <div className="colored-place" style={{background: placeColors.get(index)}}>
                        <span>#{index + 1}</span>
                    </div>
                </div>
            </div>
            <div className="place">
                <img src={cupPath}/>
            </div>
        </div>
        </>
    )
}

export default RatingLeaderCard
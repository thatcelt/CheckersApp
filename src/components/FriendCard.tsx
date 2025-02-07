import { FC } from 'react';
import '../styles/FriendCard.css';
import { FriendCardProps } from '@/props/friendCardProps';

const FriendCard: FC<FriendCardProps> = ({avatar, nickname, scores, width, onClick}) => {
    return (
        <>
            <div className="friend-card-container" style={width != null ? {width: width} : {}} onClick={onClick != undefined ? () => onClick() : () => {}}>
                <div className="friend-card-avatar">
                    <img src={avatar}/>
                </div>
                <div className="friend-card-info">
                    <div className="friend-card-info-general">
                        {nickname}
                    </div>
                    <div className="scores-container">
                        <img src="../src/resources/assets/star.png"/>
                        <div className="scores-count-container">
                            <span>{scores}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default FriendCard;
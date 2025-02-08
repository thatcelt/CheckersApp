import { FC, memo } from 'react';
import BottomPanel from '../components/BottomPanel';
import RatingProfileCard from '../components/RatingProfileCard';
import { getLocalizedString } from '../utils/utils';
import { useAuthorization } from '../hooks/useAuthorization';
import RatingCard from '../components/RatingCard';
import RatingLeaderCard from '../components/RatingCardLeader';
import '../styles/RatingPage.css';

const RatingPage: FC = () => {
    const authContext = useAuthorization();
    return (
        <>
            <div className="rating-container">
                <div className="scores-card-container">
                    <RatingProfileCard profilePicture={authContext.user?.profilePicture} scores={authContext.ratingDataRef.current?.user.userData.scores} position={authContext.ratingDataRef.current?.user.index}/>
                    <div className="rating-list-container">
                        <span>{getLocalizedString(authContext, 'competitorRating')}</span>
                        <div className="rating-list">
                            {authContext.ratingDataRef.current?.users?.map((user, index) =>
                                index > 2 ? (
                                    <RatingCard
                                        avatar={user.profilePicture || '/assets/bot.svg'}
                                        nickname={user.username}
                                        scores={user.scores}
                                        key={index}
                                        index={index}
                                    />
                                ) : (
                                    <RatingLeaderCard
                                        avatar={user.profilePicture || '/assets/bot.svg'}
                                        nickname={user.username}
                                        scores={user.scores}
                                        key={index}
                                        index={index}
                                    />
                                )
                            )}
                            <div className="darkering" />
                        </div>
                    </div>
                </div>
                <BottomPanel activeVariant="rating" />
            </div>
            <div className="rating-shining" />
        </>
    )
};

export default memo(RatingPage);    
import { FC, useEffect, useState } from "react";
import BottomPanel from "../components/BottomPanel";
import RatingProfileCard from "../components/RatingProfileCard";
import { getRatings } from "../utils/apiWrapper";
import { RatingResponse } from "./types";
import { getLocalizedString } from "../utils/utils";
import { useAuthorization } from "../hooks/useAuthorization";
import RatingCard from "../components/RatingCard";
import RatingLeaderCard from "../components/RatingCardLeader";
import '../styles/RatingPage.css'

const RatingPage: FC = () => {
    const [ratingData, setRatingData] = useState<RatingResponse | null>(null)
    const authContext = useAuthorization()
    const [loading, setLoading] = useState(true)

    const getRatingList = async () => {
        const ratingResults = await getRatings()
        setRatingData(ratingResults)
    }

    useEffect(() => {
        try {
            getRatingList()
        } finally {
            setLoading(false)
        }
    }, [])

    if (loading) {
        return (
          <div>
            <h1>Loading...</h1>
          </div>
        );
      }
    else {
        return (
            <>
            <div className="rating-container">
                    <div className="scores-card-container">
                        <RatingProfileCard profilePicture={ratingData?.user.userData.profilePicture} scores={ratingData?.user.userData.scores} position={ratingData?.user.index}/>
                        <div className="rating-list-container">
                            <span>{getLocalizedString(authContext, 'competitorRating')}</span>
                            <div className="rating-list">
                                {ratingData?.users?.map((user, index) =>
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
    }
}

export default RatingPage;
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { getUser } from '../utils/apiWrapper';
import { useAuthorization } from '../hooks/useAuthorization';
import { useNavigate } from 'react-router-dom';
import { formatDate, getLocalizedString } from '../utils/utils';
import ProfileCard from '../components/ProfileCard';
import ProfileStatistics from '../components/ProfileStatistics';
import { GameHistory, UserData } from './types';
import '../styles/ProfilePage.css'
import BottomPanel from '../components/BottomPanel';

const ProfilePage: FC = () => {
    const navigate = useNavigate();
    const authContext = useAuthorization();
    const [userData, setUserData] = useState<{ user: UserData, gameHistory: GameHistory[] }>({
        user: {
            username: authContext.user!.username,
            profilePicture: authContext.user!.profilePicture,
            registrationDate: authContext.user!.registrationDate
        },
        gameHistory: []
    });

    const getUserData = useCallback(async () => {
        const userResults = await getUser(authContext.user?.userId as unknown as string)
        setUserData({
            user: userResults.user,
            gameHistory: userResults.gameHistory
        });

        if (userResults.user.username.length > 12) 
            userData!.user.username = userResults.user.username.slice(0, 12) + '...';
    }, [userData]);

    useEffect(() => {
        getUserData();
    }, []);
    
    return (
        <>
            <div className="buttons-container">
                <div className="settings-button" onClick={() => navigate('/settings')}>
                    <img src="../src/resources/assets/settings.png" alt={getLocalizedString(authContext, 'settings')} />
                </div>
            </div>
            <div className="profile-container">
                <ProfileCard nickname={userData?.user.username} username={userData?.user.userTag} registrationDate={userData?.user.registrationDate!} profilePicture={userData?.user.profilePicture!}/>
                <ProfileStatistics playedGames={userData?.gameHistory}/>
                <div className="game-history animated">
                    <div className="history-title-container">
                        <div className="history-title">
                            <span>{getLocalizedString(authContext, 'gameHistory')}</span>
                        </div>
                    </div>
                    <div className="history-list">
                        {userData.gameHistory.map((x: any, index: number) => (
                            <div className="statistics-position" key={index}>
                                {getLocalizedString(authContext, x.status)}
                                <span>
                                    <a>{formatDate(new Date(Number(x.playedDate!))).time}</a> {formatDate(new Date(Number(x.playedDate!))).date}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <BottomPanel activeVariant="profile" />
            </div>
        </>
    )
};

export default memo(ProfilePage);
import { FC, memo, useEffect } from 'react';
import { useAuthorization } from '../hooks/useAuthorization';
import { useNavigate } from 'react-router-dom';
import { formatDate, getLocalizedString } from '../utils/utils';
import ProfileCard from '../components/ProfileCard';
import ProfileStatistics from '../components/ProfileStatistics';
import '../styles/ProfilePage.css'
import BottomPanel from '../components/BottomPanel';

const ProfilePage: FC = () => {
    const navigate = useNavigate();
    const authContext = useAuthorization();
    const userData = {
        user: {
            username: authContext.user!.username,
            userTag: authContext.user!.userTag,
            profilePicture: authContext.user!.profilePicture,
            registrationDate: authContext.user!.registrationDate
        },
        gameHistory: authContext.gameHistory
    };

    useEffect(() => {
        if (userData.user.username.length > 12) 
            userData!.user.username = userData.user.username.slice(0, 12) + '...';
    }, []);
    
    return (
        <>
            <div className="buttons-container">
                <div className="settings-button" onClick={() => navigate('/settings')}>
                    <img src="../../public/settings.png" alt={getLocalizedString(authContext, 'settings')} />
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
import { FC, memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthorization } from '../hooks/useAuthorization';
import '../styles/VariantsSelecting.css';
import BottomPanel from '../components/BottomPanel';
import { getLocalizedString } from '../utils/utils';
import SelectingVariant from '../components/SelectingVariant';
import { modalController } from '../context/ModalProvider';
import { getFriends, invitePlayer } from '../utils/apiWrapper';
import FriendCard from '../components/FriendCard';

const GameSelectingPage: FC = () => {
    const navigate = useNavigate();
    const authContext = useAuthorization();
    const [friendsList, setFriendsList] = useState<{ userId: string, username: string, profilePicture: string, scores: number }[]>([]);

    const fetchFriends = async () => {
        await getFriends('active')
            .then(x => setFriendsList(x.friends));
    }

    useEffect(() => {
        fetchFriends();
    }, []);

    const inviteFriend = async (friendId: string) => {
        modalController.closeModal();

        const result = await invitePlayer(friendId);
        switch (result.message) {
            case 'FRIEND_ALREADY_IN_GAME':
            case 'YOU_ARE_ALREADY_IN_GAME':
                modalController.createModal({
                    title: getLocalizedString(authContext, 'inviteFailed'),
                    message: getLocalizedString(authContext, 'inviteFailedDescription')
                });
                break;

            case 'FRIEND_IS_OFFLINE':
                modalController.createModal({
                    title: getLocalizedString(authContext, 'inviteFailed'),
                    message: getLocalizedString(authContext, 'inviteFailedOffline')
                });
                break;

            case 'INVITE_REQUESTED':
                navigate('/play-with-invited', { state: { gameId: result.game, isCreator: true } });
                break;
        }
    };

    const openInviteFriendModal = () => {
        modalController.createModal({
            title: getLocalizedString(authContext, 'inviteFriends'),
            body: (
                <div className="invite-friends-container">
                    {friendsList.length ? (
                        <div className="active-friends-list">
                        {friendsList.map((friend, index) => (
                            <FriendCard
                                avatar={friend.profilePicture || '/assets/bot.svg'}
                                nickname={friend.username}
                                scores={friend.scores}
                                key={index}
                                width="248px"
                                onClick={() => inviteFriend(friend.userId)}
                            />
                        ))}
                    </div>
                    ) : (
                        <div className="not-online"><span>{getLocalizedString(authContext, 'noFriends')}</span></div>
                    )}
                </div> 
            ),
            message: '',
            hideButtons: true
        });
    };

    return (
        <>
            <div className="variants-selecting-container">
                <span>{getLocalizedString(authContext, 'selectLevel')}</span>
                <SelectingVariant title={getLocalizedString(authContext, 'playOnOneDevice')} onSubmit={() => navigate('/game-on-one-device')}/>
                <SelectingVariant title={getLocalizedString(authContext, 'inviteFriend')} onSubmit={() => openInviteFriendModal()}/>
                <BottomPanel activeVariant="games" />
            </div>
            <div className="games-shining" />
        </>
    )
};

export default memo(GameSelectingPage);
import { FC, memo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthorization } from '../hooks/useAuthorization';
import '../styles/VariantsSelecting.css';
import BottomPanel from '../components/BottomPanel';
import { getLocalizedString } from '../utils/utils';
import SelectingVariant from '../components/SelectingVariant';
import { modalController } from '../context/ModalProvider';
import { getFriends, createGame, invitePlayer } from '../utils/apiWrapper';
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
        const game = await createGame('private');

        if (!game || game.message !== 'GAME_CREATED')
            return;

        await invitePlayer(friendId, game.gameId)

        modalController.closeModal();
        navigate('/play-with-invited', { state: { gameId: game.gameId, isCreator: true } });
    };

    const openInviteFriendModal = () => {
        modalController.createModal({
            title: getLocalizedString(authContext, 'inviteFriends'),
            body: (
                <div className="invite-friends-container">
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
import BottomPanel from '../components/BottomPanel';
import FriendCard from '../components/FriendCard';
import { notificationController } from '../context/NotifyProvider';
import { useAuthorization } from '../hooks/useAuthorization';
import { getFriends } from '../utils/apiWrapper';
import { BOT_URL, getForwardLink } from '../utils/constants';
import { getLocalizedString } from '../utils/utils';
import { FC, memo, MouseEvent, useEffect, useRef, useState } from 'react';
import '../styles/FriendsPage.css';

const FriendsPage: FC = () => {
    const authContext = useAuthorization()

    const [friendsList, setFriendsList] = useState<{username: string, profilePicture: string, scores: number}[]>([])
    const [category, setCategory] = useState<string>('active');
    const activeButtonRef = useRef<HTMLDivElement | null>(null);
    const inactiveButtonRef = useRef<HTMLDivElement | null>(null);

    const fetchFriends = async () => {
        const friendsResults = await getFriends(category);
        console.log(category, friendsResults)
        setFriendsList(friendsResults.friends);
    }

    useEffect(() => {
        fetchFriends()
        if (category == 'active') {
            activeButtonRef.current!.style.border = '1px solid #FFB835';
            activeButtonRef.current!.style.color = 'black';
            inactiveButtonRef.current!.style.border = '1px solid #ADADAD';
            inactiveButtonRef.current!.style.color = '#ADADAD';
        } else {
            inactiveButtonRef.current!.style.border = '1px solid #FFB835';
            inactiveButtonRef.current!.style.color = 'black';
            activeButtonRef.current!.style.border = '1px solid #ADADAD';
            activeButtonRef.current!.style.color = '#ADADAD';
        }

        if (authContext.user?.language == 'ru') {
            activeButtonRef.current!.style.width = '100px';
            activeButtonRef.current!.style.height = '32px';
            const activeSpan = activeButtonRef.current?.firstChild as HTMLDivElement;
            activeSpan.style.lineHeight = '0px';
            inactiveButtonRef.current!.style.width = '100px';
            inactiveButtonRef.current!.style.height = '32px';
            const dormantSpan = inactiveButtonRef.current!.firstChild as HTMLDivElement;
            dormantSpan.style.lineHeight = '0px';

        }
    }, [category]);

    const onClickCopyHandler = (event: MouseEvent<HTMLDivElement>) => {
        const parentElement = event.currentTarget.parentElement;
        if (parentElement) {
            const textToCopy = parentElement.querySelector('span')?.textContent;
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy);
                notificationController.addNotification({
                    message: getLocalizedString(authContext, 'linkCopied'),
                    icon: '../src/resources/assets/copy.svg'
                });
            }
        }
    };

    return (
        <>
            <div className="friends-container">
                <div className="referral-container animated">
                    <span className="referral-title">
                        {getLocalizedString(authContext, 'yourReferralLink')}
                    </span>
                    <div className="invite-buttons" onClick={() => { window.open(getForwardLink(`${BOT_URL}?start=${authContext.user?.userId}`)), '_blank'}}>
                        <span>{getLocalizedString(authContext, 'inviteFriends')}</span>
                    </div>
                    <div className="url-placeholder">
                        <span>{`${BOT_URL}?start=${authContext.user?.userId}`}</span>
                        <div className="copy-button" onClick={(e) => onClickCopyHandler(e)}>
                            <img src="../src/resources/assets/copy.png" alt="copy" />
                        </div>
                    </div>
                </div>
                <div className="friends-list-container animated">
                    <span>{getLocalizedString(authContext, 'friends')}</span>
                    <div className="friends-parameters-buttons">
                        <div className="friends-parameter-button" id="active" onClick={() => setCategory('active')} style={{fontFamily: 'MontserratBold' }} ref={activeButtonRef}>
                            <span>{getLocalizedString(authContext, 'activeFriends')}</span>
                        </div>
                        <div className="friends-parameter-button" id="dormant" onClick={() => setCategory('dormant')} ref={inactiveButtonRef}>
                            <span>{getLocalizedString(authContext, 'dormantFriends')}</span>
                        </div>
                    </div>
                    <div className="friends-list">
                        {friendsList.map((friend, index) => (
                            <FriendCard
                                avatar={friend.profilePicture || '/assets/bot.svg'}
                                nickname={friend.username}
                                scores={friend.scores}
                                key={index}
                            />
                        ))}
                    </div>
                    <div className="friends-darkering" />
                </div>
                <BottomPanel activeVariant="friends" />
            </div>
        </>
    )
};

export default memo(FriendsPage);
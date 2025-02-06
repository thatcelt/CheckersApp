import { createContext, FC, useCallback, useEffect, useMemo, useState, memo } from 'react';
import { AuthorizationContextType } from './types';
import { authorize, connectOnlineSocket, acceptInvite, rejectInvite } from '../utils/apiWrapper';
import { AuthorizeResponseUser } from '../utils/types';
import { modalController } from '../context/ModalProvider';
import { getLocalizedString } from '../utils/utils';
import { useNavigate } from 'react-router-dom';

export const AuthorizationContext = createContext<AuthorizationContextType | undefined>(undefined)

const AuthorizationProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthorizeResponseUser | null>(null);
    const [token, setToken] = useState<string>('')
    const [onlineSocket, setOnlineSocket] = useState<WebSocket | null>(null);
    const navigate = useNavigate();

    const authorizeUser = useCallback(async () => {
        const authorizeResults = await authorize(window.Telegram.WebApp.initData);

        if (!authorizeResults) {
            console.error('Error white authorization');
            return;
        }

        setToken(authorizeResults.accessToken);
        setUser(authorizeResults.user);
    }, []);


    const fetchOnlineSocket = useCallback(() => {
        const connectedSocket = connectOnlineSocket(message => {
            console.log('received new packet', message);
            //if (!user) return;

            switch (message.t) {
                case 'INVITE':
                    console.log('new pending invite', message);
                    modalController.createModal({
                        title: getLocalizedString('en', 'invitesTitle'),
                        message: message.inviterId + ' ' + getLocalizedString('en', 'invitesDescription'),
                        button1: getLocalizedString('en', 'accept'),
                        button2: getLocalizedString('en', 'reject'),
                        onButton1Submit: () => {
                            acceptInvite(message.gameId);
                            navigate('/play-with-invited', { state: { gameId: message.gameId, isCreator: false } });
                            modalController.closeModal();
                        },
                        onButton2Submit: () => {
                            rejectInvite(message.gameId);
                            modalController.closeModal();
                        }
                    })
                    
                    break;

                case 'INVITE_ACCEPTED':
                    console.log('invite accepted', message);
                    break;

                case 'INVITE_REJECTED':
                    console.log('invite rejected', message);
                    break;
            }
        });

        setOnlineSocket(connectedSocket);
    }, []);

    useEffect(() => {
        authorizeUser()
            .then(() => fetchOnlineSocket());
    }, []);

    const authorizationContextValues = useMemo(() => ({user, token, onlineSocket, setUser, setToken, setOnlineSocket}), [user, token, onlineSocket, setUser, setToken, setOnlineSocket]);

    return (
        <AuthorizationContext.Provider value={authorizationContextValues}>
            {children}
        </AuthorizationContext.Provider>
    )
}

export default memo(AuthorizationProvider);
import { createContext, FC, memo, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { OnlineSocketContextType } from './types';
import { acceptInvite, connectOnlineSocket, rejectInvite } from '../utils/apiWrapper';
import { modalController } from './ModalProvider';
import { getLocalizedString } from '../utils/utils';
import { useNavigate } from 'react-router-dom';
import { useAuthorization } from '../hooks/useAuthorization';

export const OnlineSocketContext = createContext<OnlineSocketContextType | undefined>(undefined)

const OnlineSocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [onlineSocket, setOnlineSocket] = useState<WebSocket | null>(null);
    const navigate = useNavigate();
    const authContext = useAuthorization();
    
    const connectOnline = useCallback(() => {
        const connectedSocket = connectOnlineSocket(authContext.token, message => {
            console.log('received new packet', message);

            switch (message.t) {
                case 'INVITE':
                    console.log('new pending invite', message);
                    modalController.createModal({
                        title: getLocalizedString(authContext, 'invitesTitle'),
                        message: message.inviterUsername + ' ' + getLocalizedString(authContext, 'invitesDescription'),
                        button1: getLocalizedString(authContext, 'accept'),
                        button2: getLocalizedString(authContext, 'reject'),
                        onButton1Submit: () => {
                            acceptInvite(message.gameId)
                                .then(result => {
                                    console.log('result', result)
                                    if (!result) return;
                                    navigate('/play-with-invited', { state: { gameId: message.gameId, isCreator: false } });
                                    modalController.closeModal();
                                });
                            
                        },
                        onButton2Submit: () => {
                            rejectInvite(message.gameId);
                            modalController.closeModal();
                        }
                    })
                    
                    break;

                case 'INVITE_NOT_ACCEPTED':
                case 'INVITE_REJECTED':
                    modalController.createModal({
                        title: getLocalizedString(authContext, 'rejectTitle'),
                        message: message.inviterUsername + ' ' + getLocalizedString(authContext, 'rejectDescription')
                    });
                    navigate('/games');
                    break;
            }
        });

        setOnlineSocket(connectedSocket);
    }, []);

    useEffect(() => {
        connectOnline();
    }, [authContext.token]);

    const onlineSocketContextValues = useMemo(() => ({onlineSocket, setOnlineSocket}), [onlineSocket, setOnlineSocket]);

    return (
        <OnlineSocketContext.Provider value={onlineSocketContextValues}>
            {children}
        </OnlineSocketContext.Provider>
    )
}

export default memo(OnlineSocketProvider)
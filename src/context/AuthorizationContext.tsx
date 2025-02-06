import { createContext, FC, useCallback, useEffect, useMemo, useState, memo } from 'react';
import { AuthorizationContextType } from './types';
import { authorize, connectOnlineSocket } from '../utils/apiWrapper';
import { AuthorizeResponseUser } from '../utils/types';

export const AuthorizationContext = createContext<AuthorizationContextType | undefined>(undefined)

const AuthorizationProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthorizeResponseUser | null>(null);
    const [token, setToken] = useState<string>('')
    const [onlineSocket, setOnlineSocket] = useState<WebSocket | null>(null);

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
            console.log(message)
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
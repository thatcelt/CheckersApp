import { createContext, FC, useCallback, useEffect, useMemo, useState, memo } from 'react';
import { AuthorizationContextType } from './types';
import { authorize } from '../utils/apiWrapper';
import { AuthorizeResponseUser } from '../utils/types';

export const AuthorizationContext = createContext<AuthorizationContextType | undefined>(undefined);

const AuthorizationProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthorizeResponseUser | null>(null);
    const [token, setToken] = useState<string>('')

    const authorizeUser = useCallback(async () => {
        const authorizeResults = await authorize(window.Telegram.WebApp.initData);

        if (!authorizeResults) {
            console.error('Error white authorization');
            return;
        }

        setToken(authorizeResults.accessToken);
        setUser(authorizeResults.user);
    }, []);

    useEffect(() => {
        authorizeUser();
    }, []);

    const authorizationContextValues = useMemo(() => ({user, token, setUser, setToken}), [user, token, setUser, setToken]);

    return (
        <AuthorizationContext.Provider value={authorizationContextValues}>
            {children}
        </AuthorizationContext.Provider>
    )
}

export default memo(AuthorizationProvider);
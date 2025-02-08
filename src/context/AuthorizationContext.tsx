import { createContext, FC, useEffect, useMemo, useState, memo, useRef } from 'react';
import { AuthorizationContextType } from './types';
import { authorize, getRatings, getUser } from '../utils/apiWrapper';
import { AuthorizeResponseUser } from '../utils/types';
import { GameHistory } from '../pages/types';

export const AuthorizationContext = createContext<AuthorizationContextType | undefined>(undefined);

const AuthorizationProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthorizeResponseUser | null>(null);
    const [token, setToken] = useState<string>('')
    const [gameHistory, setGameHistory] = useState<GameHistory[] | never[]>([])
    const ratingDataRef = useRef(null)

    const authorizeUser = async () => {
        const authorizeResults = await authorize(window.Telegram.WebApp.initData);
        if (!authorizeResults) {
            console.error('Error white authorization');
            return;
        }
        setToken(authorizeResults.accessToken);
        setUser(authorizeResults.user);
        return authorizeResults.user;
    };
    
    const fetchGameHistory = async (userId: string) => {
        const fetchedUser = await getUser(userId);
        setGameHistory(fetchedUser.gameHistory);
    };

    const fetchRatingData = async () => {
        let result;
    
        try {
            result = await getRatings();
            ratingDataRef.current = result
    
            await new Promise(resolve => setTimeout(() => resolve(true), 2000));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        authorizeUser()
            .then((user) => {
                if (!user) throw new Error("Authorization failed");
                fetchRatingData()
                fetchGameHistory(user.userId);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const authorizationContextValues = useMemo(() => ({ratingDataRef, user, token, gameHistory, setUser, setToken}), [user, token, setUser, setToken]);

    return (
        <AuthorizationContext.Provider value={authorizationContextValues}>
            {children}
        </AuthorizationContext.Provider>
    )
}

export default memo(AuthorizationProvider);
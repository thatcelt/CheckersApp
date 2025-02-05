import { useContext } from 'react';
import { GameContext } from '../context/GameContext';

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context)
        throw new Error('AuthorizationContext must be used within an AuthorizationProvider');
    return context;
}
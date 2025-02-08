import { useContext } from 'react';
import { GameContext } from '../context/GameContext';

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context)
        throw new Error('GameContext must be used within an GameProvider');
    return context;
}
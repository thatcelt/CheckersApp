import { useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context)
        throw new Error('SocketContext must be used within an anus');
    return context;
}
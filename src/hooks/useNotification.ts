import { useContext } from 'react';
import { NotificationContextProps } from '../context/types';
import { NotificationContext } from '../context/NotifyProvider';

export const useNotification = (): NotificationContextProps => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};
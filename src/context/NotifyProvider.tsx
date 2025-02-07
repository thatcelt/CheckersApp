import React, { createContext, useCallback, useState, useEffect, useRef, RefObject } from 'react';
import { NotificationConfig, NotificationContextProps, NotificationProviderProps } from './types';
import '../styles/Notify.css';

export const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const notificationController = {
    addNotification: (config: NotificationConfig) => {
        console.warn('NotificationProvider is not initialized yet.', config);
    },
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [currentNotify, setCurrentNotify] = useState<NotificationConfig | null>(null);
    const [notifications, setNotifications] = useState<NotificationConfig[]>([]);
    const notificationRef = useRef<HTMLElement>(null)

    const addNotification = useCallback((config: NotificationConfig) => {
        setNotifications((queue) => [...queue, {...config, id: Date.now()}]);
    }, []);

    const removeNotification = useCallback((index: Number) => {
        const el = notificationRef.current
        if (el) el.classList.add('notification-closing');
        setNotifications(p => p.filter((_, i) => i !== index));
        setCurrentNotify(null);
    }, []);

    useEffect(() => {
        setTimeout(() => {
            if (!currentNotify) return;
            const el = document.getElementById(`notification-${currentNotify.id}`);
            if (el) el.classList.add('notification-closing');
        
            setTimeout(() => {
                setNotifications(p => p.filter((_, i) => i !== notifications.length-1));
                setCurrentNotify(null);
            }, 500);
        }, 2000);
    }, [currentNotify]);

    useEffect(() => {
        notificationController.addNotification = addNotification;
    }, [addNotification]);

    useEffect(() => {
        if (!currentNotify && notifications.length > 0)
            setCurrentNotify(notifications[0]);
    }, [notifications, currentNotify]);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div className="notifications-container">
                {currentNotify && <div ref={notificationRef as RefObject<HTMLDivElement>} className="notification" id={`notification-${currentNotify.id ? currentNotify.id : 1}`}>
                        {currentNotify.icon && <img src={ currentNotify.icon } className="notification-icon" />}
                        <div className="notification-message">{currentNotify.message}</div>
                        <img src="../src/resources/assets/x.svg" className="notification-close"  onClick={() => removeNotification(currentNotify.id ? currentNotify.id : 1)} />
                    </div>}
            </div>
        </NotificationContext.Provider>
    );
};

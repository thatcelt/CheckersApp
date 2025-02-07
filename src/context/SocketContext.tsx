import { FC, memo, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { createContext } from 'react';
import { GameContextType, SocketContextType } from './types';
import { useGame } from '../hooks/useGame';

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const ws = useRef<WebSocket | null>(null);
    const [ webSocketURI, setWebSocketURI ] = useState<string | null>(null);
    const onMessageHandler = useRef<((socket: WebSocket, gameContext: GameContextType, message: string) => void) | null>(null);
   
    const gameContext = useGame();
    
    useEffect(() => {
        if (!webSocketURI || webSocketURI == null || ws.current) 
            return;

        ws.current = new WebSocket(webSocketURI!);

        ws.current.onopen = () => {
            console.log('Websocket is connected', webSocketURI);
            
        };
    
        ws.current.onerror = error => console.error('WebSocket error:', error);
    
        ws.current.onclose = () => {
            console.log('Websocket is closed');
            clearInterval(webSocketURI);
        };
    
        ws.current.onmessage = (packet) => {
            const message = JSON.parse(packet.data);
            if (onMessageHandler.current)
                onMessageHandler?.current(ws.current!, gameContext, message);     
        };

        return () => {
            ws.current?.close();
        };
    }, [ webSocketURI ]);

    function setOnMessageHandler(handler: (socket: WebSocket, gameContext: GameContextType, message: any) => void) {
        onMessageHandler.current = handler;
    }

    function send(message: any) {
        if (!ws.current)
            return console.error('НЕВОЗМОЖНО отправить сообщение', message);
        ws.current?.send(JSON.stringify(message));
    }

    const socketContextValues = useMemo(() => ({ ws, send, setWebSocketURI, setOnMessageHandler }), []);

    return (
        <SocketContext.Provider value={socketContextValues}>
            {children}
        </SocketContext.Provider>
    )
}

export default memo(SocketProvider);
import { API_URL } from "./constants";
import { AuthorizeResponse, DifficultyType } from './types';

// user routes
export let token: string = '';

export async function authorize(webAppInit: string) : Promise<AuthorizeResponse | null> {
    const response = await fetch(`https://${API_URL}/api/v1/user/authorize?${webAppInit}`,{
        method: 'POST'
    });

    if (response.ok) {
        const data = await response.json();
        token = data.accessToken;
        return data
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
        return null;
    }
}

export async function getUser(userId: string) {
    const response = await fetch(`https://${API_URL}/api/v1/user/getUser/${userId}`, {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    });
    
    if (response.ok) {
        return await response.json()
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
        return null;
    }
}

export async function getRatings() {
    const response = await fetch(`https://${API_URL}/api/v1/user/getRatings`, {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    });

    if (response.ok) {
        return await response.json();
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
        return null;
    }
}

export async function editProfile(editData: {language?: string, username?: string, profilePicture?: string}) {
    const response = await fetch(`https://${API_URL}/api/v1/user/edit`, {
        method: 'PATCH', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify(editData)
    });

    if (response.ok) {
        return await response.json(); 
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
        return null;
    }
}

export async function changeSettings(changeData: { possibleMoves?: boolean, vibration?: boolean }) {
    const response = await fetch(`https://${API_URL}/api/v1/user/changeSettings?${changeData.possibleMoves ? 'possibleMoves=' + changeData.possibleMoves : ''}${changeData.vibration ? '&vibration=' + changeData.vibration : ''}`, {
        method: 'PATCH', 
        headers: {
            'Authorization': token
        }
    });

    if (response.ok) {
        return await response.json();
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
        return null;
    }
}   

export function connectOnlineSocket(onMessage: (message: any) => void) {
    const onlineSocket = new WebSocket(`wss://${API_URL}/api/v1/user/online?token=${token}`);
    let pingInterval: NodeJS.Timeout | undefined
    let pongReceived = true;

    onlineSocket.onopen = () => {
        console.log('Websocket is connected');
        pingInterval = setInterval(() => {
            if (pongReceived) {
                onlineSocket.send(JSON.stringify({ type: 'ping' }));
                pongReceived = false;
            } else {
                console.error('WebSocket heartbeat failed. Closing connection.');
                onlineSocket.close();
            }
        }, 30000);
    };

    onlineSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    onlineSocket.onclose = () => {
        console.log('Websocket is closed');
        clearInterval(pingInterval);
    };

    onlineSocket.onmessage = (packet) => {
        const message = JSON.parse(packet.data);
        onMessage(message);

        if (message.type === 'pong') {
            pongReceived = true;
        }
    };

    return onlineSocket;
}

// game routes

export async function createGameOnOneDevice(): Promise<{ gameId: string } | undefined> {
    const response = await fetch(`https://${API_URL}/api/v1/game/createGameOnOneDevice`, {
        method: 'POST',
        headers: {
            'Authorization': token
        }
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
    }
}

export function connectGameOnOneDevice(gameId: string, onMessage: (message: any) => void) {
    const gameSocket = new WebSocket(`wss://${API_URL}/api/v1/game/oneDevice?gameId=${gameId}&token=${token}`)
    gameSocket.onopen = () => console.log('Websocket is connected');
    gameSocket.onerror = error => console.error('WebSocket error:', error);
    gameSocket.onclose = x => console.log('Websocket is closed', x);
    
    gameSocket.onmessage = packet => {
        const message = JSON.parse(packet.data);
        onMessage(message);
    };

    return gameSocket;
}

export function connectGameSocket(gameId: string, onMessage: (message: any) => void) {
    const gameSocket = new WebSocket(`wss://${API_URL}/api/v1/game?gameId=${gameId}&token=${token}`)
    gameSocket.onopen = () => console.log('Websocket is connected');
    gameSocket.onerror = error => console.error('WebSocket error:', error);
    gameSocket.onclose = x => console.log('Websocket is closed', x);
    
    gameSocket.onmessage = packet => {
        const message = JSON.parse(packet.data);
        onMessage(message);
    };

    return gameSocket;
}

export function connectGameWithBotSocket(gameId: string, onMessage: (message: any) => void) {
    const gameSocket = new WebSocket(`wss://${API_URL}/api/v1/game/vsBot?gameId=${gameId}&token=${token}`)
    gameSocket.onopen = () => console.log('Websocket is connected');
    gameSocket.onclose = x => console.log('Websocket is closed', x);
    gameSocket.onerror = error => console.error('WebSocket error:', error);
    
    gameSocket.onmessage = packet => {
        const message = JSON.parse(packet.data);
        onMessage(message);
    };

    return gameSocket;
}

export async function searchGame() {
    const response = await fetch(`https://${API_URL}/api/v1/game/searchGame`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
    }
}

export async function createGame(gameType: string) {
    const response = await fetch(`https://${API_URL}/api/v1/game/createGame`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({
            'gameType': gameType
        })
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
    }
}

export async function createGameWithBot(difficulty: DifficultyType) {
    const response = await fetch(`https://${API_URL}/api/v1/game/createGameWithBot`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({
            difficulty
        })
    });

    if (response.ok) {
        return await response.json();
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
    }
}

export async function joinGame(gameId: string) {
    const response = await fetch(`https://${API_URL}/api/v1/game/joinGame/${gameId}`, {
        method: 'POST',
        headers: {
            'Authorization': token
        }
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
    }
}

export async function surrender(gameId: string) {
    const response = await fetch(`https://${API_URL}/api/v1/game/surrender/${gameId}`, {
        method: 'POST',
        headers: {
            'Authorization': token
        }
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
    }
}

export async function drawRequest(gameId: string) {
    const response = await fetch(`https://${API_URL}/api/v1/game/drawRequest/${gameId}`, {
        method: 'POST',
        headers: {
            'Authorization': token
        }
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
    }
}

export async function invitePlayer(userId: string, gameId: string) {
    const response = await fetch(`https://${API_URL}/api/v1/game/invitePlayer/${gameId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({
            playerId: userId
        })
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
    }
}

// friends routers

export async function getFriends(state: string) {
    const response = await fetch(`https://${API_URL}/api/v1/friend/getFriends/${state}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
    }
}


export async function addFriend(userId: string) {
    const response = await fetch(`https://${API_URL}/api/v1/friend/addFriend/${userId}`, {
        method: 'POST',
        headers: {
            'Authorization': token
        }
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
    }
}


export async function removeFriend(userId: string) {
    const response = await fetch(`https://${API_URL}/api/v1/friend/removeFriend/${userId}`, {
        method: 'POST',
        headers: {
            'Authorization': token
        }
    })
    if (response.ok) {
        return await response.json()
    } else {
        const errorData = await response.json();
        console.log(`Exception ${errorData.detail}`);
    }
}
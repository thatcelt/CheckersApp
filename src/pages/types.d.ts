export interface UserData {
    username: string;
    registrationDate: string;
    profilePicture: string;
    scores?: number;
}

export interface GameHistory {
    status: string;
    playedDate: string;
}

export interface RatingResponse {
    message: string;
    users: UserData[],
    user: {
        userData: UserData,
        index: number
    }
}
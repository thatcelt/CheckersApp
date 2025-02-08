export interface AuthorizeResponseUser {
    userId: string;
    userTag?: string;
    username: string;
    language: string;
    profilePicture: string;
    registrationDate: string;
    scores: number;
    possibleMoves: boolean;
    vibrationOnTap: boolean;
}

export interface AuthorizeResponse {
    message: string;
    user: AuthorizeResponseUser;
    accessToken: string;
};

export interface LanguageTranslations {
    inviteFailedOffline: string;
    checkersTitle: string;
    friends: string;
    rating: string;
    play: string;
    games: string;
    profile: string;
    playOnline: string;
    playWithFriends: string;
    playWithBot: string;
    selectLevel: string;
    search: string;
    elementaryLevel: string;
    intermediateLevel: string;
    advancedLevel: string;
    noFriends: string;
    registeredSince: string;
    linkCopied: string;
    rematch: string;
    DRAW_ACCEPTED: string;
    statistics: string;
    exitMenu: string;
    soonGames: string;
    changeNickname: string;
    showPossibleMoves: string;
    vibrationDescription: string;
    typeHere: string;
    back: string;
    waitForIt: string;
    on: string;
    off: string;
    invitesTitle: string;
    invitesDescription: string;
    rejectTitle: string;
    inviteFailed: string;
    playerWantsToDraw: string;
    suggestedDraw: string;
    inviteFailedDescription: string;
    rejectDescription: string;
    DRAW_PROPOSED: string;
    PLAYER_SURRENDERED: string;
    OUT_OF_PIECES_OR_HAVE_NO_POSSIBLE_MOVES: string;
    Black: string;
    exitMenuDescription: string;
    White: string;
    YOUR_OPPONENT_NO_POSSIBLE_MOVES_LEFT: string;
    AI_YOU_ARE_NO_POSSIBLE_MOVES: string;
    ok: string;
    numberOfGames: string;
    resultsTitle: string;
    winner: string;
    gameHistory: string;
    lastUpdate: string;
    noGamesPlayed: string;
    OPPONENT_DISCONNECTED: string;
    won: string;
    areYouHere: string;
    lost: string;   
    draw: string;
    DRAW: string;
    WIN: string;
    LOSS: string;
    lastUpdateWas: string;
    currentRating: string;
    competitorRating: string;
    yourReferralLink: string;
    inviteFriends: string;
    activeFriends: string;
    dormantFriends: string;
    invites: string;
    settings: string;
    possibleMoves: string;
    vibration: string;
    applicationLanguage: string;
    termsOfUse: string;
    privacyPolicy: string;
    rulesOfTheGame: string;
    contactSupport: string;
    exitToMenu: string;
    areYouSureExit: string;
    yes: string;
    no: string;
    giveUp: string;
    areYouSureGiveUp: string;
    loseAllPoints: string;
    cancel: string;
    confirm: string;
    suggestDraw: string;
    areYouSureDraw: string;
    accept: string;
    reject: string;
    choosePlayType: string;
    chooseLanguage: string;
    playOnOneDevice: string;
    inviteFriend: string;
}
  
export interface Translations {
    en: LanguageTranslations;
    ru: LanguageTranslations;
    ua: LanguageTranslations;
}

export enum Piece { EMPTY = 0, WHITE_PIECE = 1, BLACK_PIECE = 2, WHITE_KING = 3, BLACK_KING = 4, SELECT = 9 };
export type Position = [number, number];
export enum Turn { White = 1, Black = 2 };
export type Move = [Position, Position];
export const BOARD_SIZE = 8;
export enum DifficultyType { EASY = 0, MEDIUM = 1, HARD = 2 };
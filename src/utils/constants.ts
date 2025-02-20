import { PlayerData } from '../context/types';

export const API_URL = '';
export const SUPPORT_URL = '';
export const BOT_URL = ''

export const getForwardLink = (referralLink: string) => { return `https://telegram.me/share/url?url=${referralLink}&text=sometext` }

export const EMPTY_BOARD = [
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0]
]
export const DESK_MATRIX: number[][] = [
    [0, 1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 21, 22, 23],
    [24, 25, 26, 27, 28, 29, 30, 31],
    [32, 33, 34, 35, 36, 37, 38, 39],
    [40, 41, 42, 43, 44, 45, 46, 47],
    [48, 49, 50, 51, 52, 53, 54, 55],
    [56, 57, 58, 59, 60, 61, 62, 63],
];

export const BLACK_POSITIONS = [1, 3, 5, 7, 8, 10, 12, 14, 17, 19, 21, 23]
export const WHITE_POSITIONS = [40, 42, 44, 46, 49, 51, 53, 55, 56, 58, 60, 62]

export const WHITE_CELLS = [
    0, 2, 4, 6,
    9, 11, 13, 15,
    16, 18, 20, 22,
    25, 27, 29, 31,
    32, 34, 36, 38,
    41, 43, 45, 47,
    48, 50, 52, 54,
    57, 59, 61, 63
]

export const BOT_PLAYER_DATA: PlayerData = {
    nickname: 'Bot',
    avatar: '../../public/bot.svg',
    type: 'bot',
    objectId: '2'
}
export const RIGHT_BACKLIGHTS = new Map()
    .set('black', 2)
    .set('white', 1)

export const WHITE_CHIP_IMAGE = "../../public/whitechip.png"
export const BLACK_CHIP_IMAGE = "../../public/blackchip.png"
export const WHITE_KING_IMAGE = "../../public/whiteking.png"
export const BLACK_KING_IMAGE = "../../public/blackking.png"
export const MOVE_IMAGE = "../../public/move.png"
export const EMPTY_IMAGE = "../../public/empty.png"
export const TERMS = new Map<string, Promise<{title: string, content: {title: string, description: string}[]}>>()
    .set('ua', import('../resources/locales/ua_terms.json'))
    .set('ru', import('../resources/locales/ru_terms.json'))
    .set('en', import('../resources/locales/en_terms.json'))
export const PRIVACY_POLICY = new Map<string, Promise<{title: string, content: {title: string, description: string}[]}>>()
    .set('ua', import('../resources/locales/ua_privacy.json'))
    .set('ru', import('../resources/locales/ru_privacy.json'))
    .set('en', import('../resources/locales/en_privacy.json'))
export const RULES = new Map<string, Promise<{title: string, content: {title: string, description: string}[]}>>()
    .set('ua', import('../resources/locales/ua_rules.json'))
    .set('ru', import('../resources/locales/ru_rules.json'))
    .set('en', import('../resources/locales/en_rules.json'))
export const LANGUAGES = new Map()
    .set('en', 'English')
    .set('ru', 'Русский')
    .set('ua', 'Українська')

export const CHIPS_KEYFRAMES = [
    { transform: 'scale(0.4)' },
    { transform: 'scale(1.2)' },
    { transform: 'scale(1.0)' } 
]

export const CHIPS_ANIMATION_OPTIONS: KeyframeAnimationOptions = {
    duration: 900, 
    easing: 'cubic-bezier(0.25, 1, 0.3, 1)',
    fill: 'forwards'
}

export const LAZY_COMPONENTS = [
    () => import('../pages/PreLoadingPage.tsx'),
    () => import('../pages/LevelSelectingPage.tsx'),
    () => import('../pages/GamesPage.tsx'),
    () => import('../pages/GameSelectingPage'),
    () => import('../pages/GameOnlinePage.tsx'),
    () => import('../pages/GameOnOneDevicePage.tsx'),
    () => import('../pages/GameWithBotPage.tsx'),
    () => import('../pages/GameWithInvitedPage.tsx'),
    () => import('../pages/ProfilePage.tsx'),
    () => import('../pages/RatingPage.tsx'),
    () => import('../pages/FriendsPage.tsx'),
    () => import('../pages/SettingsPage.tsx')
];

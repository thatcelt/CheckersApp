import { FC, memo, useMemo } from 'react';
import { getLocalizedString } from '../utils/utils';
import { useAuthorization } from '../hooks/useAuthorization';

const ProfileStatistics: FC<{ playedGames: { status: string, playedDate: string }[] }> = ({ playedGames }) => {
    const authContext = useAuthorization();
    
    const getLastUpdateDate = (history: any[]) => {
        if (history.length == 0) return getLocalizedString(authContext, 'noGamesPlayed');

        const lastGame = playedGames.reduce((latest: any, game: any) => {
            return new Date(Number(game.playedDate)) > new Date(Number(latest.playedDate)) ? game : latest;
        }, playedGames[0]);

        return `${getLocalizedString(authContext, 'lastUpdate')} ${new Date(Number(lastGame.playedDate))
            .toLocaleDateString('ru-RU', { month: '2-digit', day: '2-digit', year: 'numeric' })
            .replace(/\./g, "/")}`;
    };
    
    const wins = useMemo(() => playedGames.filter(value => value.status == 'WIN').length, [playedGames]);
    const losses = useMemo(() => playedGames.filter(value => value.status == 'LOSS').length, [playedGames]);
    const draws = useMemo(() => playedGames.filter(value => value.status == 'DRAW').length, [playedGames]);

    return (
        <div className="profile-statistics animated">
            <div className="statistics-title">{getLocalizedString(authContext, 'statistics')}</div>
            <div className="statistics-list">
                <div className="statistics-position">
                    {getLocalizedString(authContext, 'numberOfGames')}
                    <span>{playedGames.length}</span>
                </div>
                <div className="statistics-position">
                    {getLocalizedString(authContext, 'won')}
                    <span>{wins}</span>
                </div>
                <div className="statistics-position">
                    {getLocalizedString(authContext, 'lost')}
                    <span>{losses}</span>
                </div>
                <div className="statistics-position">
                    {getLocalizedString(authContext, 'DRAW')}
                    <span>{draws}</span>
                </div>
            </div>
            <div className="last-update-container">
                <div className="last-update">{getLastUpdateDate(playedGames)}</div>
            </div>
        </div>
    )
}

export default memo(ProfileStatistics);
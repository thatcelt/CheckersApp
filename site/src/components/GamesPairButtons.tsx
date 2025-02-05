import { FC, memo } from 'react';
import { getLocalizedString } from '../utils/utils';
import { NavigateFunction } from 'react-router-dom';
import { AuthorizationContextType } from '../context/types';

const GamesPairButtons: FC<{ navigate: NavigateFunction, authContext: AuthorizationContextType }> = ({ navigate, authContext }) => {
    return (
        <>
            <div className="pair-buttons">
                <div
                    className="under-button animated"
                    onClick={() => navigate('/select-play-type')}
                    style={ authContext.user?.language == 'ua' ? { letterSpacing: '1.5px' } : {}}
                >
                    {getLocalizedString(authContext, 'playWithFriends')}
                </div>
                <div
                    className="under-button animated" onClick={() => navigate('/select-level')}>
                    {getLocalizedString(authContext, 'playWithBot')}
                </div>
        </div>
        </>
    )
};

export default memo(GamesPairButtons);
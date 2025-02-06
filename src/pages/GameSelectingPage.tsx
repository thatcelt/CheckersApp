import { FC, memo } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuthorization } from '../hooks/useAuthorization';
import '../styles/VariantsSelecting.css';
import BottomPanel from '../components/BottomPanel';
import { getLocalizedString } from '../utils/utils';
import SelectingVariant from '../components/SelectingVariant';

const GameSelectingPage: FC = () => {
    const navigate = useNavigate()
    const authContext = useAuthorization()
    
    return (
        <>
            <div className="variants-selecting-container">
                <span>{getLocalizedString(authContext, 'selectLevel')}</span>
                <SelectingVariant title={getLocalizedString(authContext, 'playOnOneDevice')} onSubmit={() => navigate('/game-on-one-device')}/>
                <SelectingVariant title={getLocalizedString(authContext, 'inviteFriend')} onSubmit={() => navigate('/game-with-bot/medium')}/>
                <BottomPanel activeVariant="games" />
            </div>
            <div className="games-shining" />
        </>
    )
};

export default memo(GameSelectingPage);
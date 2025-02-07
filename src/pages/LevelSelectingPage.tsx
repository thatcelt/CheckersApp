import { FC, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthorization } from '../hooks/useAuthorization';
import '../styles/VariantsSelecting.css';
import BottomPanel from '../components/BottomPanel';
import { getLocalizedString } from '../utils/utils';
import SelectingVariant from '../components/SelectingVariant';

const LevelSelectingPage: FC = () => {
    const navigate = useNavigate();
    const authContext = useAuthorization();
    return (
        <>
            <div className="variants-selecting-container">
                <span>{getLocalizedString(authContext, 'selectLevel')}</span>
                <SelectingVariant title={getLocalizedString(authContext, 'elementaryLevel')} onSubmit={() => navigate('/game-with-bot/easy')}/>
                <SelectingVariant title={getLocalizedString(authContext, 'intermediateLevel')} onSubmit={() => navigate('/game-with-bot/medium')}/>
                <SelectingVariant title={getLocalizedString(authContext, 'advancedLevel')} onSubmit={() => navigate('/game-with-bot/hard')}/>
                <BottomPanel activeVariant="games" />
            </div>
            <div className="games-shining" />
        </>
    )
};

export default memo(LevelSelectingPage);
import { FC } from 'react';
import { useAuthorization } from '../hooks/useAuthorization';
import { getLocalizedString } from '../utils/utils';
import { LanguageTranslations } from '../utils/types';

const BottomPanelButton: FC<{ name: keyof LanguageTranslations, icon: string, onClick: (event: any) => void }> = ({ name, icon, onClick }) => {
    const authContext = useAuthorization();

    return (
        <>
        <div className="variant" id={name} onClick={(e) => onClick(e)}>
            <img src={`../src/resources/assets/${icon}.png`} />
            <span>{getLocalizedString(authContext, name)}</span>
        </div>
        </>
    )
}

export default BottomPanelButton
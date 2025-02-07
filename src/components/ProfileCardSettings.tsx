import { FC, memo } from 'react';
import { formatDate, getLocalizedString } from '../utils/utils';
import { useAuthorization } from '../hooks/useAuthorization';
import { ProfileCardSettingsProps } from '../props/profileCardSettingsProps';
import { modalController } from '../context/ModalProvider';
import { editProfile } from '../utils/apiWrapper';
import '../styles/PlayerCard.css';

const ProfileCardSettings: FC<ProfileCardSettingsProps> = ({ username, profilePicture, registrationDate }) => {
    const authContext = useAuthorization()

    const openChangeUsername = () => {
        modalController.createModal({
            title: getLocalizedString(authContext, 'changeNickname'),
            message: getLocalizedString(authContext, 'typeHere'),
            button1: getLocalizedString(authContext, 'ok'),
            button2: getLocalizedString(authContext, 'cancel'),
            messageAsInput: true,
            maxInputLength: 12,
            onButton1Submit: async (newNickname) => {
                if (newNickname?.length == 0) return;
                await editProfile({ username: newNickname });
                authContext.setUser({ ...authContext.user!, username: newNickname! });
            }
        })
    }

    return (
        <>
        <div className="profile-container" style={{ marginTop: "50px" }}>
            <div className="profile-card animated" style={{width: "365px"}}>
                <img
                    src={profilePicture}
                    alt="Profile Avatar"
                    className="profile-avatar"
                />
                <div className="profile-info">
                    <span className="profile-info-nickname">{username}</span>
                    <span className="profile-info-username">{username}</span>
                    <span className="profile-info-date">
                        {getLocalizedString(authContext, 'registeredSince')} {formatDate(new Date(Number(registrationDate))).date || 'N/A'}
                    </span>
                </div>
                <div className="edit-profile-button" onClick={openChangeUsername}>
                    <img src="../src/resources/assets/edit.png" alt="Edit" />
                </div>
            </div>
        </div>
        </>
    )
};

export default memo(ProfileCardSettings);
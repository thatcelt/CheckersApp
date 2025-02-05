import { FC, memo } from "react";
import { useAuthorization } from "../hooks/useAuthorization";
import { getLocalizedString } from "../utils/utils";

const ProfileCard: FC<{ profilePicture?: string, nickname?: string, username?: string, registrationDate?: string }> = ({profilePicture, nickname, username, registrationDate}) => {
    const authContext = useAuthorization()

    return (
        <div className="profile-card animated">
            <img
                src={profilePicture}
                alt="User Avatar"
                className="profile-avatar"
            />
            <div className="profile-info">
                <span className="profile-info-nickname">{nickname}</span>
                <span className="profile-info-username">{username}</span>
                <span className="profile-info-date">
                    {getLocalizedString(authContext, 'registeredSince')} {new Date(Number(registrationDate!)).toLocaleDateString('ru-RU')}
                </span>
            </div>
        </div>
    )
}

export default memo(ProfileCard);
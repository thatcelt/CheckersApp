import { FC, memo, useCallback, useEffect, useState } from "react"
import BottomPanel from "../components/BottomPanel"
import { getLocalizedString } from "../utils/utils"
import { LANGUAGES, PRIVACY_POLICY, RULES, SUPPORT_URL, TERMS } from "../utils/constants"
import { useAuthorization } from "../hooks/useAuthorization"
import { useNavigate } from "react-router-dom"
import ProfileCardSettings from "../components/ProfileCardSettings"
import SettingsCard from "../components/SettingsCard"
import '../styles/SettingsPage.css'
import { modalController } from "../context/ModalProvider"
import { LanguageTranslations } from "../utils/types"
import { changeSettings, editProfile } from "../utils/apiWrapper"

const SettingsPage: FC = () => {
    const authContext = useAuthorization()
    const navigate = useNavigate()
    const [language, setLanguage] = useState<string | undefined>(authContext.user?.language)
    const panelContainer = document.querySelector(".panel-container") as HTMLDivElement

    useEffect(() => {
        setLanguage(LANGUAGES.get(authContext.user?.language))
    }, [authContext.user?.language])

    const openDocsModal = (docsLocales: Map<string, Promise<{title: string, content: {title: string, description: string}[]}>>) => {
        const currentLocale = docsLocales.get(authContext.user!.language)
        let message: string = ""
        let title: string
        
        currentLocale?.then(fileContent => {
            title = fileContent.title
            fileContent.content.forEach(element => {
                message = message + `<b>${element.title}</b>: ${element.description}<br><br>`
            })
        }).then(() => {
            modalController.createModal({
                type: 'info',
                title: getLocalizedString(authContext, title as keyof LanguageTranslations),
                message: message
            });
        })
    }

    const changePossibleMovesModal = useCallback(() => {
        modalController.createModal({
            title: getLocalizedString(authContext, "possibleMoves"),
            message: getLocalizedString(authContext, "showPossibleMoves"),
            button1: getLocalizedString(authContext, "on"),
            button2: getLocalizedString(authContext, "off"),
            onButton1Submit: async () => {
              await changeSettings({ possibleMoves: true }) 
              authContext.setUser({
                    ...authContext.user!,
                    possibleMoves: true
              })
            },
            onButton2Submit: async () => {
                await changeSettings({ possibleMoves: false }) 
                authContext.setUser({
                    ...authContext.user!,
                    possibleMoves: false
                })
            },
            activeButton: authContext.user?.possibleMoves ? 1 : 2
        });
    }, [authContext.user?.possibleMoves])

    const changeVibrationOnTapModal = useCallback(() => {
        modalController.createModal({
            title: getLocalizedString(authContext, "vibration"),
            message: getLocalizedString(authContext, "vibrationDescription"),
            button1: getLocalizedString(authContext, "on"),
            button2: getLocalizedString(authContext, "off"),
            onButton1Submit: async () => {
                await changeSettings({ vibration: true }) 
                authContext.setUser({
                        ...authContext.user!,
                        vibrationOnTap: true
                })
            },
            onButton2Submit: async () => {
                await changeSettings({ vibration: false }) 
                authContext.setUser({
                        ...authContext.user!,
                        vibrationOnTap: false
                })
            },
            activeButton: authContext.user?.vibrationOnTap ? 1 : 2
        });
    }, [authContext.user?.vibrationOnTap])

    const changeLanguageModal = useCallback(() => {
        modalController.createModal({
            title: getLocalizedString(authContext, "chooseLanguage"),
            message: "",
            button1: "English",
            button2: "Русский",
            button3: "Українська",
            onButton1Submit: async () => {
                await editProfile({ language: 'en' })
                panelContainer.style.fontSize = "8px"
                authContext.setUser({
                    ...authContext.user!,
                    language: 'en'
                })
                setLanguage("English")

            },
            onButton2Submit: async () => {
                await editProfile({ language: 'ru' })
                panelContainer.style.fontSize = "8px"
                authContext.setUser({
                    ...authContext.user!,
                    language: 'ru'
                })
                setLanguage("Русский")
            },
            onButton3Submit: async () => {
                await editProfile({ language: 'ua' })
                authContext.setUser({
                    ...authContext.user!,
                    language: 'ua'
                })
                panelContainer.style.fontSize = "8px"
                setLanguage("Українська")
            },
            activeButton: (() => {
                if (authContext.user?.language === "ru") return 2;
                if (authContext.user?.language === "ua") return 3;
                return 1;
            })()
        });
    }, [authContext.user?.language])

    return (
        <>
        <div className="settings-buttons-container">
            <div className="back-button" onClick={() => navigate("/profile")}>
                <img src="../src/resources/assets/backarrow.png" alt="Back" />
                <span>{getLocalizedString(authContext, "back")}</span> {/* Localized */}
            </div>
        </div>
        <ProfileCardSettings username={authContext.user?.username} registrationDate={authContext.user?.registrationDate} profilePicture={authContext.user?.profilePicture}/>
        <div className="settings-container">
            <div className="settings-block animated">
                <span>{getLocalizedString(authContext, "settings")}</span>
                <div className="settings-cards-list">
                    <SettingsCard textArea={getLocalizedString(authContext, "possibleMoves")} textEnd={getLocalizedString(authContext, authContext.user?.possibleMoves ? "on" : "off")} onClick={() => {changePossibleMovesModal()}}/>
                    <SettingsCard textArea={getLocalizedString(authContext, "vibration")} textEnd={getLocalizedString(authContext, authContext.user?.vibrationOnTap ? "on" : "off")} onClick={() => {changeVibrationOnTapModal()}}/>
                    <SettingsCard textArea={getLocalizedString(authContext, 'applicationLanguage')} textEnd={language} onClick={() => {changeLanguageModal()}}/>
                    <SettingsCard textArea={getLocalizedString(authContext, "termsOfUse")} onClick={() => {openDocsModal(TERMS)}}/>
                    <SettingsCard textArea={getLocalizedString(authContext, "privacyPolicy")} onClick={() => {openDocsModal(PRIVACY_POLICY)}}/>
                    <SettingsCard textArea={getLocalizedString(authContext, "rulesOfTheGame")} onClick={() => {openDocsModal(RULES)}}/>
                    <SettingsCard textArea={getLocalizedString(authContext, "contactSupport")} onClick={() => {window.location.replace(SUPPORT_URL)}}/>
                </div>
            </div>
            <BottomPanel activeVariant="profile" />
        </div>
        <div className="shining" />
        </>
    )
}

export default memo(SettingsPage)
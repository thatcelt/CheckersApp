import React, { createContext, useState, useCallback, ReactNode } from 'react';
import '../styles/Modal.css'
import { ModalConfig, ModalContextProps } from './types';
import { useModal } from '../hooks/useModal';

export const ModalContext = createContext<ModalContextProps | undefined>(undefined);

// Глобальный контроллер для вызова модалок
export const modalController = {
    createModal: (modalConfig: ModalConfig) => {
        console.warn('ModalProvider is not initialized yet.', modalConfig);
    },

    closeModal: () => {
        console.warn('ModalProvider is not initialized yet.');
    }
};

interface ModalProviderProps {
    children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const [modalQueue, setModalQueue] = useState<ModalConfig[]>([]);
    const [currentModal, setCurrentModal] = useState<ModalConfig | null>(null);

    const createModal = useCallback((modalConfig: ModalConfig) => {
        setModalQueue((queue) => [...queue, modalConfig]);
    }, []);

    const closeModal = useCallback(() => {
        setModalQueue((queue) => queue.slice(1));
        setCurrentModal(null);
    }, []);

    React.useEffect(() => {
        if (!currentModal && modalQueue.length > 0)
            setCurrentModal(modalQueue[0]);
    }, [modalQueue, currentModal]);

    React.useEffect(() => {
        modalController.createModal = createModal;
        modalController.closeModal = closeModal;
    }, [createModal, closeModal]);

    return (
        <ModalContext.Provider value={{ createModal, closeModal }}>
            {children}
            {currentModal && <Modal {...currentModal} />}
        </ModalContext.Provider>
    );
};

const Modal: React.FC<ModalConfig> = ({ type = 'default', title, message, body = undefined, hideButtons = false, button1 = 'OK', button2 = undefined, button3 = undefined, onButton1Submit, onButton2Submit, onButton3Submit, activeButton, messageAsInput = false, maxInputLength = 32 }) => {
    const { closeModal } = useModal();
    const [inputValue, setInputValue] = useState<string>('');

    const handleButton1Click = () => {
        if (onButton1Submit) onButton1Submit(messageAsInput && inputValue.length >= 1 ? inputValue : undefined);
        closeModal();
    }

    const handleButton2Click = () => {
        if (onButton2Submit) onButton2Submit(messageAsInput && inputValue.length >= 1 ? inputValue : undefined);
        closeModal();
    }

    const handleButton3Click = () => {
        if (onButton3Submit) onButton3Submit(messageAsInput && inputValue.length >= 1 ? inputValue : undefined);
        closeModal();
    }

    const closeModalHandler = () => {
        if (type != "websocket") closeModal()
    }

    const getBtnStyle = (n: number, activeButton?: number) => {
        if (!activeButton)
            return {
                border: '1px solid #FFB835',
                marginBottom: "5px",
                width: button3 ? "95px" : "",
                maxWidth: button3 || messageAsInput ? "95px" : "",
            };

        const isActive = n == activeButton;
        
        return {
            border: isActive ? '1px solid #FFB835' : '1px solid rgba(4, 4, 4, 0.3)',
            marginBottom: "5px",
            width: button3 ? "95px" : "",
            maxWidth: button3 ? "95px" : ""
        };
    };

    return (
        <div className="modal-container">
            <div className="modal-overlay" onClick={() => closeModalHandler()}/>
            <div className="modal-body" style={ type == 'info' ? {
                height: '70%',
                maxHeight: '70vh',
                maxWidth: '600px', 
                width: '80%',
                overflowY: 'auto',
            } : {
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <span style={type == "info" ? {textAlign: "center", marginBottom: "20px"} : {fontFamily: "MontserratSemiBold", textAlign: "center"}}>{title}</span>
                
                { body ? (
                    <div className="modal-body-content">{body}</div> // Рендерим переданный JSX
                ) : type === 'info' ? (
                    <div className="modal-text-container">
                        <p
                            dangerouslySetInnerHTML={{ __html: message }} // Использование dangerouslySetInnerHTML
                        />
                    </div>
                ) : messageAsInput ? (
                    <input maxLength={maxInputLength} placeholder={message} value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="modal-input" style={{marginTop: "10px"}}/>
                ) : (
                    <div className="modal-description" style={message == "" ? {margin: "0px"} : {}} dangerouslySetInnerHTML={{ __html: message }}></div>
                )}

                { !hideButtons &&
                    <div className="modal-buttons-container" style={button3 ? {flexDirection: "column"} : {}}>
                        <div className="modal-button" style={getBtnStyle(1, activeButton)} onClick={ handleButton1Click }>
                            { button1 }
                        </div>
                        {
                            button2 ? 
                            <div className="modal-button" style={ getBtnStyle(2, activeButton)} onClick={ handleButton2Click }>
                                { button2 }
                            </div>
                            : ''
                        }
                        {
                            button3 ? 
                            <div className="modal-button" style={ getBtnStyle(3, activeButton)} onClick={ handleButton3Click }>
                                { button3 }
                            </div>
                            : ''
                        }
                    </div>
                }
            </div>
        </div>
    );
};

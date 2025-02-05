import { useContext } from 'react';
import { AuthorizationContext } from '../context/AuthorizationContext';

export const useAuthorization = () => {
    const context = useContext(AuthorizationContext);
    if (!context)
        throw new Error('AuthorizationContext must be used within an AuthorizationProvider');
    return context;
}
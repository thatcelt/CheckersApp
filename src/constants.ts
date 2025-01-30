export const jwtTokenErrors = {
    badRequestErrorMessage: 'BAD_REQUEST_ERROR',
    badCookieRequestErrorMessage: 'BAD_COOKIE_REQUEST_ERROR',
    noAuthorizationInHeaderMessage: 'UNAUTHORIZED',
    noAuthorizationInCookieMessage: 'UNAUTHORIZED',
    authorizationTokenExpiredMessage: 'TOKEN_HAS_EXPIRED',
    authorizationTokenUntrusted: 'TOKEN_HAS_UNTRUSTED',
    authorizationTokenUnsigned: 'TOKEN_HAS_UNSIGNED',
    authorizationTokenInvalid: (error: any) => {
        return error.message
    }
}
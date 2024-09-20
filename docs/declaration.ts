import { passwordResetDocs, passwordResetRequestEmailDocs, registerDocs, resendVerificationEmailDocs, verifyEmailDocs } from "./auth"
import { siteDetailDocs } from "./general"

export const SWAGGER_PATHS = {
    '/general/site-detail': siteDetailDocs,
    '/auth/register': registerDocs,
    '/auth/verify-email': verifyEmailDocs,
    '/auth/resend-verification-email': resendVerificationEmailDocs,
    '/auth/send-password-reset-otp': passwordResetRequestEmailDocs,
    '/auth/set-new-password': passwordResetDocs,

}
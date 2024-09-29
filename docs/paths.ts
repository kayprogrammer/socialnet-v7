import { loginDocs, logoutDocs, passwordResetDocs, passwordResetRequestEmailDocs, refreshTokenDocs, registerDocs, resendVerificationEmailDocs, verifyEmailDocs } from "./auth"
import { commentsDocs, commentsWithRepliesDocs, postDetailDocs, postsDocs, reactionsDocs } from "./feed"
import { siteDetailDocs } from "./general"

export const SWAGGER_PATHS = {
    '/general/site-detail': siteDetailDocs,
    '/auth/register': registerDocs,
    '/auth/verify-email': verifyEmailDocs,
    '/auth/resend-verification-email': resendVerificationEmailDocs,
    '/auth/send-password-reset-otp': passwordResetRequestEmailDocs,
    '/auth/set-new-password': passwordResetDocs,
    '/auth/login': loginDocs,
    '/auth/refresh': refreshTokenDocs,
    '/auth/logout': logoutDocs,

    "/feed/posts": postsDocs,
    "/feed/posts/{slug}": postDetailDocs,
    "/feed/posts/{slug}/comments": commentsDocs,
    "/feed/comments/{slug}": commentsWithRepliesDocs,
    "/feed/reactions/{slug}": reactionsDocs,
}
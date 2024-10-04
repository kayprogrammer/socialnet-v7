import { loginDocs, logoutDocs, passwordResetDocs, passwordResetRequestEmailDocs, refreshTokenDocs, registerDocs, resendVerificationEmailDocs, verifyEmailDocs } from "./auth"
import { commentsDocs, commentsWithRepliesDocs, postDetailDocs, postsDocs, reactionsDocs, replyDocs } from "./feed"
import { siteDetailDocs } from "./general"
import { citiesDocs, friendsDocs, profileDocs, profileModifyDocs, profilesDocs } from "./profiles"

export const SWAGGER_PATHS = {
    // General routes
    '/general/site-detail': siteDetailDocs,

    // Auth routes
    '/auth/register': registerDocs,
    '/auth/verify-email': verifyEmailDocs,
    '/auth/resend-verification-email': resendVerificationEmailDocs,
    '/auth/send-password-reset-otp': passwordResetRequestEmailDocs,
    '/auth/set-new-password': passwordResetDocs,
    '/auth/login': loginDocs,
    '/auth/refresh': refreshTokenDocs,
    '/auth/logout': logoutDocs,

    // Feed routes
    "/feed/posts": postsDocs,
    "/feed/posts/{slug}": postDetailDocs,
    "/feed/posts/{slug}/comments": commentsDocs,
    "/feed/comments/{slug}": commentsWithRepliesDocs,
    "/feed/replies/{slug}": replyDocs,
    "/feed/reactions/{slug}": reactionsDocs,

    // Profile routes
    "/profiles": profilesDocs,
    "/profiles/cities": citiesDocs,
    "/profiles/profile/{username}": profileDocs,
    "/profiles/profile": profileModifyDocs,
    "/profiles/friends": friendsDocs,
}
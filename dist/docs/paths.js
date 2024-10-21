"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SWAGGER_PATHS = void 0;
const auth_1 = require("./auth");
const chats_1 = require("./chats");
const feed_1 = require("./feed");
const general_1 = require("./general");
const profiles_1 = require("./profiles");
exports.SWAGGER_PATHS = {
    // General routes
    '/general/site-detail': general_1.siteDetailDocs,
    // Auth routes
    '/auth/register': auth_1.registerDocs,
    '/auth/verify-email': auth_1.verifyEmailDocs,
    '/auth/resend-verification-email': auth_1.resendVerificationEmailDocs,
    '/auth/send-password-reset-otp': auth_1.passwordResetRequestEmailDocs,
    '/auth/set-new-password': auth_1.passwordResetDocs,
    '/auth/login': auth_1.loginDocs,
    '/auth/refresh': auth_1.refreshTokenDocs,
    '/auth/logout': auth_1.logoutDocs,
    // Feed routes
    "/feed/posts": feed_1.postsDocs,
    "/feed/posts/{slug}": feed_1.postDetailDocs,
    "/feed/posts/{slug}/comments": feed_1.commentsDocs,
    "/feed/comments/{slug}": feed_1.commentsWithRepliesDocs,
    "/feed/replies/{slug}": feed_1.replyDocs,
    "/feed/reactions/{slug}": feed_1.reactionsDocs,
    // Profile routes
    "/profiles": profiles_1.profilesDocs,
    "/profiles/cities": profiles_1.citiesDocs,
    "/profiles/profile/{username}": profiles_1.profileDocs,
    "/profiles/profile": profiles_1.profileModifyDocs,
    "/profiles/friends": profiles_1.friendsDocs,
    "/profiles/friends/requests": profiles_1.friendRequestsDocs,
    "/profiles/notifications": profiles_1.notificationsDocs,
    // Chat routes
    "/chats": chats_1.chatsDocs,
    "/chats/{id}": chats_1.messagesDocs,
    "/chats/messages/{id}": chats_1.messageDocs,
    "/chats/groups/group": chats_1.groupCreateDocs
};
//# sourceMappingURL=paths.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeReaction = exports.addOrUpdateReaction = exports.getPostOrComment = void 0;
const feed_1 = require("../models/feed");
const users_1 = require("./users");
const getPostOrComment = async (slug) => {
    const post = await feed_1.Post.findOne({ slug }).populate((0, users_1.shortUserPopulation)("reactions.user"));
    const comment = !post ? await feed_1.Comment.findOne({ slug }).populate((0, users_1.shortUserPopulation)("reactions.user")) : null;
    return post || comment;
};
exports.getPostOrComment = getPostOrComment;
const addOrUpdateReaction = async (postOrComment, userId, rType) => {
    // Check if the user already has a reaction
    let reactionData = postOrComment.reactions.find(reaction => reaction.user.toString() === userId.toString());
    if (reactionData) {
        reactionData.rType = rType;
    }
    else {
        reactionData = { rType, user: userId };
        postOrComment.reactions.push(reactionData);
    }
    await postOrComment.save();
    return reactionData;
};
exports.addOrUpdateReaction = addOrUpdateReaction;
const removeReaction = async (postOrComment, userId) => {
    const index = postOrComment.reactions.findIndex(reaction => reaction.user.toString() === userId.toString());
    const isRemovable = index !== -1;
    if (isRemovable) {
        postOrComment.reactions.splice(index, 1);
        await postOrComment.save();
    }
    return isRemovable; // Indicates whether it was removed or not
};
exports.removeReaction = removeReaction;
//# sourceMappingURL=feed.js.map
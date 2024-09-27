import { Types } from "mongoose";
import { Comment, IComment, IPost, Post } from "../models/feed";

const getPostOrComment = async (slug: string): Promise<IPost | IComment | null> => {
    const post = await Post.findOne({ slug })
    let comment = null
    if (!post) comment = await Comment.findOne({ slug })
    return post || comment
}

const addOrUpdateReaction = async (postOrComment: IPost | IComment, userId: Types.ObjectId, rType: string): Promise<{ rType: string; userId: Types.ObjectId }> => {
  // Check if the user already has a reaction
  let reactionData = postOrComment.reactions.find(reaction => reaction.userId.toString() === userId.toString());
  if (reactionData) {
    reactionData.rType = rType;
  } else {
    reactionData = { rType, userId }
    postOrComment.reactions.push(reactionData);
  }
  await postOrComment.save();
  return reactionData
}

export { getPostOrComment, addOrUpdateReaction }
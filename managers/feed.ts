import { Types } from "mongoose";
import { Comment, IComment, IPost, Post } from "../models/feed";
import { shortUserPopulation } from "./users";
import { IUser } from "../models/accounts";

const getPostOrComment = async (slug: string): Promise<IPost | IComment | null> => {
    const post = await Post.findOne({ slug }).populate(shortUserPopulation("reactions.user"))
    let comment = null
    if (!post) comment = await Comment.findOne({ slug }).populate(shortUserPopulation("reactions.user"))
    return post || comment
}

const addOrUpdateReaction = async (postOrComment: IPost | IComment, userId: Types.ObjectId, rType: string): Promise<{ rType: string; user: Types.ObjectId | IUser }> => {
  // Check if the user already has a reaction
  let reactionData = postOrComment.reactions.find(reaction => reaction.user.toString() === userId.toString());
  if (reactionData) {
    reactionData.rType = rType;
  } else {
    reactionData = { rType, user: userId }
    postOrComment.reactions.push(reactionData);
  }
  await postOrComment.save();
  return reactionData
}

const removeReaction = async (postOrComment: IPost | IComment, userId: Types.ObjectId): Promise<boolean> => {
  const index = postOrComment.reactions.findIndex(reaction => reaction.user.toString() === userId.toString())
  const isRemovable = index !== -1
  if (isRemovable) {
    postOrComment.reactions.splice(index, 1)
    await postOrComment.save()
  }
  return isRemovable // Indicates whether it was removed or not
}

export { getPostOrComment, addOrUpdateReaction, removeReaction }
import { createAccessToken, createRefreshToken, createUser, shortUserPopulation } from "../managers/users"
import { IUser, User } from "../models/accounts"
import { Comment, IComment, IPost, Post, REACTION_CHOICES_ENUM } from "../models/feed"

const BASE_URL = "/api/v7"

const testUser = async () => {
    let userData = { firstName: "Test", lastName: "User", email: "testuser@example.com", password: "testuser" }
    let user = await User.findOne({ email: userData.email })
    if (!user) user = await createUser(userData)
    return user
}

const testVerifiedUser = async (): Promise<IUser> => {
    let userData = { firstName: "Test", lastName: "UserVerified", email: "testuserverified@example.com", password: "testuserverified" }
    let user = await User.findOne({ email: userData.email })
    if (!user) user = await createUser(userData, true)
    return user
}

const testAnotherVerifiedUser = async (): Promise<IUser> => {
    let userData = { firstName: "TestAnother", lastName: "UserVerified", email: "testanotheruserverified@example.com", password: "testanotheruserverified" }
    let user = await User.findOne({ email: userData.email })
    if (!user) user = await createUser(userData, true)
    return user
}

const testTokens = async (user: IUser): Promise<{access: string, refresh: string}> => {
    const access = createAccessToken(user.id) 
    const refresh = createRefreshToken() 
    const tokens = { access, refresh }
    await User.updateOne(
        { _id: user._id },
        { $set: { "tokens": tokens } }
    )
    return tokens
}

const testPost = async (): Promise<IPost> => {
    const author = await testVerifiedUser()
    const post = await Post.create({ text: "This is a new post", author: author._id})
    post.author = author
    return post
}

const testReaction = async (post: IPost) => {
    const reactions = [{rType: REACTION_CHOICES_ENUM.LIKE, user: post.author._id}] 
    post = await Post.findOneAndUpdate({ _id: post._id }, { reactions }, { new: true }).populate(shortUserPopulation("reactions.user")) as IPost
    return post.reactions[0]
}

const testComment = async (post: IPost): Promise<IComment> => {
    const author = await testVerifiedUser()
    const comment = await Comment.create({ text: "This is a new comment", post: post._id, author: author._id})
    comment.author = author
    return comment
}

const testReply = async (comment: IComment): Promise<IComment> => {
    const author = await testVerifiedUser()
    const reply = await Comment.create({ text: "This is a new comment", parent: comment._id, post: comment.post, author: author._id})
    reply.author = author
    return reply
}

const paginatedTestData = (dataKey: string, data: Record<string,any>) => {
    return {
        itemsCount: 1,
        itemsPerPage: 100, 
        page: 1, 
        [dataKey]: [data], 
        totalPages: 1
    }
}

export { BASE_URL, testUser, testVerifiedUser, testAnotherVerifiedUser, testTokens, testPost, testReaction, testComment, testReply, paginatedTestData }
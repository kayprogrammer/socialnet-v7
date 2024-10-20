import { createAccessToken, createRefreshToken, createUser, shortUserPopulation } from "../managers/users"
import { City, Country, ICity, IState, IUser, State, User } from "../models/accounts"
import { Comment, IComment, IPost, Post, REACTION_CHOICES_ENUM } from "../models/feed"
import { Friend, FRIEND_REQUEST_STATUS_CHOICES, IFriend, INotification, Notification, NOTIFICATION_TYPE_CHOICES } from "../models/profiles"

// GENERAL UTIL------------------------------------
const BASE_URL = "/api/v7"
const paginatedTestData = (dataKey: string, data: Record<string,any>) => {
    return {
        itemsCount: expect.any(Number),
        itemsPerPage: 100, 
        page: 1, 
        [dataKey]: data, 
        totalPages: 1
    }
}
// ---------------------------------------------------

// USERS AND AUTH------------
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
// -----------------------------------

// FEED UTILS------------------------
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
// --------------------------------------------------------

// PROFILES UTIL-------------------------------------------
const testCity = async (): Promise<ICity> => {
    const countryDataToCreate = { name: "Nigeria", code: "NG" }
    let country = await Country.findOne(countryDataToCreate) 
    if(!country) country = await Country.create(countryDataToCreate)
    
    const stateDataToCreate = { name: "Lagos", code: "LA", country_: country._id }
    let state = await State.findOne(stateDataToCreate) 
    if(!state) state = await State.create(stateDataToCreate)
    state.country_ = country

    const cityDataToCreate = { name: "Lekki", state_: state._id }
    let city = await City.findOne(cityDataToCreate) 
    if(!city) city = await City.create(cityDataToCreate)
    city.state_ = state
    return city
}

const testFriend = async (requester: IUser, requestee: IUser, status: FRIEND_REQUEST_STATUS_CHOICES = FRIEND_REQUEST_STATUS_CHOICES.ACCEPTED): Promise<IFriend> => {
    let friendData = { requester: requester.id, requestee: requestee.id };
    let friend = await Friend.findOneAndUpdate(friendData, { status }, { new: true })
    if (!friend) friend = await Friend.create({ status, ...friendData })
    return friend
}

const testNotification = async (sender: IUser, receiver: IUser): Promise<INotification> => {
    const post = await testPost()
    const notificationData = { sender: sender.id, receiver: receiver.id, nType: NOTIFICATION_TYPE_CHOICES.REACTION, post: post.id, readBy: []};
    const notification = await Notification.create(notificationData)
    notification.sender = sender
    notification.post = post
    notification.isRead = false
    return notification
}
// -------------------------------------------------------

// CHATS UTIL-------------------------------------
// -----------------------------------------------

export { 
    BASE_URL, paginatedTestData, 
    testUser, testVerifiedUser, testAnotherVerifiedUser, testTokens, 
    testPost, testReaction, testComment, testReply, 
    testCity, testFriend, testNotification
}
import { createAccessToken, createRefreshToken, createUser } from "../managers/users"
import { IUser, User } from "../models/accounts"
import { IPost, Post } from "../models/feed"

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

const testPost = async (): Promise<IPost> => {
    const author = await testVerifiedUser()
    const post = await Post.create({ text: "This is a new post", author: author._id})
    post.author = author
    return post
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

// export const authTestGet = async (
//     api: supertest.SuperTest<supertest.Test>, 
//     endpoint: string,
//     authService: AuthService, 
//     userService: UserService, 
//     user: Record<string,any>
// ): Promise<supertest.Test> => {
//     const access = await setAuth(authService, userService, user)
//     return api.get(`/api/v8${endpoint}`).set("authorization", `Bearer ${access}`)
// };

// export const authTestPost = async (
//     api: supertest.SuperTest<supertest.Test>, 
//     endpoint: string,
//     authService: AuthService, 
//     userService: UserService, 
//     user: Record<string,any>,
//     data: Record<string,any>
// ): Promise<supertest.Test> => {
//     const access = await setAuth(authService, userService, user)
//     return api.post(`/api/v8${endpoint}`).set("authorization", `Bearer ${access}`).send(data)
// };

// export const authTestPatch = async (
//     api: supertest.SuperTest<supertest.Test>, 
//     endpoint: string,
//     authService: AuthService, 
//     userService: UserService, 
//     user: Record<string,any>,
//     data: Record<string,any>
// ): Promise<supertest.Test> => {
//     const access = await setAuth(authService, userService, user)
//     return api.patch(`/api/v8${endpoint}`).set("authorization", `Bearer ${access}`).send(data)
// };

// export const authTestPut = async (
//     api: supertest.SuperTest<supertest.Test>, 
//     endpoint: string,
//     authService: AuthService, 
//     userService: UserService, 
//     user: Record<string,any>,
//     data: Record<string,any>
// ): Promise<supertest.Test> => {
//     const access = await setAuth(authService, userService, user)
//     return api.put(`/api/v8${endpoint}`).set("authorization", `Bearer ${access}`).send(data)
// };

export { BASE_URL, testUser, testVerifiedUser, testTokens, testPost }
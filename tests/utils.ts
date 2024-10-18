import { createUser } from "../managers/users"
import { IUser, User } from "../models/accounts"
import { IPost, Post } from "../models/feed"

const BASE_URL = "/api/v7"

const testUser = async () => {
    let userData = { firstName: "Test", lastName: "User", email: "testuser@example.com", password: "testuser" }
    let user = await User.findOne({ email: userData.email })
    if (!user) user = await createUser(userData)
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

// const setAuth = async (
//     authService: AuthService, 
//     userService: UserService, 
//     user: Record<string,any>
// ): Promise<string> => {
//     const access = authService.createAccessToken({userId: user.id})
//     const refresh = authService.createRefreshToken() 
//     await userService.update({id: user.id, access: access, refresh: refresh})
//     return access
// }

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

export { BASE_URL, testUser, testVerifiedUser, testPost }
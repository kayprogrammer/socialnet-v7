import supertest from 'supertest';

const BASE_URL = "/api/v7"

const testGet = (api: supertest.SuperTest<supertest.Test>, endpoint: string) => api.get(`/api/v8${endpoint}`);
const testPost = (api: supertest.SuperTest<supertest.Test>, endpoint: string, data: Record<string, any>) => api.post(`/api/v8${endpoint}`).send(data);

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

export { BASE_URL }
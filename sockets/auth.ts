import { Request } from "express";
import { ErrorCode } from "../config/handlers";
import { decodeAuth } from "../managers/users"
import { IUser } from "../models/accounts";
import { WebSocket } from 'ws';
import { WSError } from "./base";
import ENV from "../config/config";


const getUser = async(ws: WebSocket, token: string): Promise<IUser | string> => {
  // Extract the token from Authorization header
  const user = await decodeAuth(token)
  if (!user) WSError(ws, 4001, ErrorCode.INVALID_TOKEN, "Access token is invalid or expired")
  return user as IUser
}
export const authWsMiddleware = async (ws: WebSocket, req: Request, next: (err?: Error) => void) => {
    let authorizationValue = req.headers.authorization
    if(authorizationValue) {
        if (authorizationValue.startsWith("Bearer ")) {
            ws.user = await getUser(ws, authorizationValue.replace('Bearer ', ''));
            next();
        } else if (authorizationValue == ENV.SOCKET_SECRET) {
            ws.user = authorizationValue
            next();
        } else {
            WSError(ws, 4001, ErrorCode.UNAUTHORIZED_USER, "Unauthorized User")
        }
    } else {
        WSError(ws, 4001, ErrorCode.UNAUTHORIZED_USER, "Unauthorized User")
    }
};

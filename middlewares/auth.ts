import { NextFunction, Request, Response } from "express";
import { ErrorCode, RequestError } from "../config/handlers";
import { decodeAuth } from "../managers/users"

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Check if Authorization header exists
      if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) throw new RequestError("Unauthorized User", 401, ErrorCode.UNAUTHORIZED_USER);
  
      // 2. Extract the token from Authorization header
      const token = req.headers.authorization.replace('Bearer ', '');
      const user = await decodeAuth(token)
      if (!user) throw new RequestError("Access token is invalid or expired", 401, ErrorCode.INVALID_TOKEN)
      req.user = user;
      next();
    } catch (error) {
      next(error)
    }
  };
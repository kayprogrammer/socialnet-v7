import express from "express";
import { IUser } from "../../models/accounts";
import { WebSocket } from 'ws';
import { IChat } from "../../models/chat";

declare global {
  namespace Express {
    interface Request {
      user: IUser
      user_: IUser | null // For guest auth
    }
  }
}

declare module "ws" {
  interface WebSocket {
    user: IUser | string; // For auth, the string is for socket secret which is useful for in app socket client
    chat: IChat | null;  
    objUser: IUser | null;  
  }
}

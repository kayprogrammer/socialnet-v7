import { Expose, plainToInstance } from "class-transformer";
import { ErrorCode } from "../config/handlers";
import { WebSocket } from 'ws';
import { IsEnum, IsNotEmpty, validate, ValidationError } from "class-validator";

type ResponseBase = {
    message: string;
    status: string;
    type?: ErrorCode; // Optional error type
};

const WSError = (ws: WebSocket, code: number, eType: ErrorCode, message: string, data: Record<string,any> | null = null): boolean => {
    let response: ResponseBase & { data?: Record<string,any> } = {
        status: "failure",
        type: eType,
        message
    };
    if(data) response.data = data
    ws.send(JSON.stringify(response))
    ws.close(code, message)
    return true
}

const validateSocketEntry = async (ws: WebSocket, body: string, schema: any): Promise<Record<string,any>> => {
    let parsedBody = {}
    try {
        parsedBody = JSON.parse(body) 
        const instance = plainToInstance(schema, parsedBody) as any;
        const errors: ValidationError[] = await validate(instance);
        if (errors.length > 0) {
            const formattedErrors = errors.reduce((acc, error) => {
                if (error.constraints) {
                    // Get the first constraint message
                    const [firstConstraint] = Object.values(error.constraints);
                    acc[error.property] = firstConstraint;
                }
                return acc;
            }, {} as Record<string, string>);
            WSError(ws, 4220, ErrorCode.INVALID_ENTRY, "Invalid Entry", formattedErrors)
        }
    } catch {
        WSError(ws, 4220, ErrorCode.INVALID_ENTRY, "Invalid JSON")
    }
    return parsedBody
};

const notificationClients = new Set<WebSocket>(); // Store all connected WebSocket clients
const chatClients = new Set<WebSocket>(); // Store all connected WebSocket clients

// Add client to the list when they connect
const addClient = (ws: WebSocket, wType: "notification" | "chat" = "notification") => {
    if (wType === "notification") {
        notificationClients.add(ws)
    } else {
        chatClients.add(ws)
    }
};

// Remove client from the list when they disconnect
const removeClient = (ws: WebSocket, wType: "notification" | "chat" = "notification") => {
    if (wType === "notification") {
        notificationClients.delete(ws)
    } else {
        chatClients.delete(ws)
    }
};

enum SOCKET_STATUS_CHOICES {
    CREATED = "CREATED",
    UPDATED = "UPDATED",
    DELETED = "DELETED"
} 

class SocketEntrySchema {
    @Expose()
    @IsNotEmpty()
    @IsEnum(SOCKET_STATUS_CHOICES)
    status?: SOCKET_STATUS_CHOICES;

    @IsNotEmpty()
    @Expose()
    id?: string;
}

export { WSError, validateSocketEntry, notificationClients, chatClients, addClient, removeClient, SocketEntrySchema, SOCKET_STATUS_CHOICES }
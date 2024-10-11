import { plainToInstance } from "class-transformer";
import { ErrorCode } from "../config/handlers";
import { WebSocket } from 'ws';
import { validate, ValidationError } from "class-validator";

type ResponseBase = {
    message: string;
    status: string;
    type?: ErrorCode; // Optional error type
};

const WSError = (ws: WebSocket, code: number, eType: ErrorCode, message: string, data: Record<string,any> | null = null) => {
    let response: ResponseBase & { data?: Record<string,any> } = {
        status: "failure",
        type: eType,
        message
    };
    if(data) response.data = data
    ws.send(JSON.stringify(response))
    ws.close(code, message)
}

const validateSocketEntry = async (ws: WebSocket, body: string, schema: any): Promise<Record<string,any>> => {
    const parsedbody = JSON.parse(body) 
    const instance = plainToInstance(schema, parsedbody);
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
    return parsedbody
};

const clients = new Set<WebSocket>(); // Store all connected WebSocket clients
// Add client to the list when they connect
const addClient = (ws: WebSocket) => {
    clients.add(ws);
};

// Remove client from the list when they disconnect
const removeClient = (ws: WebSocket) => {
    clients.delete(ws);
};

export { WSError, validateSocketEntry, clients, addClient, removeClient }
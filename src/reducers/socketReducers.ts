import React from "react";
import { Socket } from "socket.io-client";

export interface ISocketContextState {
    socket: Socket | undefined;
    uid: string;
    players: string[];
}

export const defaultSocketContextState: ISocketContextState = {
    socket: undefined,
    uid: "",
    players: [],
}

type Action =
    { type: 'UPDATE_SOCKET'; payload: Socket }
    |
    { type: 'UPDATE_UID'; payload: string }
    |
    { type: 'UPDATE_USERS'; payload: string[] }
    |
    { type: 'REMOVE_USER'; payload: string }

export const socketReducer = (state: ISocketContextState, action: Action): ISocketContextState => {
    //console.log(`Message received - Action: ${action.type} - Payload:`, action.payload);

    switch (action.type) {
        case 'UPDATE_SOCKET':
            return { ...state, socket: action.payload };
        case 'UPDATE_UID':
            return { ...state, uid: action.payload };
        case 'UPDATE_USERS':
            return { ...state, players: action.payload };
        case 'REMOVE_USER':
            return { ...state, players: state.players.filter(uid => uid !== action.payload) };

        default:
            return { ...state };
    }
}

export interface ISocketContextProps {
    SocketState: ISocketContextState;
    SocketDispatch: React.Dispatch<Action>;
}

const SocketContext = React.createContext<ISocketContextProps>({
    SocketState: defaultSocketContextState,
    SocketDispatch: () => { }
});

export const SocketContextConsumer = SocketContext.Consumer;
export const SocketContextProvider = SocketContext.Provider;

export default SocketContext;

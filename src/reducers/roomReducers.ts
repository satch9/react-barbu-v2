import { Contract, Player } from "./gameReducers";

export interface RoomsState {
    rooms: Room[];
}

/** Interface de Room */
export interface Room {
    roomId: string;
    name: string;
    players: Player[];
    isPlaying: boolean;
    isFinished: boolean;
    winner: Player | null;
    currentContract: Contract | null;
}

export const initialRoomsState: RoomsState = {
    rooms: [],
};

type Action =
    | { type: 'SET_ROOMS_STATE'; payload: RoomsState; }
    | { type: 'JOIN_ROOM'; payload: { roomId: string; player: Player } }
    | { type: 'LEAVE_ROOM'; payload: { roomId: string; player: Player } };

export const roomReducers = (state: RoomsState, action: Action): RoomsState => {
    console.log('roomReducers - state:', state);
    console.log(`Message received - Action: ${action.type} - Payload:`, action.payload);

    switch (action.type) {
        case 'SET_ROOMS_STATE':
            return {
                ...state,
                rooms: action.payload.rooms,
            };
        case 'JOIN_ROOM':
            return {
                ...state,
                rooms: state.rooms.map(room =>
                    room.roomId === action.payload.roomId
                        ? { ...room, players: [...room.players, action.payload.player] }
                        : room
                ),
            };
        case 'LEAVE_ROOM':
            return {
                ...state,
                rooms: state.rooms.map(room =>
                    room.roomId === action.payload.roomId
                        ? { ...room, players: room.players.filter(player => player.uid !== action.payload.player.uid) }
                        : room
                ),
            };
        default:
            return state;
    }
}
/** Interface de GameState pour le jeu du barbu */
export interface GameState {
    players: Player[];
    currentPlayer: Player;
    winner: Player | null;
    contracts: Contract[];
    currentContract: Contract | null;
}

export const initialState: GameState = {
    players: [],
    currentPlayer: {
        uid: '',
        name: '',
        startedHand: [],
        myHandsDuringGame: [],
        contractPlayed: [],
        socketId: '',
        score: 0,
        isReady: false,
        isPlaying: false,
        isWinner: false,
        isDisconnected: false,
    },
    winner: null,
    contracts: [],
    currentContract: null,
};

/** Interface de player pour le jeu du barbu */
export interface Player {
    uid: string;
    name: string;
    startedHand: [],
    myHandsDuringGame: [],
    contractPlayed: [],
    socketId: string;
    score: number;
    isReady: boolean;
    isPlaying: boolean;
    isWinner: boolean;
    isDisconnected: boolean;
}

/** Interface de Contract pour le jeu du barbu */
export interface Contract {
    name: string;
    description: string;
    value: number;
}



type Action =
    { type: 'SET_GAME_STATE'; payload: GameState; }
    |
    { type: 'SET_PLAYERS'; payload: Player[]; }
    |
    { type: 'UPDATE_GAME_PLAYER'; payload: Player; }




export const gameReducers = (state: GameState, action: Action): GameState => {
    //console.log('gameReducers - state:', state);
    //console.log(`Message received - Action: ${action.type} - Payload:`, action.payload);

    switch (action.type) {
        case 'SET_GAME_STATE':

            return {
                ...state,
                players: action.payload.players,
                currentPlayer: action.payload.currentPlayer,
                winner: action.payload.winner,
                contracts: action.payload.contracts,
                currentContract: action.payload.currentContract,
            };
        case 'SET_PLAYERS':
            return {
                ...state,
                players: action.payload,
            };
        case 'UPDATE_GAME_PLAYER': {
            console.log("UPDATE_USERNAME state:", state)
            console.log("UPDATE_USERNAME action:", action)
            const newPlayers = state.players.concat({
                uid: action.payload.uid,
                name: action.payload.name,
                startedHand: action.payload.startedHand,
                myHandsDuringGame: action.payload.myHandsDuringGame,
                contractPlayed: action.payload.contractPlayed,
                socketId: action.payload.socketId,
                score: action.payload.score,
                isReady: action.payload.isReady,
                isPlaying: action.payload.isPlaying,
                isWinner: action.payload.isWinner,
                isDisconnected: action.payload.isDisconnected,
            })
            return {
                ...state,
                players: newPlayers,

            };
        }

        default:
            return state;
    }
}
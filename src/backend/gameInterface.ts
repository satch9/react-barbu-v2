import { Card } from "./Card";

/** Interface de GameState pour le jeu du barbu */
export interface GameState {
    players: Player[];
    currentPlayer: object;
    winner: Player | null;
    contracts: Contract[];
    currentContract: Contract | null;
}



/** Interface de player pour le jeu du barbu */
export interface Player {
    uid: string;
    name: string;
    startedHand: Card[];
    myHandsDuringGame: Card[];
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
    value: number | number[];
}

export interface RoomsState {
    rooms: Room[];
}

/** Interface de Room */
export interface Room {
    roomId: string;
    name: string;
    players: Player[];
    isGameInProgress: boolean;
    isFinished: boolean;
    winner: Player | null;
    currentContract: Contract | null;
}
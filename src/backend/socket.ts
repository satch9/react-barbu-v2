import { Server as HttpServer } from 'http';
import { Socket, Server as ServerSocketIo } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { Deck } from './Deck';
import { Contracts } from './Contracts';


import { GameState, RoomsState, Contract } from './gameInterface';

export class ServerSocket {
    public static instance: ServerSocket;
    public io: ServerSocketIo;

    public users: { [uid: string]: string };
    public deck: Deck;
    public contracts: Contract[];

    public gameState: GameState;
    public roomsState: RoomsState

    constructor(httpServer: HttpServer) {
        ServerSocket.instance = this;

        this.io = new ServerSocketIo(httpServer, {
            serveClient: false,
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false,
            cors: {
                origin: 'http://localhost:5173',
                methods: ['GET', 'POST'],
                credentials: true,
            }
        });

        this.users = {};


        this.contracts = Contracts.CONTRACTS;

        /** Initialisation du gameState */
        this.gameState = {
            players: [],
            currentPlayer: {
                uid: '',
                name: '',
                socketId: '',
                score: 0,
                isReady: false,
                isPlaying: false,
                isWinner: false,
                isDisconnected: false,
            },
            winner: null,
            contracts: [], // mettre les contrats ici
            currentContract: null,
        };

        this.roomsState = {
            rooms: [],
        };

        this.deck = new Deck();
        //console.log("this.deck", this.deck)

        this.io.on('connection', this.StartListeners.bind(this));
        console.log('Socket IO started')
    }

    generateRandomRoomName(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    randomCurrentPlayer(): number {
        return Math.floor(Math.random() * 4) + 1;
    }

    StartListeners(socket: Socket) {

        console.info(`Message received from ${socket.id}`);

        socket.on('handshake', (callback: (uid: string, users: string[], gameState: GameState, roomsState: RoomsState) => void) => {
            console.log(`Handshake received from ${socket.id}`);

            /** Check if this is a reconnection */
            const reconnected = Object.values(this.users).includes(socket.id);
            console.log('reconnected', reconnected)
            if (reconnected) {
                console.info('-------------------------')
                console.info('This user has reconnected');
                console.info('-------------------------')

                const uid = this.GetUidFromSocketID(socket.id);
                const users = Object.values(this.users);

                if (uid) {
                    console.info('Sending callback for reconnect ...');

                    callback(uid, users, this.gameState, this.roomsState);
                    return;
                }
            }

            /** Generate new user */
            const uid = uuidv4();
            this.users[uid] = socket.id;

            const users = Object.values(this.users);

            callback(uid, users, this.gameState, this.roomsState);

            // Send new user to all connected users 
            this.SendMessage(
                'user_connected',
                users.filter((id) => id !== socket.id),
                users
            )


        });

        // ----------------------------------------- //
        //             Game section
        // ----------------------------------------- //

        // Send initial state to all connected users
        this.io.emit('gameState', this.gameState);
        this.io.emit('roomsState', this.roomsState);


        socket.on('create_game', ({ uid, socketId, pseudo }) => {
            console.log(`Create game received from =>uid: ${uid} - socketId: ${socketId} - pseudo: ${pseudo}`);

            // generate partie name
            const roomName = this.generateRandomRoomName();

            // initialisation de room
            const room = {
                roomId: uuidv4(),
                name: roomName,
                players: [{
                    uid: uid,
                    name: pseudo,
                    startedHand: [],
                    myHandsDuringGame: [],
                    contractPlayed: [],
                    socketId: socketId,
                    score: 0,
                    isReady: true,
                    isPlaying: false,
                    isWinner: false,
                    isDisconnected: false,
                }],
                isGameInProgress: false,
                isFinished: false,
                winner: null,
                currentContract: null,
            }

            // add room to roomsState
            this.roomsState.rooms.push(room);

            this.gameState.players.push({
                uid: uid,
                name: pseudo,
                startedHand: [],
                myHandsDuringGame: [],
                contractPlayed: [],
                socketId: socketId,
                score: 0,
                isReady: true,
                isPlaying: false,
                isWinner: false,
                isDisconnected: false,
            });

            this.io.emit('gameState', this.gameState);
            this.io.emit('roomsState', this.roomsState);

        });

        socket.on('join_game', ({ uid, socketId, pseudo, roomId }) => {
            console.log(`Join game received from =>uid: ${uid} - socketId: ${socketId} - pseudo: ${pseudo} - roomId: ${roomId}`);

            this.roomsState.rooms.forEach((room) => {
                if (room.roomId === roomId) {
                    room.players.push({
                        uid: uid,
                        name: pseudo,
                        startedHand: [],
                        myHandsDuringGame: [],
                        contractPlayed: [],
                        socketId: socketId,
                        score: 0,
                        isReady: true,
                        isPlaying: false,
                        isWinner: false,
                        isDisconnected: false,
                    });
                }
            });

            this.gameState.players.push({
                uid: uid,
                name: pseudo,
                startedHand: [],
                myHandsDuringGame: [],
                contractPlayed: [],
                socketId: socketId,
                score: 0,
                isReady: true,
                isPlaying: false,
                isWinner: false,
                isDisconnected: false,
            });

            this.io.emit('gameState', this.gameState);
            this.io.emit('roomsState', this.roomsState);

        });

        socket.on('start_game', ({ roomId }) => {
            console.log(`Start game received from => roomId: ${roomId}`);

            this.deck.shuffle();

            this.roomsState.rooms.forEach((room) => {
                if (room.roomId === roomId) {
                    room.isGameInProgress = true;
                }

                room.players.forEach((player) => {
                    player.isPlaying = true;

                });
                this.deck.dealCardsToPlayers(room.players);
                room.players.forEach((player) => {
                    player.startedHand = this.deck.sort(player.startedHand);
                    console.log("player.hand", player.startedHand)
                });

                // Synchronize player.hand values to this.gameState.players
                const matchingGamePlayers = this.gameState.players.filter((gamePlayer) =>
                    room.players.some((roomPlayer) => roomPlayer.socketId === gamePlayer.socketId)
                );

                matchingGamePlayers.forEach((gamePlayer) => {
                    const matchingRoomPlayer = room.players.find((roomPlayer) => roomPlayer.socketId === gamePlayer.socketId);
                    if (matchingRoomPlayer) {
                        gamePlayer.startedHand = matchingRoomPlayer.startedHand.slice(); // Copy the hand values
                    }
                });
            });

            this.gameState.players.forEach((player) => {
                player.isPlaying = true;
            });

            this.gameState.contracts = this.contracts;
            this.gameState.currentPlayer = this.gameState.players[this.randomCurrentPlayer() - 1];

            this.io.emit('gameState', this.gameState);
            this.io.emit('roomsState', this.roomsState);
            this.io.emit('gameStarted', true);
        });

        socket.on('contract_choice', (index, playerContractChose) => {
            console.log(`Contract choice received from => contract: ${index}`);

            const contractChosen: Contract = this.gameState.contracts[index];
            this.gameState.currentContract = contractChosen;

            this.gameState.players.forEach((player) => {
                if (player.name === playerContractChose.name) {
                    player.contractPlayed?.push(contractChosen);
                }
            });

            this.roomsState.rooms.forEach((room) => {
                room.currentContract = contractChosen;
                room.players.forEach((player) => {
                    player.contractPlayed?.push(contractChosen);
                });
            });

            this.io.emit('gameState', this.gameState);
            this.io.emit('roomsState', this.roomsState);
            this.io.emit('contractChosen', contractChosen);

        })

        // Exemple de mise à jour dans socket.on('card_played')
        socket.on('card_played', (card, playerCardClicked) => {
            const newGameState = { ...this.gameState };
            const newRoomsState = { ...this.roomsState };

            newGameState.players = newGameState.players.map((player) => {
                if (player.name === playerCardClicked.name) {
                    const newPlayer = { ...player };
                    newPlayer.myHandsDuringGame = [...newPlayer.myHandsDuringGame, card];
                    newPlayer.startedHand = newPlayer.startedHand.filter((cardInHand) => cardInHand !== card);
                    return newPlayer;
                }
                return player;
            });

            newRoomsState.rooms = newRoomsState.rooms.map((room) => {
                const newRoom = { ...room };
                newRoom.players = newRoom.players.map((player) => {
                    if (player.name === playerCardClicked.name) {
                        const newPlayer = { ...player };
                        newPlayer.myHandsDuringGame = [...newPlayer.myHandsDuringGame, card];
                        newPlayer.startedHand = newPlayer.startedHand.filter((cardInHand) => cardInHand !== card);
                        return newPlayer;
                    }
                    return player;
                });
                return newRoom;
            });

            this.io.emit('gameState', newGameState);
            this.io.emit('roomsState', newRoomsState);
        });


        socket.on('disconnect', () => {
            console.info(`User disconnected: ${socket.id}`);

            /** Remove user from users */
            const uid = this.GetUidFromSocketID(socket.id);
            if (uid) {
                delete this.users[uid];
            }

            /** Send disconnected user to all connected users */
            this.io.emit('user_disconnected', uid);

        });

        socket.on('message', (message: string) => {
            console.info(`Message received from ${socket.id}: ${message}`);

            /** Send message to all connected users */
            socket.broadcast.emit('message', message);
        });
    }

    GetUidFromSocketID = (id: string) => {
        return Object.keys(this.users).find((uid) => this.users[uid] === id);
    }

    /**
     * Send a message through the socket
     * @param name the name of the event, ex: handshake
     * @param users List of socket id's
     * @param payload any information needed by the user for state updates
     */

    SendMessage = (name: string, players: string[], payload?: object) => {
        console.info(`Emitting event: ${name} to ${players} players`);
        players.forEach((id) => (payload ? this.io.to(id).emit(name, payload) : this.io.to(id).emit(name)));
    }

}

import { useEffect, useReducer, useState } from 'react';
import './App.css'
import { defaultSocketContextState, socketReducer } from './reducers/socketReducers';
import { useSocket } from './hooks/useSocket';
import { GameState, gameReducers, initialState } from './reducers/gameReducers';
import { RoomsState, initialRoomsState, roomReducers } from './reducers/roomReducers';
import ListOfGames from './components/ListOfGames';
import Board from './components/Board';

const App = () => {

  const [SocketState, SocketDispatch] = useReducer(socketReducer, defaultSocketContextState);
  const [GameStateReducer, gameDispatch] = useReducer(gameReducers, initialState);
  const [RoomsStateReducer, roomsDispatch] = useReducer(roomReducers, initialRoomsState);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messageError, setMessageError] = useState('');

  //console.log("SocketState", SocketState);

  const socket = useSocket('http://localhost:4003', {
    reconnectionAttempts: 5,
    reconnectionDelay: 5000,
    autoConnect: false
  });

  useEffect(() => {

    socket.connect();

    /** Save the socket in context */
    SocketDispatch({ type: 'UPDATE_SOCKET', payload: socket });
    /** Start the event listeners */
    StartListeners();
    /** Send the handshake */
    SendHandshake();

    return () => {
      socket.disconnect();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const StartListeners = () => {
    /** User connected event */
    socket.on('user_connected', (players: string[]) => {
      console.info('User connected, new user list received');
      SocketDispatch({ type: 'UPDATE_USERS', payload: players });
    });

    /** User disconnected event */
    socket.on('user_disconnected', (uid: string) => {
      console.info('User disconnected');
      SocketDispatch({ type: 'REMOVE_USER', payload: uid });
      SendHandshake();
    });

    /** Reconnect event*/
    socket.io.on('reconnect', (attempt) => {
      console.info(`Reconnected on attempt: ${attempt}`);
    });

    /** Reconnect attempt event*/
    socket.io.on('reconnect_attempt', (attempt) => {
      console.info(`Reconnection attempt : ${attempt}`);
    });

    /** Reconnection error*/
    socket.io.on('reconnect_error', (error) => {
      console.info(`Reconnection error : ${error}`);
    });

    /** Reconnection failed*/
    socket.io.on('reconnect_failed', () => {
      console.info(`Reconnection failure`);
      alert('We are unable to connect you to the web socket')
    });

    // ----------------------------------------- //
    //             Game section
    // ----------------------------------------- //

    socket.on('gameState', (gameState: GameState) => {
      gameDispatch({ type: 'SET_GAME_STATE', payload: gameState });
    });

    socket.on('roomsState', (roomsState: RoomsState) => {
      roomsDispatch({ type: 'SET_ROOMS_STATE', payload: roomsState });
    })

    socket.on('gameStarted', (started: boolean) => {
      setGameStarted(started);
    })


  }

  const SendHandshake = () => {
    //console.info('Sending handshake to server ...');
    socket.emit('handshake', (uid: string, players: string[], gameState: GameState, roomsState: RoomsState) => {
      console.log('User handshake callback message received');
      SocketDispatch({ type: 'UPDATE_UID', payload: uid });
      SocketDispatch({ type: 'UPDATE_USERS', payload: players });
      gameDispatch({ type: 'SET_GAME_STATE', payload: gameState });
      roomsDispatch({ type: 'SET_ROOMS_STATE', payload: roomsState });
      setMessageError('');
      setLoading(false);
    });
  }

  if (loading) return <p>Loading game ....</p>

  return (
    <>
      <div className='app'>

        {
          gameStarted ? <Board roomsState={RoomsStateReducer} gameState={GameStateReducer} socketState={SocketState} /> : <ListOfGames socketState={SocketState} roomsState={RoomsStateReducer} setGameStarted={setGameStarted} />
        }

        <p className="messageError">{messageError && messageError}</p>
        <div className='global'>
          <span>Etat du jeu :
            <pre>{JSON.stringify(GameStateReducer, null, 1)}</pre>
          </span>
          <span>Etat des rooms :
            <pre>{JSON.stringify(RoomsStateReducer, null, 1)}</pre>
          </span>
          <span>Etat des sockets :
            <pre>uid: {JSON.stringify(SocketState.uid, null, 1)}</pre>
            <pre>players :{JSON.stringify(SocketState.players, null, 1)}</pre>
          </span>
        </div>
      </div>
    </>
  )
}

export default App

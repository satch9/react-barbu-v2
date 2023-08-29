import React, { useCallback, useMemo, useState } from "react";
import { ISocketContextState } from "../reducers/socketReducers";
import Modal from "react-modal";
import { RoomsState } from "./../reducers/roomReducers";

type ListOfGamesProps = {
  socketState: ISocketContextState;
  roomsState: RoomsState;
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
  gameStarted: boolean;
};

Modal.setAppElement("#root");

const screenWidth = window.screen.width;
const screenHeight = window.screen.height;
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: windowWidth <= 375 ? "70%" : screenWidth <= 768 ? "55%" : "50%",
    height: windowHeight >= 667 ? "50%" : windowHeight >= 480 ? "40%" : "35%",
    borderRadius: "10px",
  },
};

const ListOfGames: React.FC<ListOfGamesProps> = ({
  socketState,
  roomsState,
  setGameStarted,
  gameStarted,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalIsOpen1, setModalIsOpen1] = useState(false);
  const [pseudo, setPseudo] = useState("");
  const [roomIdJoinedGame, setRoomIdJoinedGame] = useState("");
  const [joinedRoom, setJoinedRoom] = useState<string[]>([]);

  console.log("screenWidth screenHeight", screenWidth, screenHeight);

  console.log("SocketState listofgames", socketState);
  console.log("RoomsState listofgames", roomsState);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const openModal1 = () => {
    setModalIsOpen1(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const closeModal1 = () => {
    setModalIsOpen1(false);
  };

  const handleCreateGame = useCallback(() => {
    openModal();
  }, []);

  const handleJoinGame = useCallback(
    (roomIdChooseGame: string) => {
      openModal1();
      setRoomIdJoinedGame(roomIdChooseGame);
      setJoinedRoom((prevJoinedRoom) => [...prevJoinedRoom, roomIdChooseGame]);
    },
    [setJoinedRoom, setRoomIdJoinedGame]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setPseudo(pseudo);
      if (socketState.socket && pseudo !== "") {
        socketState.socket.emit("create_game", {
          uid: socketState.uid,
          socketId: socketState.socket.id,
          pseudo: pseudo,
        });
      }
      closeModal();
    },
    [socketState.socket, pseudo, socketState.uid]
  );

  const handleSubmit1 = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setPseudo(pseudo);
      if (socketState.socket && pseudo !== "") {
        socketState.socket.emit("join_game", {
          roomId: roomIdJoinedGame,
          uid: socketState.uid,
          socketId: socketState.socket.id,
          pseudo: pseudo,
        });
      }
      closeModal1();
    },
    [socketState.socket, pseudo, socketState.uid, roomIdJoinedGame]
  );

  const handleStartGame = useCallback(
    (roomIdStartGame: string) => {
      console.log("roomIdStartGame", roomIdStartGame);
      setGameStarted(true);
      socketState.socket?.emit("start_game", { roomId: roomIdStartGame });
    },
    [socketState.socket, setGameStarted]
  );

  const handleGoBackGame = useCallback(
    (roomIdGoBackGame: string) => {
      console.log("roomIdGoBackGame", roomIdGoBackGame);
      setGameStarted(true);
      socketState.socket?.emit("gobackgame", {
        roomIdGoBackGame: roomIdGoBackGame,
      });
    },
    [socketState.socket, setGameStarted]
  );

  const memoizedComponent = useMemo(
    () => (
      <div className="listofgames">
        <h1>Barbu</h1>
        {roomsState.rooms.length !== 0 && (
          <button className="btn-create" onClick={handleCreateGame}>
            Créer
          </button>
        )}

        <table>
          <caption>Liste des jeux</caption>
          <thead>
            <tr>
              <th>Id</th>
              <th>Players</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {roomsState.rooms.length !== 0 &&
              roomsState.rooms.map((room, index) => (
                <tr key={index}>
                  <td>{room.name}</td>
                  <td className="tooltip">
                    {room.players.length}
                    <span className="tooltiptext">
                      {room.players.map((player, index) => (
                        <p key={index}>{player.name}</p>
                      ))}
                    </span>
                  </td>
                  <td className="btn-actions">
                    {roomsState.rooms.length === 0 && (
                      <button className="btn-create" onClick={handleCreateGame}>
                        Créer
                      </button>
                      
                    )}
                    {roomsState.rooms.length !== 0 &&
                      room.players.length !== 4 &&
                      !joinedRoom.includes(room.roomId) &&
                      room.players[0].socketId !== socketState.socket?.id && (
                        <button
                          className="btn-join"
                          onClick={() => handleJoinGame(room.roomId)}
                        >
                          Rejoindre
                        </button>
                      )}
                    {roomsState.rooms.length !== 0 &&
                    room.players.length === 4 &&
                    room.players[0].socketId === socketState.socket?.id ? (
                      <button
                        className="btn-start"
                        onClick={() => handleStartGame(room.roomId)}
                      >
                        Commencer
                      </button>
                    ) : gameStarted ? (
                      <button
                        className="btn-goback"
                        onClick={() => handleGoBackGame(room.roomId)}
                      >
                        Revenir à la partie
                      </button>
                    ) : (
                      <p>en attente ...</p>
                    )}
                  </td>
                </tr>
              ))}
            {!roomsState.rooms.length && (
              <tr>
                <td colSpan={2}>Aucune partie en cours</td>
                <td></td>
                <td>
                  <button className="btn-create" onClick={handleCreateGame}>
                    Créer
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          style={customStyles}
        >
          <div className="modal">
            <div className="modal_close_container">
              <button className="modal__close" onClick={closeModal}>
                X
              </button>
            </div>

            <h2>Choisir son pseudo</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                id="name"
                required
                placeholder="pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
              />

              <button className="btn btn-modal" type="submit">
                Choisir
              </button>
            </form>
          </div>
        </Modal>
        <Modal
          isOpen={modalIsOpen1}
          onRequestClose={closeModal1}
          style={customStyles}
        >
          <div className="modal">
            <div className="modal_close_container">
              <button className="modal__close" onClick={closeModal1}>
                X
              </button>
            </div>

            <h2>Choisir son pseudo</h2>

            <form onSubmit={handleSubmit1}>
              <input
                type="text"
                name="name"
                id="name"
                required
                placeholder="pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
              />

              <button className="btn btn-modal" type="submit">
                Choisir
              </button>
            </form>
          </div>
        </Modal>
      </div>
    ),
    [
      roomsState.rooms,
      handleCreateGame,
      modalIsOpen,
      handleSubmit,
      pseudo,
      modalIsOpen1,
      handleSubmit1,
      joinedRoom,
      socketState.socket?.id,
      handleJoinGame,
      handleStartGame,
    ]
  );

  return memoizedComponent;
};

export default ListOfGames;

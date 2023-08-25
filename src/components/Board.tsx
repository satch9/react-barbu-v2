import React, { useEffect } from 'react'
import { RoomsState } from '../reducers/roomReducers'
import { GameState } from '../reducers/gameReducers';
import toast, { Toaster } from 'react-hot-toast';
import { ISocketContextState } from '../reducers/socketReducers';
import CardGame from './CardGame';

type BoardProps = {
    roomsState: RoomsState;
    gameState: GameState;
    socketState: ISocketContextState
}



const Board: React.FC<BoardProps> = ({ roomsState, gameState, socketState }) => {
    console.log("Board roomState", roomsState)
    console.log("Board gameState", gameState)
    console.log("Board socketState", socketState)

    useEffect(() => {
        const checkOrientation = () => {
            const isPortraitOrientation = window.innerHeight > window.innerWidth;

            if (isPortraitOrientation) {
                toast.error('Merci de tourner votre téléphone en mode paysage', {
                    duration: 5000,
                    position: 'top-center',
                    icon: '🔥',
                    iconTheme: {
                        primary: '#000',
                        secondary: '#fff',
                    },
                });
            }
        };

        // Vérifiez l'orientation au chargement de la page et lors de chaque changement d'orientation
        checkOrientation();
        window.addEventListener('resize', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
        };
    }, []);


    return (
        <div className='board'>
            <Toaster />
            {gameState.players.map((player, index) => {
                if (player.socketId === socketState.socket?.id) {
                    return (
                        <>
                            <div className="board-area-play">
                            </div>
                            <div className="player" key={index}>

                                <div className="player-cards">
                                    {player.startedHand.map((card, cardIndex) => (
                                        <CardGame card={card} key={cardIndex} />
                                    ))}
                                </div>
                                <div className="player-name">{player.name}</div>
                            </div>
                            <div className="board-area-contracts">
                                <button></button><button></button><button></button><button></button><button></button><button></button></div>
                        </>
                    );
                }
                return null;
            })}
        </div>
    );




}

export default Board

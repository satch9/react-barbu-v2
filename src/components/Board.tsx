import React, { useEffect, useState } from 'react'
import { RoomsState } from '../reducers/roomReducers'
import { Player, GameState } from '../reducers/gameReducers';
import toast, { Toaster } from 'react-hot-toast';
import { ISocketContextState } from '../reducers/socketReducers';
import { useMediaQuery } from 'react-responsive';
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

    const [clickedCards, setClickedCards] = useState<string[]>([]);
    console.log("clickedCards", clickedCards)
    // Défini le point de rupture pour mobile
    const isMobile = useMediaQuery({ maxWidth: 480 });

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

    const handleContractChoice = (index: number, player: Player) => {
        console.log("handleContractChoice", index)
        socketState.socket?.emit('contract_choice', index, player);
    }

    const handleCardClicked = (card: string, player: Player) => {
        console.log("clickedCards", clickedCards)
        if (clickedCards.includes(card)) {
            // La carte a déjà été cliquée, ajoutez-la à la div "boards-cards"
            setClickedCards((prevClickedCards) => prevClickedCards.filter((c) => c !== card));
        } else {
            // La carte n'a pas encore été cliquée, ajoutez-la à celles qui ont été cliquées
            setClickedCards((prevClickedCards) => [...prevClickedCards, card]);
        }

        socketState.socket?.emit('card_played', card, player);
    }

    return (
        <div className={`board-container ${isMobile ? 'mobile' : 'desktop'}`}>
            <Toaster />
            {gameState.players.map((player, index) => {
                if (player.socketId === socketState.socket?.id) {
                    return (
                        <>
                            <div className="board-area-play">

                                {
                                    gameState.currentContract && (
                                        <div className="board-chosen-contract">
                                            {gameState.currentContract.name}
                                        </div>
                                    )
                                }

                                {
                                    gameState.currentContract?.name !== "Réussite" && (
                                        <div className="board-cards">
                                            {
                                                player.myHandsDuringGame.map((cardsPlayed, indexCardPlayed) => (
                                                    <div key={indexCardPlayed} className="board-cards-played">
                                                        {
                                                            cardsPlayed
                                                        }
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )
                                }

                                {
                                    gameState.currentContract?.name === "Réussite" && (
                                        <div className="reussite-game">
                                            {
                                                gameState.players.map((player, index) => (
                                                    <div key={index} className="reussite-player">
                                                        {player.name}
                                                        <div className="reussite-cards">
                                                            {Array(13).fill(null).map((card, cardIndex) => (
                                                                <div key={cardIndex} className="reussite-card">
                                                                    {card}
                                                                </div>))
                                                            }
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )
                                }

                            </div>
                            <div className="player" key={index}>

                                <div className="player-cards">
                                    {player.startedHand.map((card, cardIndex) => (
                                        <CardGame
                                            card={card}
                                            key={cardIndex}
                                            onClick={() => handleCardClicked(card, player)}
                                            highlighted={clickedCards.includes(card)} />
                                    ))}
                                </div>
                                <div className="player-name">{player.name}</div>
                            </div>
                            <div className="board-area-contracts">
                                {
                                    gameState.currentPlayer.name === player.name && (
                                        gameState.contracts.map((contract, index) => (
                                            <div className="contract" key={index}>

                                                <button className="contract-button" onClick={() => handleContractChoice(index, player)}>{contract.name}</button>
                                            </div>
                                        ))
                                    )
                                }
                            </div>
                        </>
                    );
                }
                return null;
            })}
        </div>
    );




}

export default Board

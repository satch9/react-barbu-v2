import React, { useCallback, useEffect, useState } from 'react'
import { RoomsState } from '../reducers/roomReducers'
import { Card, Player, GameState } from '../reducers/gameReducers';
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

    const handleCardClicked = useCallback((card: Card | string, player: Player) => {
        console.log("clickedCards", clickedCards)
        console.log("handleCardClicked", card)
        console.log("handleCardClicked player", player)

        const cardIdentifier = typeof card === 'string' ? card : card.suit + card.value;

        if (clickedCards.includes(cardIdentifier)) {
            // La carte a déjà été cliquée, retirez-la de la div "boards-cards"
            console.log("1");
            setClickedCards((prevClickedCards) => prevClickedCards.filter((c) => c !== cardIdentifier));
        } else {
            console.log("2");
            // La carte n'a pas encore été cliquée, ajoutez-la à celles qui ont été cliquées
            setClickedCards((prevClickedCards) => [...prevClickedCards, cardIdentifier]);
        }

        socketState.socket?.emit('card_played', { cardClicked: card, playerClickedCards: player });
    }, [clickedCards, setClickedCards, socketState.socket])

    return (
        <div className={`board-container ${isMobile ? 'mobile' : 'desktop'}`} key={"board-container"}>
            <Toaster />
            {gameState.players.map((player, index) => {
                if (player.socketId === socketState.socket?.id) {
                    return (
                        <>
                            <div className="board-area-play" >

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
                                                player.myHandsDuringGame.map((cardsPlayed: Card, indexCardPlayed: number) => (
                                                    <div key={indexCardPlayed} className="board-cards-played">
                                                        <div className="card">
                                                            <span className={cardsPlayed.suit === '♥' || cardsPlayed.suit === '♦' ? 'suit card-red' : 'suit card-black'}>
                                                                {cardsPlayed.suit}
                                                            </span>
                                                            <span>{cardsPlayed.value}</span>
                                                        </div>

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
                                                gameState.players.map((player, reussiteIndex) => (
                                                    <div key={reussiteIndex} className="reussite-player">
                                                        {player.name}
                                                        <div className="reussite-cards">
                                                            {Array(13).fill(null).map((cardPlacement, cardIndex) => (
                                                                <div key={cardIndex} className="reussite-card">
                                                                    {cardPlacement}
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
                                    {player.startedHand.map((cardStartedHand, cardStartedHandIndex) => (
                                        <CardGame
                                            card={cardStartedHand}
                                            key={cardStartedHandIndex}
                                            onClick={() => handleCardClicked(cardStartedHand, player)}
                                            highlighted={clickedCards.includes(cardStartedHand.suit + cardStartedHand.value)} />
                                    ))}
                                </div>
                                <div className="player-name">{player.name}</div>
                            </div>
                            <div className="board-area-contracts">
                                {
                                    gameState.currentPlayer.name === player.name && (
                                        gameState.contracts.map((contract, contractIndex) => (
                                            <div className="contract" key={contractIndex}>

                                                <button className="contract-button" onClick={() => handleContractChoice(contractIndex, player)}>{contract.name}</button>
                                            </div>
                                        ))
                                    )
                                }
                            </div>
                        </>
                    );
                }else{
                    return (
                        <>
                        
                        </>
                    )
                }
            })}
        </div>
    );




}

export default Board

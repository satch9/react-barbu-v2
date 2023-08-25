type Card = {
    value: string;
    suit: string;
}

type Props = {
    card: Card;
}
const CardGame = ({ card }: Props) => {
    return (
        <div className="card-game">
            <div className="card" >
                <span className={card.suit === '♥' || card.suit === '♦' ? 'suit card-red' : 'suit card-black'}>{card.suit}</span>
                <span>{card.value}</span>

            </div>
        </div>
    )
}

export default CardGame

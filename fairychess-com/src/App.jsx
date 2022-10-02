import { useState } from 'react'
import './App.css'


function range(x) {
    var r = new Array(x);
    for (let i = 0; i < x; i++) {
        r[i] = i;
    }
    return r;
}




function Square(props) {


    return (
        <div
            className={"board-square " + (((props.x + props.y) % 2) ? "square-black" : "square-white")}
            onClick={() => props.handleClick()}
        >

            {props.piece ? props.piece.type + "\n(" + props.piece.player + ")" : ""}

        </div>
    )
}





function Board(props) {

    const b = range(props.height).map((e, y) => {
        return (
            <div className='board-row' key={y}>
                {
                    range(props.width).map((e, x) => {
                        const p = props.pieces.find(p => (p.x == x && p.y == y));

                        return (
                            <Square
                                key={props.width * y + x}
                                x={x}
                                y={y}
                                piece={p}
                                handleClick={()=> props.handleClick(x, y)}
                            />
                        );
                    }, this)
                }
            </div>);
    }, this);

    return (<div className="board">
        {b}
    </div>);


}


function App() {
    const data = `{
        "width": 8,
        "height":8,
        "pieceDefs": [
            {
                "name": "pawn",
                "move": "[1,0]",
                "capture": "[1,1]|"
            },
            {
                "name": "longpawn",
                "move": "[2,0]",
                "capture": "[2,2]|"
            },
            {
                "name": "king",
                "move": "[1,0]|-/",
                "capture": "[1,0]|-/"
            }
        ],
        "pieces":[
            {
                "type": "pawn",
                "player":"white",
                "x": 6,
                "y": 4
            },
            {
                "type":"pawn",
                "player":"white",
                "x": 6,
                "y": 5
            },
            {
                "type":"pawn",
                "player":"black",
                "x": 2,
                "y":2
            },
            {
                "type":"pawn",
                "player":"black",
                "x": 2,
                "y":3
            },
            {
                "type":"longpawn",
                "player":"black",
                "x": 2,
                "y": 5
            }
        ]
    }`;

    const gameData = JSON.parse(data);


    const pieceDefs = gameData.pieceDefs;

    const [pieces, setPieces] = useState(gameData.pieces);
    const [currentPlayer, setCurrentPlayer] = useState("white");
    const [selectedPiece, setSelectedPiece] = useState(null);




    const handleClick = (x, y) => {
        if (selectedPiece) {
            //selecting a place to move the piece to
            const pieceAtLocation = pieces.find(p => (p.x == x && p.y == y));
            if(pieceAtLocation){
                if (pieceAtLocation.player == selectedPiece.player){
                    //we cannot make this move under any circumstance, deselect the piece
                    setSelectedPiece(null);
                    return;
                }else{
                    //TODO
                    //check that we can capture the piece at this location
                }
            }else{
                //TODO
                //test that we can move to this location
                var piecesCopy = pieces.slice(0,pieces.length);
                piecesCopy= piecesCopy.filter((p)=> p.x !=selectedPiece.x || p.y !=selectedPiece.y );
                piecesCopy.push(
                    {
                        type: selectedPiece.type,
                        player: selectedPiece.player,
                        x: x,
                        y:y                        
                    }
                )
                setPieces(piecesCopy);
                setSelectedPiece(null);
            }


        } else {
            //We are selecting a piece to move
            const pieceAtLocation = pieces.find(p => (p.x == x && p.y == y && p.player == currentPlayer));
            if (pieceAtLocation) {
                setSelectedPiece(pieceAtLocation);
            } else {
                //if no piece at location, then this click does nothing
                return;
            }
        }
    };

    return (
        <div >
            <Board
                width={gameData.width}
                height={gameData.height}
                pieces={pieces}
                handleClick={handleClick}
            />
        </div>
    )
}

export default App

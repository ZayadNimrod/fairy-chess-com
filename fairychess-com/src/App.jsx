import { useState, useEffect } from 'react';
import './App.css';
import init, { Board ,Piece, MoveGraph, Path,check_move} from "fairychess-web";

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
            className={"board-square " + (((props.x + props.y) % 2) ? "square-black" : "square-white") + " " + ((props.selected) ? "selected " : " ")}
            onClick={() => props.handleClick()}
        >

            {props.piece ? props.piece.type + "\n(" + props.piece.player + ")" : ""}

        </div>
    )
}





function BoardDisplay(props) {

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
                                handleClick={() => props.handleClick(x, y)}
                                selected={p && p == props.selected}
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
                "x": 2,
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



    //TODO I thnk this can be moved down into the "after WASM loaded" function
    const pcsProcessed = gameData.pieces.map(p => {
        return ({
            type: gameData.pieceDefs.findIndex(d => p.type == d.name),
            player: gameData.pieces.findIndex(d => d.player == p.player),  //TODO black here maps to 2 becuase it is first seen in the THIRD piece - fix this!
            x: p.x,
            y: p.y,
        })
    });




    const [pieces, setPieces] = useState(pcsProcessed);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [selectedPiece, setSelectedPiece] = useState(null);



    const [wasmRef, setWasmRef] = useState(null);
    const [bufferPointer, setBufferPointer] = useState(null);
    const [pieceDefs, setPieceDefs] = useState(null);



    //initilaise the WASM libraray and create the shared memory
    useEffect(() => {
        init().then(
            (wr) => {
                //console.log(wr);
                setWasmRef(wr);
                setBufferPointer(Board.new(gameData.width, gameData.height, currentPlayer, pieces.length));
                const moveDefToPtr=function(d){
                    if (d==null){
                        return null;
                    }else{
                        const p = new MoveGraph(d);
                        return p;
                    }
                };

                const pieceDefsArray = gameData.pieceDefs.map(
                    d => {
                        return ( {
                        name: d.name,
                        move: moveDefToPtr(d.move),
                        capture: moveDefToPtr(d.capture)
                        })
                    }
                );
                console.log(pieceDefsArray);

                setPieceDefs(pieceDefsArray);



            }
        );
    }, []);


    const handleClick = function () {
        if (wasmRef != null) {
            //TODO this function can be optimised give that if we moved a piece at index i, then the first (i-1) elements are unchanged in newPiecesList and the old one
            const updateBoardBuffer = (newPiecesList) => {
                const numberOfPieces = newPiecesList.length;
                //TODO update the number of pieces on the board structure
                const pieceSize = 4;

                const boardBuffer = new Uint8Array(wasmRef.memory.buffer, bufferPointer, numberOfPieces * pieceSize);

                for (let i = 0; i < newPiecesList.length; i++) {
                    const baseIndex = i * pieceSize;
                    const newPiece = newPiecesList[i];
                    boardBuffer[baseIndex] = newPiece.type;
                    boardBuffer[baseIndex + 1] = newPiece.player;
                    boardBuffer[baseIndex + 2] = newPiece.x;
                    boardBuffer[baseIndex + 3] = newPiece.y;
                }

                //log the shared buffer
                console.log(Array.apply([], boardBuffer).join(","));

            };

            //TODO only do this the FIRST time we enter this block, rather than every render!
            updateBoardBuffer(pieces);

            const handleClick = (x, y) => {
                if (selectedPiece) {
                    //selecting a place to move the piece to
                    const pieceAtLocation = pieces.find(p => (p.x == x && p.y == y));
                    if (pieceAtLocation) {
                        if (pieceAtLocation.player == selectedPiece.player) {
                            //we cannot make this move under any circumstance, deselect the piece
                            setSelectedPiece(null);
                            return;
                        } else {
                            //TODO
                            //check that we can capture the piece at this location
                        }
                    } else {
                        //TODO test that we can move to this location
                        console.log(pieceDefs[selectedPiece.type].move);
                        const path = check_move(pieceDefs[selectedPiece.type].move,bufferPointer,selectedPiece.x,selectedPiece.y,x,y);
                        console.log(path);
                        console.log(path.num_moves());
                        if (path.num_moves()>0 ){
                            //the move is valid
                            //TODO an animation that shows the path?
                            var piecesCopy = pieces.slice(0, pieces.length);
                            piecesCopy = piecesCopy.filter((p) => p.x != selectedPiece.x || p.y != selectedPiece.y);
                            piecesCopy.push(
                                {
                                    type: selectedPiece.type,
                                    player: selectedPiece.player,
                                    x: x,
                                    y: y
                                }
                            )
                            setPieces(piecesCopy);
                            setSelectedPiece(null);//TODO force a re-render?
    
                            updateBoardBuffer(piecesCopy, gameData.width, gameData.height);

                        }else{
                            //move was invalid
                            setSelectedPiece(null);
                            return;

                        }
                        
                    }


                } else {
                    //We are selecting a piece to move
                    const pieceAtLocation = pieces.find(p => (p.x == x && p.y == y && p.player == currentPlayer));
                    if (pieceAtLocation) {
                        setSelectedPiece(pieceAtLocation);
                    } else {
                        //if no piece at location, then this click does nothing!                        
                        return;
                    }
                }
            };

            return handleClick;

        } else {
            //move library hasn't loaded yet, so we block interaction by making the click handler a dummy
            return () => { };
        }
    }();


    return (
        <div>
            <BoardDisplay
                width={gameData.width}
                height={gameData.height}
                pieces={pieces}
                handleClick={handleClick}
                selected={selectedPiece}
            />
        </div>
    )




}

export default App

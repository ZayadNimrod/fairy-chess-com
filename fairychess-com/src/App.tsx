import { useState, useEffect } from 'react';
import './App.css';
import init, { Board, MoveGraph, Path, check_move, InitOutput } from "fairychess-web";
import * as React from "react";
import { Piece, PieceDef, Position, testAndExecuteMove } from './chess_lib'
import { WEB_SOCKET_SERVER_PORT, WEB_SOCKET_SERVER_URL } from './net_lib';
//import { WebSocket } from 'ws';

//TODO use https://reactjs.org/docs/context.html so we don't need to pass PieceDefs all the time


function range(x: number): number[] {
    var r = new Array(x);
    for (let i = 0; i < x; i++) {
        r[i] = i;
    }
    return r;
}


function Square(props: {
    key: number,
    x: number
    y: number
    piece: Piece | null,
    handleClick: (() => void),
    selected: boolean,
    pieceDefs: PieceDef[],
}) {


    return (
        <div
            className={"board-square " + (((props.x + props.y) % 2) ? "square-black" : "square-white") + " " + ((props.selected) ? "selected " : " ")}
            onClick={() => props.handleClick()}
        >

            {props.piece ? props.pieceDefs[props.piece.type].name + "\n(" + props.piece.player + ")" : ""}

        </div>
    )
}





function BoardDisplay(props: {
    width: number,
    height: number,
    pieces: Piece[],
    handleClick: ((x: number, y: number) => void),
    selected: Piece | null,
    pieceDefs: PieceDef[],
}) {

    //TODO just realised I'm rendering skewed...
    const b = range(props.height).map((y, i) => {
        return (
            <div className='board-row' key={y}>
                {
                    range(props.width).reverse().map((x, j) => {

                        const p: Piece | null = function () {
                            var p_temp: Piece | undefined = props.pieces.find(p => (p.position.x === x && p.position.y === y));
                            if (p_temp == undefined) { return null; }
                            else { return p_temp; }

                        }();

                        return (
                            <Square
                                key={props.width * y + x}
                                x={x}
                                y={y}
                                piece={p}
                                handleClick={() => props.handleClick(x, y)}
                                selected={p != null && p === props.selected}
                                pieceDefs={props.pieceDefs}
                            />
                        );
                    })
                }
            </div>);
    });

    return (<div className="board">
        {b}
    </div>);


}



function App() {

    const [pieces, setPieces] = useState<Piece[]>([]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);



    const [wasmRef, setWasmRef] = useState<InitOutput | null>(null);
    const [bufferPointer, setBufferPointer] = useState<Board | null>(null);
    const [pieceDefs, setPieceDefs] = useState<PieceDef[]>([]);

    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);

    const [socket,setSocket] = useState<WebSocket> (null);


    //initilaise the WASM library and create the shared memory
    useEffect(() => {
        init().then(
            (wr) => {

                setSocket(new WebSocket(`ws://${WEB_SOCKET_SERVER_URL}:${WEB_SOCKET_SERVER_PORT}`));


                const data = `{
                    "width": 8,
                    "height":8,
                    "pieceDefs": [
                        {
                            "name": "pawn",
                            "move": "[0,1]",
                            "capture": "[1,1]|"
                        },
                        {
                            "name": "longpawn",
                            "move": "[0,2]",
                            "capture": "[2,2]|"
                        },
                        {
                            "name": "king",
                            "move": "[1,0]|-/", 
                            "capture": "{[1,0],[1,1]}|-/"
                        }
                    ],
                    "pieces":[
                        {
                            "type": "pawn",
                            "player":"white",
                            "x": 3,
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



                const gameData: {
                    width: number,
                    height: number,
                    pieceDefs: {
                        name: string,
                        move: string,
                        capture: string
                    }[],
                    pieces: {
                        type: string,
                        player: string,
                        x: number,
                        y: number
                        goal: boolean
                    }[]
                } = JSON.parse(data);

                setWidth(gameData.width);
                setHeight(gameData.height);

                //console.log(wr);
                setWasmRef(wr);
                setBufferPointer(Board.new(gameData.width, gameData.height, currentPlayer, pieces.length));
                const moveDefToPtr = function (d: (string | null)) {
                    if (d == null) {
                        return null;
                    } else {
                        const p = new MoveGraph(d);
                        return p;
                    }
                };

                const pieceDefsArray: PieceDef[] = gameData.pieceDefs.map(
                    d => {
                        return ({
                            name: d.name,
                            move: moveDefToPtr(d.move),
                            capture: moveDefToPtr(d.capture)
                        })
                    }
                );
                //console.log(pieceDefsArray);
                setPieces(gameData.pieces.map(p => {
                    return ({
                        type: gameData.pieceDefs.findIndex(d => p.type === d.name),
                        player: p.player == "white" ? 0 : 1,//TODO more rigourous method than this
                        position: { x: p.x, y: p.y },
                        goal: p.goal,
                    })
                }));
                setPieceDefs(pieceDefsArray);

            }
        );
    }, []);



    //TODO different check than for null perhaps?
    if (wasmRef != null) {
        //TODO this function can be optimised give that if we moved a piece at index i, then the first (i-1) elements are unchanged in newPiecesList and the old one
        const updateBoardBuffer = (newPiecesList: Piece[]) => {
            const numberOfPieces = newPiecesList.length;
            //TODO update the number of pieces on the board structure
            bufferPointer!.set_num_pieces(numberOfPieces);
            const pieceSize = 4;

            const boardBuffer = new Uint8Array(wasmRef.memory.buffer, bufferPointer!.pieces(), numberOfPieces * pieceSize);

            for (let i = 0; i < newPiecesList.length; i++) {
                const baseIndex = i * pieceSize;
                const newPiece = newPiecesList[i];
                boardBuffer[baseIndex] = newPiece.type;
                boardBuffer[baseIndex + 1] = newPiece.player;
                boardBuffer[baseIndex + 2] = newPiece.position.x;
                boardBuffer[baseIndex + 3] = newPiece.position.y;
            }

            //log the shared buffer
            console.log(boardBuffer.join());

        };


        //TODO only do this the FIRST time we enter this block, rather than every render!
        //maybe move up to the post-wasm-load block?
        updateBoardBuffer(pieces);






        const makeMove = (piecesCopy: Piece[], source: Position, target: Position) => {
            //TODO send the move to the server

            socket.send("Made a move!");


            setPieces(piecesCopy);
            setSelectedPiece(null);

            updateBoardBuffer(piecesCopy);

            //flip player
            setCurrentPlayer(currentPlayer == 0 ? 1 : 0);

            return true;
        };


        const handleClick = (x: number, y: number) => {
            const clickedPos: Position = { x: x, y: y };
            if (selectedPiece) {
                //selecting a place to move the piece to
                const wasMoveSuccessful: boolean = testAndExecuteMove(selectedPiece, clickedPos, pieces, pieceDefs, bufferPointer!, makeMove);
                if (wasMoveSuccessful) {
                    //testAndExecute move has exectued the move
                } else {//TODO get reason move could not be made
                    //move could not be made, so deselect the piece to allow player to make a new selection
                    setSelectedPiece(null);
                }

            } else {
                //We are selecting a piece to move
                //TODO so all of a sudden this comparision doesn't work. what the fuck?
                const pieceAtLocation = pieces.find(p => (p.position.x == clickedPos.x && p.position.y == clickedPos.y && p.player == currentPlayer));
                if (pieceAtLocation) {
                    setSelectedPiece(pieceAtLocation);
                } else {
                    //if no piece at location, then this click does nothing!                        
                    return;
                }
            }
        };


        return (
            <div>
                <BoardDisplay
                    width={width}
                    height={height}
                    pieces={pieces}
                    handleClick={handleClick}
                    selected={selectedPiece}
                    pieceDefs={pieceDefs}
                />

                <p>Current player: {currentPlayer}</p>
            </div>
        );


    } else {
        return (
            <div>
                <BoardDisplay
                    width={width}
                    height={height}
                    pieces={pieces}
                    handleClick={() => { }}
                    selected={selectedPiece}
                    pieceDefs={pieceDefs}
                />
            </div>
        );
    }



}

export default App

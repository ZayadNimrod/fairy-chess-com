import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'


function range(x){
    var r = new Array(x);
    for (let i=0;i<x;i++){
        r[i]=i;
    }
    return r;
}




function Square(props){
    return( 
    <div 
        className = {"board-square "+(((props.x+props.y) % 2) ? "square-black" : "square-white")}        
    >

        {props.piece?props.piece.type +"\n(" +props.piece.player+")":""}

    </div> 
    )
}





function Board(props){
    
    const b = range(props.height).map((e, y) => {
        return (
            <div className='board-row' key={y}>
                {
                   range(props.width).map((e, x) => {

                        const p = props.boardState.pieces.find(p => (p.x ==x && p.y==y));
                      
                        return (
                            <Square key = {props.width * y+x} x = {x} y={y} piece = {p}/>
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

    const gameState = {
        pieces: gameData.pieces
    };

    return (
        <div className="App">
            <Board width = {gameData.width}  height = {gameData.height} boardState = {gameState}/>
        </div>
    )
}

export default App

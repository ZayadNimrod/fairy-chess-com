import { Board, MoveGraph, Path, check_move, InitOutput } from "fairychess-web";

export type Piece = {
    type: number,
    player: number,
    x: number,
    y: number,
    goal: boolean,
}

export type PieceDef = {
    name: string,
    move: MoveGraph | null,
    capture: MoveGraph | null,
}




//TODO test that a valid move even exists. Put this check in the validity check for allowing moves in the first place, so they don't get highlighted
//If no valid move exists, then the player has lost!
//TODO actually test this
const isThisPlayerInCheck = (playerId: number, pieces: Piece[], width: number, height: number, pieceDefs: PieceDef[]): boolean => {
    const otherPlayer = playerId == 0 ? 1 : 0;
    //get a pointer to a buffer representing the board in the state represented by `pieces`
    //TODO this buffer could be static, couldn't it, given how often we call this fn, I'd rather not repeatedly have to reallocate it
    const temporaryBufferPtr: Board = Board.new(width, height, playerId, pieces.length);
    //TODO full this buffer


    for (let i = 0; i < pieces.length; i++) {
        const pieceToCheck = pieces[i];
        if (!pieceToCheck.goal) {
            continue;
        }


        //this piece is a king that cannot be allowed to be placed in check, make sure of this
        for (let j = 0; j < pieces.length; j++) {
            const otherPiece = pieces[j];
            if (otherPiece.player != otherPlayer) { continue; }

            const captureMove = pieceDefs[otherPiece.type].capture;
            if (captureMove == null) { continue; }


            //TODO revert this commenting out

            const path = check_move(captureMove, temporaryBufferPtr, otherPiece.x, otherPiece.y, pieceToCheck.x, pieceToCheck.y, false, otherPlayer == 1);

            if (path.num_moves() > 0) {
                //!!!The current player would be placed in check if they made this move!!!
                return true;
            }


        }
    }

    return false;

};


export function testAndExecuteMove(pieceToMove: Piece, targetX: number, targetY: number, pieces: Piece[], pieceDefs: PieceDef[], boardBufferPointer: Board, makeMove: (ps: Piece[]) => void): boolean {
    const currentPlayer = pieceToMove.player;
    const pieceAtClickedLocation = pieces.find(p => (p.x === targetX && p.y === targetY));



    var move: MoveGraph | null;
    var toKeep: (p: Piece) => boolean; //function that tells us which pieces are unchanged by this move



    if (pieceAtClickedLocation) {
        if (pieceAtClickedLocation.player == currentPlayer) {
            //we cannot capture this piece, deselect the piece to allow for the next move
            return false
        } else {
            //this is a capture
            move = pieceDefs[pieceToMove.type].capture;
            toKeep = (p: Piece) => !(p.x == pieceToMove.x && p.y == pieceToMove.y) && !(p.x == pieceAtClickedLocation.x && p.y == pieceAtClickedLocation.y)
        }
    } else {
        //this is an ordinary move
        move = pieceDefs[pieceToMove.type].move;
        toKeep = (p: Piece) => p.x != pieceToMove.x || p.y != pieceToMove.y;
    }






    if (move != null) {
        const path = check_move(move, boardBufferPointer!, pieceToMove.x, pieceToMove.y, targetX, targetY, false, !(currentPlayer == 0));
        if (path.num_moves() > 0) {
            //carry out the move

            //TODO an animation that shows the path?
            var piecesCopy = pieces.slice(0, pieces.length);
            piecesCopy = piecesCopy.filter((p) => toKeep(p));
            piecesCopy.push(
                {
                    type: pieceToMove.type,
                    player: pieceToMove.player,
                    x: targetX,
                    y: targetY,
                    goal: pieceToMove.goal,
                }
            );

            if (!isThisPlayerInCheck(currentPlayer, piecesCopy, boardBufferPointer.width(), boardBufferPointer.height(), pieceDefs)) {
                makeMove(piecesCopy);
                return true;
            } else {
                //the current player would be placed in check if they made this move,
                //so it is illegal
                return false;
            }

        } else {
            //this is not a valid move, reset the move
            return false;
        }
    } else {
        //move does not exist!                
        return false;

    }
};

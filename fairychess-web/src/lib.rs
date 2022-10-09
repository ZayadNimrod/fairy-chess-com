use fairy_chess;

use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
}

//#[wasm_bindgen]
pub fn check_move(
    piece: &fairy_chess::movespec::MoveGraph,
    board: &Board,
    start_position: (i32, i32),
    target_position: (i32, i32),
) -> Option<Vec<(i32, i32)>> {
    fairy_chess::check_move(piece, board, start_position, target_position)
}

/*
//#[wasm_bindgen]
pub fn create_piece(s: &str) -> *const fairy_chess::movespec::MoveGraph {
    fairy_chess::create_piece(s)
        //.unwrap_or_else(|e| {
        //    alert(&format!("error in piece defintion!{}", e));
        //    fairy_chess::create_piece("[1,1]").unwrap_unchecked()
        //})
        //.as_ptr()
        ?
}*/

#[wasm_bindgen]
pub struct Board {
    width: i32,
    height: i32,
    current_player: i32,
    pieces: Vec<Piece>,
}

#[wasm_bindgen]
#[derive(Clone, Default)]
pub struct Piece {
    piece_type: i32,
    player: i32,
    x: i32,
    y: i32,
}

#[wasm_bindgen]
impl Board {
    pub fn new(width: i32, height: i32, current_player: i32, num_pcs: usize) -> Board {
        Board {
            width: width,
            height: height,
            current_player: current_player,
            pieces: vec![Piece::default(); num_pcs],
        }
    }

    pub fn width(&self) -> i32 {
        self.width
    }

    pub fn height(&self) -> i32 {
        self.height
    }

    pub fn pieces(&self) -> *const Piece {
        self.pieces.as_ptr()
    }

    pub fn num_pieces(&self) -> usize {
        self.pieces.len()
    }

    pub fn set_num_pieces(&self, new_size: usize) {
        todo!()
    }
}

impl fairy_chess::Board for Board {
    fn tile_at(&self, position: (i32, i32)) -> fairy_chess::TileState {
        if position.0 < 0 || position.1 < 0 || position.0 >= self.width || position.1 >= self.height
        {
            return fairy_chess::TileState::Impassable;
        }

        let potential_piece = self
            .pieces
            .iter()
            .find(|p| p.x == position.0 && p.y == position.1);
        match potential_piece {
            Some(_) => return fairy_chess::TileState::Impassable,
            None => return fairy_chess::TileState::Empty,
        }
    }
}

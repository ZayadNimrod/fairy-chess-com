use fairy_chess;

use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}

#[wasm_bindgen]
pub fn check_move(
    piece: &MoveGraph,
    board: &Board,
    start_position_x: i32,
    start_position_y: i32,
    target_position_x: i32,
    target_position_y: i32,
) -> Path {
    Path{
        path:  fairy_chess::check_move(&piece.graph, board, (start_position_x,start_position_y), (target_position_x,target_position_y))
    }
}

#[wasm_bindgen]
pub struct Path{
    path: Option<Vec<(i32, i32)>>,
}

#[wasm_bindgen]
impl Path{

    pub fn num_moves(&self)-> usize{
        return self.path.as_ref().map(|a|{a.len()}).unwrap_or(0);
    }

    pub fn get_x(&self, idx:usize)->i32{
        //TODO error handling!!!
        return self.path.as_ref().map(|v|{v[idx]}).map(|(x,y)|{x}).unwrap(); 
    }

    pub fn get_y(&self, idx:usize)->i32{
        //TODO error handling!!!
        return self.path.as_ref().map(|v|{v[idx]}).map(|(x,y)|{y}).unwrap(); 
    }
}

#[wasm_bindgen]
pub struct MoveGraph{
    graph: fairy_chess::movespec::MoveGraph,
}

#[wasm_bindgen]
impl MoveGraph{
    #[wasm_bindgen(constructor)]
    pub fn new(s:&str)-> MoveGraph{
        //TODO error handling!!!
        MoveGraph{
            graph:
            fairy_chess::movespec::MoveGraph::from(fairy_chess::create_piece(s).unwrap())
        } 
    }
}



#[wasm_bindgen]
pub struct Board {
    width: i32,
    height: i32,
    current_player: i32,
    pieces: Vec<Piece>,
}

//#[wasm_bindgen]
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

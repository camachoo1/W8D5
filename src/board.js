// DON'T TOUCH THIS CODE
if (typeof window === 'undefined') {
  var Piece = require('./piece');
}
// DON'T TOUCH THIS CODE

/**
 * Returns a 2D array (8 by 8) with two black pieces at [3, 4] and [4, 3]
 * and two white pieces at [3, 3] and [4, 4]
 */
function _makeGrid() {
  const arr = [];

  for (let i = 0; i < 8; i++) {
    arr[i] = new Array(8);
  }

  arr[3][4] = new Piece('black');
  arr[4][3] = new Piece('black');
  arr[3][3] = new Piece('white');
  arr[4][4] = new Piece('white');

  return arr;
}

/**
 * Constructs a Board with a starting grid set up.
 */
function Board() {
  this.grid = _makeGrid();
}

Board.DIRS = [
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
];

/**
 * Checks if a given position is on the Board.
 */
Board.prototype.isValidPos = function (pos) {
  const [row, col] = pos;

  return row > 7 || col > 7 || row < 0 || col < 0 ? false : true;
};

/**
 * Returns the piece at a given [x, y] position,
 * throwing an Error if the position is invalid.
 */
Board.prototype.getPiece = function (pos) {
  const [row, col] = pos;

  if (this.isValidPos(pos)) {
    return this.grid[row][col];
  } else {
    throw Error('Not valid pos!');
  }
};

/**
 * Checks if the piece at a given position
 * matches a given color.
 */
Board.prototype.isMine = function (pos, color) {
  return this.isOccupied(pos)
    ? this.getPiece(pos).color === color
    : false;
};

/**
 * Checks if a given position has a piece on it.
 */
Board.prototype.isOccupied = function (pos) {
  const [row, col] = pos;

  return this.grid[row][col] instanceof Piece;
};

/**
 * Recursively follows a direction away from a starting position, adding each
 * piece of the opposite color until hitting another piece of the current color.
 * It then returns an array of all pieces between the starting position and
 * ending position.
 *
 * Returns an empty array if it reaches the end of the board before finding another piece
 * of the same color.
 *
 * Returns empty array if it hits an empty position.
 *
 * Returns empty array if no pieces of the opposite color are found.
 */
Board.prototype._positionsToFlip = function (
  pos,
  color,
  dir,
  piecesToFlip = []
) {
  // const [startRow, startCol] = pos;
  // const [endRow, endCol] = dir;
  // let newPos = [startRow + endRow, startCol + endCol];
  const newPos = pos.map((num, idx) => num + dir[idx]);

  if (!this.isValidPos(newPos)) return [];
  if (!piecesToFlip.length && this.isMine(newPos, color)) return [];
  if (!this.isOccupied(newPos)) return [];

  if (!this.isMine(newPos, color)) {
    piecesToFlip.push(newPos);
    let newPiecesToFlip = piecesToFlip;
    return this._positionsToFlip(newPos, color, dir, newPiecesToFlip);
  }

  return piecesToFlip;

  // if (!this.isValidPos(newPos)) {
  //   return [];
  // } else if (!this.isOccupied(newPos)) {
  //   return [];
  // } else if (!piecesToFlip.length && this.isMine(newPos, color)) {
  //   return [];
  // } else if (!this.isMine(newPos, color)) {
  //   piecesToFlip.push(newPos);
  //   let newPiecesToFlip = piecesToFlip;
  //   return this._positionsToFlip(newPos, color, dir, newPiecesToFlip);
  // }
  // return piecesToFlip;
};

/**
 * Checks that a position is not already occupied and that the color
 * taking the position will result in some pieces of the opposite
 * color being flipped.
 */
Board.prototype.validMove = function (pos, color) {
  if (this.isOccupied(pos)) return false;

  for (let i = 0; i < Board.DIRS.length; i++) {
    if (this._positionsToFlip(pos, color, Board.DIRS[i]).length > 0)
      return true;
  }
  return false;
};

/**
 * Adds a new piece of the given color to the given position, flipping the
 * color of any pieces that are eligible for flipping.
 *
 * Throws an error if the position represents an invalid move.
 */
Board.prototype.placePiece = function (pos, color) {
  const [row, col] = pos;

  if (!this.validMove(pos, color)) {
    throw Error('Invalid move!');
  } else {
    this.grid[row][col] = new Piece(color);
  }
  let posToFlip = [];
  for (let i = 0; i < Board.DIRS.length; i++) {
    posToFlip.push(this._positionsToFlip(pos, color, Board.DIRS[i]));
  }

  for (let i = 0; i < posToFlip.length; i++) {
    let subArr = posToFlip[i];
    for (let j = 0; j < subArr.length; j++) {
      this.getPiece(posToFlip[i][j]).flip();
    }
  }
};

/**
 * Produces an array of all valid positions on
 * the Board for a given color.
 */
Board.prototype.validMoves = function (color) {
  let validPos = [];

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let potentialPos = [i, j];
      if (this.validMove(potentialPos, color))
        validPos.push(potentialPos);
    }
  }

  return validPos;
};

/**
 * Checks if there are any valid moves for the given color.
 */
Board.prototype.hasMove = function (color) {
  const validPos = this.validMoves(color);
  return validPos.length === 0 ? false : true;
};

/**
 * Checks if both the white player and
 * the black player are out of moves.
 */
Board.prototype.isOver = function () {
  const blkMovs = this.hasMove('black');
  const whiteMovs = this.hasMove('white');

  return blkMovs && whiteMovs ? false : true;
};

/**
 * Prints a string representation of the Board to the console.
 */
Board.prototype.print = function () {
  console.log(`  01234567`);

  for (let i = 0; i < 8; i++) {
    let row = i + ' ';

    for (let j = 0; j < 8; j++) {
      let pos = [i, j];
      row += this.isOccupied(pos)
        ? this.getPiece(pos).toString()
        : '.';
    }
    console.log(row);
  }
};

// DON'T TOUCH THIS CODE
if (typeof window === 'undefined') {
  module.exports = Board;
}
// DON'T TOUCH THIS CODE

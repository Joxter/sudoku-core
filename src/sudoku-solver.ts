type Board = (number | null)[];

export function isInvalid(
  board: Board,
  index: number,
  num: number,
): number[] | false {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const res = new Set<number>();

  // Check if number already exists in row or column
  for (let i = 0; i < 9; i++) {
    if (board[row * 9 + i] === num) res.add(row * 9 + i);
    if (board[col + 9 * i] === num) res.add(col + 9 * i);
  }
  // Check if number already exists in 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[(startRow + i) * 9 + startCol + j] === num) {
        res.add((startRow + i) * 9 + startCol + j);
      }
    }
  }

  return res.size === 0 ? false : [...res];
}

function solveSudoku(board: Board): number {
  let solutionCount = 0;

  _solveSudoku();

  return solutionCount;

  function _solveSudoku(): boolean {
    for (let i = 0; i < 81; i++) {
      if (board[i]) continue;

      for (let num = 1; num <= 9; num++) {
        if (!isInvalid(board, i, num)) {
          board[i] = num;
          _solveSudoku();
          if (solutionCount > 1) {
            return false;
          }
          board[i] = null;
        }
      }

      return false;
    }
    solutionCount++;
    return solutionCount === 1;
  }
}

export function isUniqueSolution(board: Board): boolean {
  let solutionCount = solveSudoku([...board]);
  return solutionCount === 1;
}

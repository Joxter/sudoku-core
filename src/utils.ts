import {
  BOARD_SIZE,
  CANDIDATES,
  DIFFICULTY_EASY,
  DIFFICULTY_EXPERT,
  DIFFICULTY_HARD,
  DIFFICULTY_MASTER,
  DIFFICULTY_MEDIUM,
  GROUP_OF_HOUSES,
  NULL_CANDIDATE_LIST,
} from "./constants";
import {
  AnalyzeData,
  Board,
  CellValue,
  CombineInfo,
  Difficulty,
  House,
  Houses,
  InternalBoard,
  SolvingStep,
  Strategy,
  StrategyFn,
  Update,
} from "./types";

//array contains function
export const contains = (array: Array<unknown>, object: unknown) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === object) {
      return true;
    }
  }
  return false;
};

export const uniqueArray = (array: Array<number>): Array<number> => {
  const temp: Record<number, unknown> = {};
  for (let i = 0; i < array.length; i++) temp[array[i]] = true;
  const record: number[] = [];
  for (const k in temp) record.push(Number(k));
  return record;
};

/* generateHouseIndexList
 * -----------------------------------------------------------------*/
export const generateHouseIndexList = (boardSize: number): Houses[] => {
  const groupOfHouses: Houses[] = [[], [], []];
  const boxSideSize = Math.sqrt(boardSize);
  for (let i = 0; i < boardSize; i++) {
    const horizontalRow = []; //horizontal row
    const verticalRow = []; //vertical row
    const box = [];
    for (let j = 0; j < boardSize; j++) {
      horizontalRow.push(boardSize * i + j);
      verticalRow.push(boardSize * j + i);

      if (j < boxSideSize) {
        for (let k = 0; k < boxSideSize; k++) {
          const a = Math.floor(i / boxSideSize) * boardSize * boxSideSize;
          const b = (i % boxSideSize) * boxSideSize;
          const boxStartIndex = a + b; //0 3 6 27 30 33 54 57 60

          box.push(boxStartIndex + boardSize * j + k);
        }
      }
    }
    groupOfHouses[0].push(horizontalRow);
    groupOfHouses[1].push(verticalRow);
    groupOfHouses[2].push(box);
  }
  return groupOfHouses;
};

export const isBoardFinished = (board: InternalBoard): boolean => {
  return board.every((cell) => cell.value !== null);
};

const isEasyEnough = (
  difficulty: Difficulty,
  currentDifficulty: Difficulty,
): boolean => {
  switch (currentDifficulty) {
    case DIFFICULTY_EASY:
      return true;
    case DIFFICULTY_MEDIUM:
      return difficulty !== DIFFICULTY_EASY;
    case DIFFICULTY_HARD:
      return difficulty !== DIFFICULTY_EASY && difficulty !== DIFFICULTY_MEDIUM;
    case DIFFICULTY_EXPERT:
      return (
        difficulty !== DIFFICULTY_EASY &&
        difficulty !== DIFFICULTY_MEDIUM &&
        difficulty !== DIFFICULTY_HARD
      );
    case DIFFICULTY_MASTER:
      return (
        difficulty !== DIFFICULTY_EASY &&
        difficulty !== DIFFICULTY_MEDIUM &&
        difficulty !== DIFFICULTY_HARD &&
        difficulty !== DIFFICULTY_EXPERT
      );
  }
};

export const isHardEnough = (
  difficulty: Difficulty,
  currentDifficulty: Difficulty,
): boolean => {
  switch (difficulty) {
    case DIFFICULTY_EASY:
      return true;
    case DIFFICULTY_MEDIUM:
      return currentDifficulty !== DIFFICULTY_EASY;
    case DIFFICULTY_HARD:
      return (
        currentDifficulty !== DIFFICULTY_EASY &&
        currentDifficulty !== DIFFICULTY_MEDIUM
      );
    case DIFFICULTY_EXPERT:
      return (
        currentDifficulty !== DIFFICULTY_EASY &&
        currentDifficulty !== DIFFICULTY_MEDIUM &&
        currentDifficulty !== DIFFICULTY_HARD
      );
    case DIFFICULTY_MASTER:
      return (
        currentDifficulty !== DIFFICULTY_EASY &&
        currentDifficulty !== DIFFICULTY_MEDIUM &&
        currentDifficulty !== DIFFICULTY_HARD &&
        currentDifficulty !== DIFFICULTY_EXPERT
      );
  }
};

export const getRemovalCountBasedOnDifficulty = (difficulty: Difficulty) => {
  switch (difficulty) {
    case DIFFICULTY_EASY:
      return BOARD_SIZE * BOARD_SIZE - 30;
    case DIFFICULTY_MEDIUM:
      return BOARD_SIZE * BOARD_SIZE - 20;
    default:
      return BOARD_SIZE * BOARD_SIZE - 17;
  }
};

/* addValueToCellIndex - does not update UI
          -----------------------------------------------------------------*/
export const addValueToCellIndex = (
  board: InternalBoard,
  cellIndex: number,
  value: CellValue,
) => {
  board[cellIndex].value = value;
  if (value !== null) {
    board[cellIndex].candidates = NULL_CANDIDATE_LIST.slice();
  }
};

export const getRandomCandidateOfCell = (candidates: Array<CellValue>) => {
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};

/* calculateBoardDifficulty
 * --------------
 *  TYPE: solely based on strategies required to solve board (i.e. single count per strategy)
 *  SCORE: distinguish between boards of same difficulty.. based on point system. Needs work.
 * -----------------------------------------------------------------*/
export const calculateBoardDifficulty = (
  usedStrategies: Array<number>,
  strategies: Array<Strategy>,
): { difficulty: Difficulty; score: number } => {
  const validUsedStrategies = usedStrategies.filter(Boolean);
  const totalScore = validUsedStrategies.reduce(
    (accumulatedScore, frequency, i) => {
      const strategy = strategies[i];
      return accumulatedScore + frequency * strategy.score;
    },
    0,
  );
  let difficulty: Difficulty =
    validUsedStrategies.length < 3
      ? DIFFICULTY_EASY
      : validUsedStrategies.length < 4
        ? DIFFICULTY_MEDIUM
        : DIFFICULTY_HARD;

  if (totalScore > 750) difficulty = DIFFICULTY_EXPERT;
  if (totalScore > 2200) difficulty = DIFFICULTY_MASTER;

  return {
    difficulty,
    score: totalScore,
  };
};

// Function to analyze the current state of the board
export function filterAndMapStrategies(
  strategies: Array<Strategy>,
  usedStrategies: Array<number>,
) {
  return strategies
    .map((strategy, i) =>
      usedStrategies[i] !== undefined
        ? { title: strategy.title, freq: usedStrategies[i] }
        : null,
    )
    .filter(Boolean);
}

export function cloneBoard(board: InternalBoard) {
  return board.map((c) => {
    return {
      value: c.value,
      candidates: c.candidates.slice(),
      invalidCandidates: c.invalidCandidates
        ? c.invalidCandidates.slice()
        : c.invalidCandidates,
    };
  });
}

export function isValidAndEasyEnough(
  analysis: AnalyzeData,
  difficulty: Difficulty,
) {
  return (
    analysis.hasSolution &&
    analysis.difficulty &&
    isEasyEnough(difficulty, analysis.difficulty)
  );
}

/* updateCandidatesBasedOnCellsValue
* --------------
* ALWAYS returns false
* -- special compared to other strategies: doesn't step - updates whole board,
in one go. Since it also only updates candidates, we can skip straight to next strategy, since we know that neither this one nor the one(s) before (that only look at actual numbers on board), will find anything new.
* -----------------------------------------------------------------*/
export function updateCandidatesBasedOnCellsValue(board: InternalBoard) {
  const groupOfHousesLength = GROUP_OF_HOUSES.length;

  for (let houseType = 0; houseType < groupOfHousesLength; houseType++) {
    for (let houseIndex = 0; houseIndex < BOARD_SIZE; houseIndex++) {
      const house = GROUP_OF_HOUSES[houseType][houseIndex];
      const candidatesToRemove = getUsedNumbers(house, board);

      for (let cellIndex = 0; cellIndex < BOARD_SIZE; cellIndex++) {
        const cell = board[house[cellIndex]];
        cell.candidates = cell.candidates.filter(
          (candidate) => !candidatesToRemove.includes(candidate),
        );
      }
    }
  }

  return false;
}

/* getUsedNumbers
 * --------------
 *  returns used numbers in a house
 * -----------------------------------------------------------------*/
function getUsedNumbers(house: House, board: InternalBoard) {
  // filter out cells that have values
  return house.map((cellIndex) => board[cellIndex].value).filter(Boolean);
}

/* getRemainingNumbers
 * --------------
 *  returns remaining numbers in a house after removing the used ones
 * -----------------------------------------------------------------*/
export function getRemainingNumbers(
  house: House,
  board: InternalBoard,
): Array<number> {
  const usedNumbers = getUsedNumbers(house, board);

  return CANDIDATES.filter((candidate) => !usedNumbers.includes(candidate));
}

/* getRemainingCandidates
 * --------------
 *  returns list of candidates for cell (with null's removed)
 * -----------------------------------------------------------------*/
function getRemainingCandidates(
  cellIndex: number,
  board: InternalBoard,
): Array<CellValue> {
  return board[cellIndex].candidates.filter((candidate) => candidate !== null);
}

/* getPossibleCellsForCandidate
 * --------------
 *  returns list of possible cells (cellIndex) for candidate (in a house)
 * -----------------------------------------------------------------*/
function getPossibleCellsForCandidate(
  candidate: number,
  house: House,
  board: InternalBoard,
) {
  return house.filter((cellIndex) =>
    board[cellIndex].candidates.includes(candidate),
  );
}

/* hiddenLockedCandidates
 * These strategies are similar to the naked ones, but instead of looking for cells that only contain the group of candidates, they look for candidates that only appear in the group of cells. For example, if in a box, the numbers 2 and 3 only appear in two cells, then even if those cells have other candidates, you know that one of them has to be 2 and the other has to be 3, so you can remove any other candidates from those cells.
 * -----------------------------------------------------------------*/
export function hiddenLockedCandidates(number: number, board: InternalBoard) {
  let combineInfo: Array<{
    candidate: number;
    cells: Array<number>;
  }> = [];
  let minIndexes = [-1];
  function checkLockedCandidates(
    house: House,
    startIndex: number,
  ): Update[] | boolean {
    //log("startIndex: "+startIndex);
    for (
      let i = Math.max(startIndex, minIndexes[startIndex]);
      i <= BOARD_SIZE - number + startIndex;
      i++
    ) {
      //log(i);
      //never check this cell again, in this loop
      minIndexes[startIndex] = i + 1;
      //or in a this loop deeper down in recursions
      minIndexes[startIndex + 1] = i + 1;

      const candidate = i + 1;
      //log(candidate);

      const possibleCells = getPossibleCellsForCandidate(
        candidate,
        house,
        board,
      );

      if (possibleCells.length === 0 || possibleCells.length > number) continue;

      //try adding this candidate and it's possible cells,
      //but first need to check that that doesn't make (unique) amount of
      //possible cells in combineInfo > n
      if (combineInfo.length > 0) {
        const temp = possibleCells.slice();
        for (let a = 0; a < combineInfo.length; a++) {
          const cells = combineInfo[a].cells;
          for (let b = 0; b < cells.length; b++) {
            if (!contains(temp, cells[b])) temp.push(cells[b]);
          }
        }
        if (temp.length > number) {
          //log("combined candidates spread over > n cells");
          continue; //combined candidates spread over > n cells, won't work
        }
      }

      combineInfo.push({ candidate: candidate, cells: possibleCells });

      if (startIndex < number - 1) {
        //still need to go deeper into combo
        const r = checkLockedCandidates(house, startIndex + 1);
        //when we come back, check if that's because we found answer.
        //if so, return with it, otherwise, keep looking
        if (r !== false) return r;
      }
      //check if we match our pattern
      //if we have managed to combine n-1 candidates,
      //(we already know that cellsWithCandidates is <= n)
      //then we found a match!
      if (combineInfo.length === number) {
        //now we need to check whether this eliminates any candidates

        const combinedCandidates = []; //not unique now...
        let cellsWithCandidates: number[] = []; //not unique either..
        for (let x = 0; x < combineInfo.length; x++) {
          combinedCandidates.push(combineInfo[x].candidate);
          cellsWithCandidates = cellsWithCandidates.concat(
            combineInfo[x].cells,
          );
        }

        const candidatesToRemove = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (!contains(combinedCandidates, c + 1))
            candidatesToRemove.push(c + 1);
        }
        //log("candidates to remove:")
        //log(candidatesToRemove);

        //remove all other candidates from cellsWithCandidates
        const cellsUpdated = removeCandidatesFromMultipleCells(
          cellsWithCandidates,
          candidatesToRemove,
          board,
        );

        //if it does remove candidates, we're succeeded!
        if (cellsUpdated.length > 0) {
          //log("hiddenLockedCandidates: ");
          //log(combinedCandidates);

          //filter out duplicates
          return cellsUpdated as Update[];
        }
      }
    }
    if (startIndex > 0) {
      //if we added a value to our combo check, but failed to find pattern, we now need drop that value and go back up in chain and continue to check..
      if (combineInfo.length > startIndex - 1) {
        combineInfo.pop();
      }
    }
    return false;
  }
  //for each type of house..(hor row / vert row / box)
  const groupOfHousesLength = GROUP_OF_HOUSES.length;
  for (let i = 0; i < groupOfHousesLength; i++) {
    //for each such house
    for (let j = 0; j < BOARD_SIZE; j++) {
      const house = GROUP_OF_HOUSES[i][j];
      if (getRemainingNumbers(house, board).length <= number)
        //can't eliminate any candidates
        continue;
      combineInfo = [];
      minIndexes = [-1];

      //checks every combo of n candidates in house, returns pattern, or false
      const result = checkLockedCandidates(house, 0);
      if (result !== false) return result;
    }
  }
  return false; //pattern not found
}

export function nakedCandidatesStrategy(
  number: number,
  board: InternalBoard,
): ReturnType<StrategyFn> | false {
  let combineInfo: Array<CombineInfo> = [];
  let minIndexes = [-1];

  const groupOfHousesLength = GROUP_OF_HOUSES.length;

  for (let i = 0; i < groupOfHousesLength; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const house = GROUP_OF_HOUSES[i][j];

      if (getRemainingNumbers(house, board).length <= number) {
        continue;
      }

      combineInfo = [];
      minIndexes = [-1];

      const result = checkCombinedCandidates(house, 0);

      if (result !== false) {
        return result;
      }
    }
  }

  return false;

  function checkCombinedCandidates(
    house: House,
    startIndex: number,
  ): ReturnType<StrategyFn> | false {
    for (
      let i = Math.max(startIndex, minIndexes[startIndex]);
      i < BOARD_SIZE - number + startIndex;
      i++
    ) {
      minIndexes[startIndex] = i + 1;
      minIndexes[startIndex + 1] = i + 1;

      const cell = house[i];
      const cellCandidates = getRemainingCandidates(cell, board);

      if (cellCandidates.length === 0 || cellCandidates.length > number) {
        continue;
      }

      if (combineInfo.length > 0) {
        const temp = [...cellCandidates];

        for (let a = 0; a < combineInfo.length; a++) {
          const candidates = combineInfo[a].candidates || [];
          for (let b = 0; b < candidates.length; b++) {
            if (!temp.includes(candidates[b])) {
              temp.push(candidates[b]);
            }
          }
        }

        if (temp.length > number) {
          continue;
        }
      }

      combineInfo.push({ cell, candidates: cellCandidates });

      if (startIndex < number - 1) {
        const result = checkCombinedCandidates(house, startIndex + 1);

        if (result !== false) {
          return result;
        }
      }

      if (combineInfo.length === number) {
        const cellsWithCandidates: number[] = [];
        let combinedCandidates: Array<CellValue> = [];

        for (let x = 0; x < combineInfo.length; x++) {
          cellsWithCandidates.push(combineInfo[x].cell);
          combinedCandidates = combinedCandidates.concat(
            combineInfo[x].candidates || [],
          );
        }

        const cellsEffected = house.filter(
          (cell) => !cellsWithCandidates.includes(cell),
        );

        const cellsUpdated = removeCandidatesFromMultipleCells(
          cellsEffected,
          combinedCandidates,
          board,
        );

        if (cellsUpdated.length > 0) {
          return cellsUpdated as Update[];
        }
      }
    }

    if (startIndex > 0) {
      if (combineInfo.length > startIndex - 1) {
        combineInfo.pop();
      }
    }

    return false;
  }
}

// Function to remove certain candidates from multiple cells
function removeCandidatesFromMultipleCells(
  cells: Array<number>,
  candidates: Array<CellValue>,
  board: InternalBoard,
): Array<{ index: number; eliminatedCandidate: number }> {
  const cellsUpdated = [];
  for (let i = 0; i < cells.length; i++) {
    const cellCandidates = board[cells[i]].candidates;

    for (let j = 0; j < candidates.length; j++) {
      const candidate = candidates[j];
      //-1 because candidate '1' is at index 0 etc.
      if (candidate && cellCandidates[candidate - 1] !== null) {
        cellCandidates[candidate - 1] = null; //NOTE: also deletes them from board variable
        cellsUpdated.push({
          index: cells[i],
          eliminatedCandidate: candidate,
        }); //will push same cell multiple times
      }
    }
  }
  return cellsUpdated;
}

/* pointingEliminationStrategy
 * --------------
 * This strategy is used when a certain number appears only in a single row or column within a box. That means this number can be eliminated from the other cells in that row or column that are not in this box. For example, if in a box the number 4 only appears in the cells of the first row, then the number 4 can be removed from the rest of the cells in the first row that are not in this box.
 * -----------------------------------------------------------------*/
export function pointingEliminationStrategy(
  board: InternalBoard,
): ReturnType<StrategyFn> | false {
  const groupOfHousesLength = GROUP_OF_HOUSES.length;

  for (let houseType = 0; houseType < groupOfHousesLength; houseType++) {
    for (let houseIndex = 0; houseIndex < BOARD_SIZE; houseIndex++) {
      const house = GROUP_OF_HOUSES[houseType][houseIndex];
      const digits = getRemainingNumbers(house, board);

      for (let digitIndex = 0; digitIndex < digits.length; digitIndex++) {
        const digit = digits[digitIndex];

        let sameAltHouse = true;
        let houseId = -1;
        let houseTwoId = -1;
        let sameAltTwoHouse = true;
        const cellsWithCandidate: number[] = [];

        for (let cellIndex = 0; cellIndex < house.length; cellIndex++) {
          const cell = house[cellIndex];

          if (contains(board[cell].candidates, digit)) {
            const cellHouses = housesWithCell(cell);
            const newHouseId = houseType === 2 ? cellHouses[0] : cellHouses[2];
            const newHouseTwoId =
              houseType === 2 ? cellHouses[1] : cellHouses[2];

            if (cellsWithCandidate.length > 0) {
              if (newHouseId !== houseId) {
                sameAltHouse = false;
              }
              if (houseTwoId !== newHouseTwoId) {
                sameAltTwoHouse = false;
              }
              if (sameAltHouse === false && sameAltTwoHouse === false) {
                break; //not in the same altHouse (box/row)
              }
            }

            houseId = newHouseId;
            houseTwoId = newHouseTwoId;
            cellsWithCandidate.push(cell);
          }
        }

        if (
          (sameAltHouse || sameAltTwoHouse) &&
          cellsWithCandidate.length > 0
        ) {
          const altHouseType = houseType === 2 ? (sameAltHouse ? 0 : 1) : 2;
          const altHouse =
            GROUP_OF_HOUSES[altHouseType][
              housesWithCell(cellsWithCandidate[0])[altHouseType]
            ];
          const cellsEffected: number[] = [];

          for (let x = 0; x < altHouse.length; x++) {
            if (!cellsWithCandidate.includes(altHouse[x])) {
              cellsEffected.push(altHouse[x]);
            }
          }

          const cellsUpdated = removeCandidatesFromMultipleCells(
            cellsEffected,
            [digit],
            board,
          );

          if (cellsUpdated.length > 0) {
            return cellsUpdated as Update[];
          }
        }
      }
    }
  }

  return false;
}

/* housesWithCell
 * --------------
 *  returns groupOfHouses that a cell belongs to
 * -----------------------------------------------------------------*/
function housesWithCell(cellIndex: number) {
  const boxSideSize = Math.sqrt(BOARD_SIZE);
  const groupOfHouses = [];
  //horizontal row
  const horizontalRow = Math.floor(cellIndex / BOARD_SIZE);
  groupOfHouses.push(horizontalRow);
  //vertical row
  const verticalRow = Math.floor(cellIndex % BOARD_SIZE);
  groupOfHouses.push(verticalRow);
  //box
  const box =
    Math.floor(horizontalRow / boxSideSize) * boxSideSize +
    Math.floor(verticalRow / boxSideSize);
  groupOfHouses.push(box);

  return groupOfHouses;
}

/* openSinglesStrategy
 * --------------
 * This is the simplest strategy. If there's only one empty cell in a row, column, or box (these are all "houses"), the number that goes into that cell has to be the one number that isn't elsewhere in that house.
 * For instance, if a row has the numbers 1 through 8, then the last cell in that row must be 9.
 * -----------------------------------------------------------------*/

export function openSinglesStrategy(
  board: InternalBoard,
  usedStrategies: Array<number>,
  strategies: Array<Strategy>,
  onFinish?: (args: { difficulty: Difficulty; score: number }) => void,
): ReturnType<StrategyFn> {
  const groupOfHouses = GROUP_OF_HOUSES;

  for (let i = 0; i < groupOfHouses.length; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const singleEmptyCell = findSingleEmptyCellInHouse(
        groupOfHouses[i][j],
        board,
      );

      if (singleEmptyCell) {
        return fillSingleEmptyCell(singleEmptyCell, board);
      }

      if (isBoardFinished(board)) {
        onFinish?.(calculateBoardDifficulty(usedStrategies, strategies));
        return true;
      }
    }
  }
  return false;
}

function findSingleEmptyCellInHouse(house: House, board: InternalBoard) {
  const emptyCells = [];

  for (let k = 0; k < BOARD_SIZE; k++) {
    const boardIndex = house[k];
    if (board[boardIndex].value == null) {
      emptyCells.push({ house: house, cellIndex: boardIndex });
      if (emptyCells.length > 1) {
        break;
      }
    }
  }

  // If only one empty cell found
  return emptyCells.length === 1 ? emptyCells[0] : null;
}

function fillSingleEmptyCell(
  emptyCell: {
    house: number[];
    cellIndex: number;
  },
  board: InternalBoard,
  onError?: (args: { message: string }) => void,
) {
  const value = getRemainingNumbers(emptyCell.house, board);

  if (value.length > 1) {
    onError?.({ message: "Board Incorrect" });
    return -1;
  }

  addValueToCellIndex(board, emptyCell.cellIndex, value[0]); //does not update UI
  return [{ index: emptyCell.cellIndex, filledValue: value[0] }];
}

/* visualEliminationStrategy
 * --------------
 * Looks for cells with only one candidate
 * -- returns effectedCells - the updated cell(s), or false
 * -----------------------------------------------------------------*/
export function visualEliminationStrategy(
  board: InternalBoard,
): ReturnType<StrategyFn> | false {
  for (let cellIndex = 0; cellIndex < board.length; cellIndex++) {
    const cell = board[cellIndex];
    const candidates = cell.candidates;

    const possibleCandidates: CellValue[] = [];
    for (
      let candidateIndex = 0;
      candidateIndex < candidates.length;
      candidateIndex++
    ) {
      if (candidates[candidateIndex] !== null) {
        possibleCandidates.push(candidates[candidateIndex]);
      }

      if (possibleCandidates.length > 1) {
        break; // can't find answer here
      }
    }

    if (possibleCandidates.length === 1) {
      const digit = possibleCandidates[0];

      addValueToCellIndex(board, cellIndex, digit);

      return [{ index: cellIndex, filledValue: digit! }]; // one step at a time
    }
  }

  return false;
}

// Function to apply the solving strategies in order
export function applySolvingStrategies(
  {
    strategyIndex = 0,
    analyzeMode = false,
  }: {
    strategyIndex?: number;
    analyzeMode?: boolean;
  } = {},
  board: InternalBoard,
  usedStrategies: Array<number>,
  strategies: Array<Strategy>,
  ons: {
    onError?: (args: { message: string }) => void;
    onFinish?: (args: { difficulty: Difficulty; score: number }) => void;
    onUpdate?: ({ strategy, updates, type }: SolvingStep) => void;
  },
): false | "elimination" | "value" {
  if (isBoardFinished(board)) {
    if (!analyzeMode) {
      ons.onFinish?.(calculateBoardDifficulty(usedStrategies, strategies));
    }
    return false;
  }
  const effectedCells: boolean | -1 | Update[] =
    strategies[strategyIndex].fn(board);

  strategies[strategyIndex].postFn?.(board);

  if (effectedCells === false) {
    if (strategies.length > strategyIndex + 1) {
      return applySolvingStrategies(
        {
          strategyIndex: strategyIndex + 1,
          analyzeMode,
        },
        board,
        usedStrategies,
        strategies,
        ons,
      );
    } else {
      ons.onError?.({ message: "No More Strategies To Solve The Board" });
      return false;
    }
  }
  if (effectedCells === -1) {
    return false;
  }

  if (!analyzeMode) {
    ons.onUpdate?.({
      strategy: strategies[strategyIndex].title,
      updates: effectedCells as Update[],
      type: strategies[strategyIndex].type,
    });
  }

  if (typeof usedStrategies[strategyIndex] === "undefined") {
    usedStrategies[strategyIndex] = 0;
  }

  usedStrategies[strategyIndex] += 1;
  return strategies[strategyIndex].type;
}

export function convertInitialBoardToSerializedBoard(
  _board: Board,
): InternalBoard {
  return new Array(BOARD_SIZE * BOARD_SIZE).fill(null).map((_, i) => {
    const value = _board[i] || null;
    const candidates =
      value === null ? [...CANDIDATES] : [...NULL_CANDIDATE_LIST];

    return { value, candidates };
  });
}

export function setBoardCellWithRandomCandidate(
  cellIndex: number,
  board: InternalBoard,
) {
  updateCandidatesBasedOnCellsValue(board);
  const invalids = board[cellIndex].invalidCandidates || [];
  const candidates = board[cellIndex].candidates.filter(
    (candidate) => Boolean(candidate) && !invalids.includes(candidate),
  );
  if (candidates.length === 0) {
    return false;
  }
  const value = getRandomCandidateOfCell(candidates);
  addValueToCellIndex(board, cellIndex, value);
  return true;
}

export function shuffle<T>(array: T[]) {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

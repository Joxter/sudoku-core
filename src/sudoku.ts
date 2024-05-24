// Importing necessary constants
import {
  DIFFICULTY_MEDIUM,
  BOARD_SIZE,
  CANDIDATES,
  NULL_CANDIDATE_LIST,
  GROUP_OF_HOUSES,
} from "./constants";
import { isUniqueSolution } from "./sudoku-solver";

// Importing necessary types
import {
  Board,
  InternalBoard,
  StrategyFn,
  Strategy,
  Options,
  AnalyzeData,
} from "./types";

// Importing utility functions
import {
  addValueToCellIndex,
  applySolvingStrategies,
  calculateBoardDifficulty,
  cloneBoard,
  contains,
  convertInitialBoardToSerializedBoard,
  filterAndMapStrategies,
  getRemainingNumbers,
  getRemovalCountBasedOnDifficulty,
  hiddenLockedCandidates,
  isBoardFinished,
  isHardEnough,
  isValidAndEasyEnough,
  nakedCandidatesStrategy,
  openSinglesStrategy,
  pointingEliminationStrategy,
  setBoardCellWithRandomCandidate,
  updateCandidatesBasedOnCellsValue,
  visualEliminationStrategy,
} from "./utils";

// Generating list of all houses (rows, columns, and boxes) in the sudoku board

// Function to create a new Sudoku instance
export function createSudokuInstance(options: Options = {}) {
  const {
    onError,
    onUpdate,
    onFinish,
    initBoard,
    difficulty = DIFFICULTY_MEDIUM,
  } = options;

  let board: InternalBoard = [];

  // Define a list to keep track of which strategies have been used to solve the board
  let usedStrategies: Array<number> = [];

  // Function to reset the board variables
  const resetCandidates = () => {
    board = new Array(BOARD_SIZE * BOARD_SIZE).fill(null).map((_, index) => ({
      ...board[index],
      candidates:
        board[index].value == null
          ? CANDIDATES.slice()
          : board[index].candidates,
    }));
  };

  // Define different strategies to solve the Sudoku along with their scores

  const strategies: Array<Strategy> = [
    {
      postFn: updateCandidatesBasedOnCellsValue,
      title: "Open Singles Strategy",
      fn: () =>
        openSinglesStrategy(board, usedStrategies, strategies, onFinish),
      score: 0.1,
      type: "value",
    },
    {
      postFn: updateCandidatesBasedOnCellsValue,
      title: "Visual Elimination Strategy",
      fn: visualEliminationStrategy,
      score: 9,
      type: "value",
    },
    {
      postFn: updateCandidatesBasedOnCellsValue,
      title: "Single Candidate Strategy",
      fn: singleCandidateStrategy,
      score: 8,
      type: "value",
    },
    {
      title: "Naked Pair Strategy",
      fn: nakedPairStrategy,
      score: 50,
      type: "elimination",
    },
    {
      title: "Pointing Elimination Strategy",
      fn: pointingEliminationStrategy,
      score: 80,
      type: "elimination",
    },
    {
      title: "Hidden Pair Strategy",
      fn: hiddenPairStrategy,
      score: 90,
      type: "elimination",
    },
    // {
    //   title: "Naked Triplet Strategy",
    //   fn: nakedTripletStrategy,
    //   score: 100,
    //   type: "elimination",
    // },
    // {
    //   title: "Hidden Triplet Strategy",
    //   fn: hiddenTripletStrategy,
    //   score: 140,
    //   type: "elimination",
    // },
    // {
    //   title: "Naked Quadruple Strategy",
    //   fn: nakedQuadrupleStrategy,
    //   score: 150,
    //   type: "elimination",
    // },
    // {
    //   title: "Hidden Quadruple Strategy",
    //   fn: hiddenQuadrupleStrategy,
    //   score: 280,
    //   type: "elimination",
    // },
  ];

  // prepare "board" variable to work
  const initializeBoard = () => {
    const alreadyEnhanced = board[0] !== null && typeof board[0] === "object";

    if (!alreadyEnhanced) {
      // Enhance board to handle candidates and possibly other params
      board = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
        const value = initBoard?.[index] ?? null;
        const candidates =
          value == null ? [...CANDIDATES] : [...NULL_CANDIDATE_LIST];

        return { value, candidates };
      });
    }
  };

  // Various strategies to solve the Sudoku are defined here

  /* singleCandidateStrategy
   * --------------
   * This strategy looks at houses where a number only appears as a candidate in one cell.
   * If every other cell in a house already contains a number or can't possibly contain a certain number, then that number must go in the one cell where it's still a candidate.
   * For example, if in a row the number 3 can only be placed in the third cell, then it must go there.
   * -----------------------------------------------------------------*/
  function singleCandidateStrategy(): ReturnType<StrategyFn> | false {
    const groupOfHousesLength = GROUP_OF_HOUSES.length;

    for (let houseType = 0; houseType < groupOfHousesLength; houseType++) {
      for (let houseIndex = 0; houseIndex < BOARD_SIZE; houseIndex++) {
        const house = GROUP_OF_HOUSES[houseType][houseIndex];
        const digits = getRemainingNumbers(house, board);

        for (let digitIndex = 0; digitIndex < digits.length; digitIndex++) {
          const digit = digits[digitIndex];
          const possibleCells: number[] = [];

          for (let cellIndex = 0; cellIndex < BOARD_SIZE; cellIndex++) {
            const cell = house[cellIndex];
            const boardCell = board[cell];

            if (contains(boardCell.candidates, digit)) {
              possibleCells.push(cell);

              if (possibleCells.length > 1) {
                break; // we can't determine anything in this case
              }
            }
          }

          if (possibleCells.length === 1) {
            const cellIndex = possibleCells[0];
            addValueToCellIndex(board, cellIndex, digit);

            return [{ index: cellIndex, filledValue: digit }]; // one step at a time
          }
        }
      }
    }

    return false;
  }

  /* nakedCandidatesStrategy
   * These strategies look for a group of 2, 3, or 4 cells in the same house that between them have exactly 2, 3, or 4 candidates. Since those candidates have to go in some cell in that group, they can be eliminated as candidates from other cells in the house. For example, if in a column two cells can only contain the numbers 2 and 3, then in the rest of that column, 2 and 3 can be removed from the candidate lists.
   * -----------------------------------------------------------------*/

  /* nakedPairStrategy
   * --------------
   * These strategies look for a group of 2, 3, or 4 cells in the same house that between them have exactly 2, 3, or 4 candidates. Since those candidates have to go in some cell in that group, they can be eliminated as candidates from other cells in the house. For example, if in a column two cells can only contain the numbers 2 and 3, then in the rest of that column, 2 and 3 can be removed from the candidate lists.
   * -----------------------------------------------------------------*/
  function nakedPairStrategy() {
    return nakedCandidatesStrategy(2, board);
  }

  /* hiddenPairStrategy
   * --------------
   * These strategies are similar to the naked ones, but instead of looking for cells that only contain the group of candidates, they look for candidates that only appear in the group of cells. For example, if in a box, the numbers 2 and 3 only appear in two cells, then even if those cells have other candidates, you know that one of them has to be 2 and the other has to be 3, so you can remove any other candidates from those cells.
   * -----------------------------------------------------------------*/
  function hiddenPairStrategy() {
    return hiddenLockedCandidates(2, board);
  }

  const invalidPreviousCandidateAndStartOver = (cellIndex: number) => {
    const previousIndex = cellIndex - 1;
    board[previousIndex].invalidCandidates =
      board[previousIndex].invalidCandidates || [];

    board[previousIndex].invalidCandidates?.push(board[previousIndex].value);

    addValueToCellIndex(board, previousIndex, null);
    resetCandidates();
    board[cellIndex].invalidCandidates = [];
    generateBoardAnswerRecursively(previousIndex);
  };
  const generateBoardAnswerRecursively = (cellIndex: number) => {
    if (cellIndex + 1 > BOARD_SIZE * BOARD_SIZE) {
      board.forEach((cell) => (cell.invalidCandidates = []));
      return true;
    }
    if (setBoardCellWithRandomCandidate(cellIndex, board)) {
      generateBoardAnswerRecursively(cellIndex + 1);
    } else {
      invalidPreviousCandidateAndStartOver(cellIndex);
    }
  };

  // Function to prepare the game board
  const prepareGameBoard = () => {
    const cells = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => i);
    let removalCount = getRemovalCountBasedOnDifficulty(difficulty);
    while (removalCount > 0 && cells.length > 0) {
      const randIndex = Math.floor(Math.random() * cells.length);
      const cellIndex = cells.splice(randIndex, 1)[0];
      const cellValue = board[cellIndex].value;
      // Remove value from this cell
      addValueToCellIndex(board, cellIndex, null);
      // Reset candidates, only in model.
      resetCandidates();
      const boardAnalysis = analyzeBoard();
      if (
        isValidAndEasyEnough(boardAnalysis, difficulty) &&
        isUniqueSolution(getBoard())
      ) {
        removalCount--;
      } else {
        // Reset - don't dig this cell
        addValueToCellIndex(board, cellIndex, cellValue);
      }
    }
  };

  // Initialization and public methods

  // async function nextTickPromise() {
  //   return new Promise((res) => {
  //     setTimeout(res, 0);
  //   });
  // }

  function analyzeBoard() {
    let usedStrategiesClone = usedStrategies.slice();
    let boardClone = cloneBoard(board);
    let Continue: boolean | "value" | "elimination" = true;
    while (Continue) {
      // await nextTickPromise();
      Continue = applySolvingStrategies(
        {
          strategyIndex: Continue === "elimination" ? 1 : 0,
          analyzeMode: true,
        },
        board,
        usedStrategies,
        strategies,
        {
          onUpdate,
          onFinish,
          onError,
        },
      );
    }
    const data: AnalyzeData = {
      hasSolution: isBoardFinished(board),
      usedStrategies: filterAndMapStrategies(strategies, usedStrategies),
    };

    if (data.hasSolution) {
      const boardDiff = calculateBoardDifficulty(usedStrategies, strategies);
      data.difficulty = boardDiff.difficulty;
      data.score = boardDiff.score;
    }
    usedStrategies = usedStrategiesClone.slice();
    board = boardClone;

    usedStrategiesClone = usedStrategies.slice();
    boardClone = cloneBoard(board);

    let solvedBoard: false | Board = [...getBoard()];
    while (solvedBoard && !solvedBoard.every(Boolean)) {
      solvedBoard = solveStep({ analyzeMode: true, iterationCount: 0 });
    }

    usedStrategies = usedStrategiesClone.slice();
    board = boardClone;
    return data;
  }

  // Function to generate the Sudoku board
  function generateBoard(): Board {
    generateBoardAnswerRecursively(0);

    const slicedBoard = cloneBoard(board);

    function isBoardTooEasy() {
      prepareGameBoard();
      const data = analyzeBoard();
      if (data.hasSolution && data.difficulty) {
        return !isHardEnough(difficulty, data.difficulty);
      }
      return true;
    }

    function restoreBoardAnswer() {
      board = slicedBoard.slice();
    }

    while (isBoardTooEasy()) {
      restoreBoardAnswer();
    }

    updateCandidatesBasedOnCellsValue(board);
    return getBoard();
  }
  const MAX_ITERATIONS = 30; // Set your desired maximum number of iterations

  const solveStep = ({
    analyzeMode = false,
    iterationCount = 0,
  }: {
    analyzeMode?: boolean;
    iterationCount?: number;
  } = {}): Board | false => {
    if (iterationCount >= MAX_ITERATIONS) {
      return false;
    }

    const initialBoard = getBoard().slice();
    applySolvingStrategies({ analyzeMode }, board, usedStrategies, strategies, {
      onUpdate,
      onFinish,
      onError,
    });
    const stepSolvedBoard = getBoard().slice();

    const boardNotChanged =
      initialBoard.filter(Boolean).length ===
      stepSolvedBoard.filter(Boolean).length;
    if (!isBoardFinished(board) && boardNotChanged) {
      return solveStep({ analyzeMode, iterationCount: iterationCount + 1 });
    }
    board = convertInitialBoardToSerializedBoard(stepSolvedBoard);
    updateCandidatesBasedOnCellsValue(board);
    return getBoard();
  };

  const solveAll = (): Board => {
    let Continue: boolean | "value" | "elimination" = true;
    while (Continue) {
      Continue = applySolvingStrategies(
        {
          strategyIndex: Continue === "elimination" ? 1 : 0,
        },
        board,
        usedStrategies,
        strategies,
        {
          onUpdate,
          onFinish,
          onError,
        },
      );
    }
    return getBoard();
  };

  const getBoard = (): Board => board.map((cell) => cell.value);

  if (initBoard) {
    board = convertInitialBoardToSerializedBoard(initBoard);
    updateCandidatesBasedOnCellsValue(board);
    analyzeBoard();
  } else {
    initializeBoard();
    generateBoard();
  }

  return {
    solveAll,
    solveStep,
    analyzeBoard,
    getBoard,
    generateBoard,
  };
}

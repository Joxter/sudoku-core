import {
  DIFFICULTY_EASY,
  DIFFICULTY_EXPERT,
  DIFFICULTY_HARD,
  DIFFICULTY_MASTER,
  DIFFICULTY_MEDIUM,
} from "../src/constants";
import {
  generate,
  analyze,
  solve,
  Difficulty,
  Board,
  hint,
} from "../src/index"; // Import the createSudokuInstance module (update path as needed)
import { isUniqueSolution } from "../src/sudoku-solver";
import {
  EASY_SUDOKU_BOARD_FOR_TEST,
  EXPERT_SUDOKU_BOARD_FOR_TEST,
  HARD_SUDOKU_BOARD_FOR_TEST,
  MASTER_SUDOKU_BOARD_FOR_TEST,
  MEDIUM_SUDOKU_BOARD_FOR_TEST,
} from "./constants";
import {
  arrayToNumber,
  getOnesCnt,
  getRemainingNumbers,
  numberToArray,
  openSinglesStrategy,
  removeCandidates,
  updateCandidatesBasedOnCellsValue,
} from "../src/utils";

// let last = Date.now();
// setInterval(() => {
//   console.log(Date.now() - last);
//   last = Date.now();
// }, 50);

describe("sudoku-core", () => {
  describe("generate method", () => {
    it.skip("should generate a valid easy difficulty board", async () => {
      //Arrange
      const sudokuBoard = await generate({ difficulty: "easy" });

      //Act
      const data = await analyze(sudokuBoard);

      // Assert
      expect(data.difficulty).toBe("easy");
      expect(isUniqueSolution(sudokuBoard)).toBe(true);
    });
    it("should generate a valid medium difficulty board", async () => {
      //Arrange
      const sudokuBoard = await generate({ difficulty: "medium" });

      //Act
      const data = await analyze(sudokuBoard);
      // Assert
      expect(data.difficulty).toBe("medium");
      expect(isUniqueSolution(sudokuBoard)).toBe(true);
    });
    it.skip("should generate a valid hard difficulty board", async () => {
      //Arrange
      const sudokuBoard = await generate({ difficulty: "hard" });

      //Act
      const data = await analyze(sudokuBoard);

      // Assert
      expect(data.difficulty).toBe("hard");
      expect(isUniqueSolution(sudokuBoard)).toBe(true);
    });

    // up to 166 sec
    it.skip("should generate a valid expert difficulty board", async () => {
      //Arrange
      const sudokuBoard = await generate({ difficulty: "expert" });

      //Act
      const data = await analyze(sudokuBoard);

      // Assert
      expect(data.difficulty).toBe("expert");
      expect(isUniqueSolution(sudokuBoard)).toBe(true);
    });

    // up to 15 sec
    it.skip("should generate a valid master difficulty board", async () => {
      //Arrange
      const sudokuBoard = await generate({ difficulty: "master" });

      //Act
      const data = await analyze(sudokuBoard);

      // Assert
      expect(data.difficulty).toBe("master");
      expect(isUniqueSolution(sudokuBoard)).toBe(true);
    });
  });

  describe.skip("solve method", () => {
    const items = [
      [DIFFICULTY_EASY, EASY_SUDOKU_BOARD_FOR_TEST],
      [DIFFICULTY_MEDIUM, MEDIUM_SUDOKU_BOARD_FOR_TEST],
      [DIFFICULTY_HARD, HARD_SUDOKU_BOARD_FOR_TEST],
      [DIFFICULTY_EXPERT, EXPERT_SUDOKU_BOARD_FOR_TEST],
      [DIFFICULTY_MASTER, MASTER_SUDOKU_BOARD_FOR_TEST],
    ] as [Difficulty, Board][];
    items.forEach(([difficulty, sudokuBoard]) => {
      it(`should solve the ${difficulty} board`, async () => {
        //Arrange
        const emptyCellsLength = sudokuBoard.filter(
          (cell) => !Boolean(cell),
        ).length;

        //Act
        const result = await solve(sudokuBoard);
        const steps = result?.steps;
        const solvedBoard = result?.board;
        // Assert
        const filledCellsLength =
          steps?.reduce(
            (acc, curr) =>
              curr.type === "value" ? curr.updates.length + acc : acc,
            0,
          ) || 0;
        expect(filledCellsLength).toBe(emptyCellsLength);
        expect(solvedBoard).toMatchSnapshot();
        expect(steps).toMatchSnapshot();
      });
    });
  });
  describe.skip("hint method", () => {
    const items = [
      [DIFFICULTY_EASY, EASY_SUDOKU_BOARD_FOR_TEST],
      [DIFFICULTY_MEDIUM, MEDIUM_SUDOKU_BOARD_FOR_TEST],
      [DIFFICULTY_HARD, HARD_SUDOKU_BOARD_FOR_TEST],
      [DIFFICULTY_EXPERT, EXPERT_SUDOKU_BOARD_FOR_TEST],
      [DIFFICULTY_MASTER, MASTER_SUDOKU_BOARD_FOR_TEST],
    ] as [Difficulty, Board][];
    items.forEach(([difficulty, sudokuBoard]) => {
      it(`should solve the ${difficulty} board`, async () => {
        //Arrange

        //Act
        const result = await hint(sudokuBoard);

        const steps = result?.steps;
        const solvedBoard = result?.board;
        // Assert
        const filledCellsLength =
          steps?.reduce(
            (acc, curr) =>
              curr.type === "value" ? curr.updates.length + acc : acc,
            0,
          ) || 0;
        expect(filledCellsLength).toBe(1);
        expect(solvedBoard).toMatchSnapshot();
        expect(steps).toMatchSnapshot();
      });
    });
  });
  describe.skip("analyze method", () => {
    it("should invalidate the wrong board", async () => {
      //Arrange
      const sudokuBoard = [1];

      //Act
      const { difficulty, hasSolution, hasUniqueSolution } =
        await analyze(sudokuBoard);

      // Assert
      expect(difficulty).toBe(undefined);
      expect(hasSolution).toBe(false);
      expect(hasUniqueSolution).toBe(false);
    });
    it("should validate the easy board", async () => {
      //Arrange
      const sudokuBoard = [...EASY_SUDOKU_BOARD_FOR_TEST];

      //Act
      const { difficulty } = await analyze(sudokuBoard);

      // Assert
      expect(difficulty).toBe("easy");
      expect(isUniqueSolution(sudokuBoard)).toBe(true);
    });
    it("should validate the medium board", async () => {
      //Arrange
      const sudokuBoard = [...MEDIUM_SUDOKU_BOARD_FOR_TEST];

      //Act
      const { difficulty } = await analyze(sudokuBoard);

      // Assert
      expect(difficulty).toBe("medium");
      expect(isUniqueSolution(sudokuBoard)).toBe(true);
    });
    it("should validate the hard board", async () => {
      //Arrange
      const sudokuBoard = [...HARD_SUDOKU_BOARD_FOR_TEST];

      //Act
      const { difficulty } = await analyze(sudokuBoard);

      // Assert
      expect(difficulty).toBe("hard");
      expect(isUniqueSolution(sudokuBoard)).toBe(true);
    });
    it("should validate the expert board", async () => {
      //Arrange
      const sudokuBoard = [...EXPERT_SUDOKU_BOARD_FOR_TEST];

      //Act
      const { difficulty } = await analyze(sudokuBoard);

      // Assert
      expect(difficulty).toBe("expert");
      expect(isUniqueSolution(sudokuBoard)).toBe(true);
    });
    it("should validate the master board", async () => {
      //Arrange
      const sudokuBoard = [...MASTER_SUDOKU_BOARD_FOR_TEST];

      //Act
      const { difficulty } = await analyze(sudokuBoard);

      // Assert
      expect(difficulty).toBe("master");
      expect(isUniqueSolution(sudokuBoard)).toBe(true);
    });
  });
});

describe("utils", () => {
  it("arrayToNumber", function () {
    expect(arrayToNumber([1, 2, null, 5])).toEqual(0b100110);
  });
  it("numberToArray", function () {
    expect(numberToArray(0b100110)).toEqual([1, 2, 5]);
    expect(numberToArray(0b00100110)).toEqual([1, 2, 5]);
  });
  it("removeCandidates", function () {
    expect(removeCandidates(0b0100110, 0b0101100)).toEqual(0b0000010);
    expect(removeCandidates(0b0100110, 0b1101100)).toEqual(0b0000010);
    expect(removeCandidates(0b0100110, 0b0001100)).toEqual(0b0100010);
    expect(removeCandidates(0b0100110, 0b0000000)).toEqual(0b0100110);
    expect(removeCandidates(0b0100110, 0b1111111)).toEqual(0b0000000);
    expect(~0b0100110).toEqual(0b1011001);
  });
  it("getOnesCnt", function () {
    expect(getOnesCnt(0b100110)).toEqual(3);
    expect(getOnesCnt(0b0)).toEqual(0);
  });
  it("getRemainingNumbers", function () {
    expect(
      getRemainingNumbers(
        [0, 1, 2, 3],
        [{ value: 1 }, { value: 3 }, { value: 6 }, { value: 5 }],
      ),
    ).toEqual(0b1110010100);
  });
});

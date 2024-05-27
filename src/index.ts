import { createSudokuInstance } from "./sudoku";
import { isUniqueSolution } from "./sudoku-solver";
import {
  type AnalyzeData,
  type Board,
  type Difficulty,
  type SolvingStep,
  type SolvingResult,
  Options,
} from "./types";

export { type AnalyzeData, type Board, type Difficulty, type SolvingStep };

export async function analyze(Board: Board): Promise<AnalyzeData> {
  const { analyzeBoard } = await createSudokuInstance({
    initBoard: Board.slice(),
  });
  return {
    ...(await analyzeBoard()),
    hasUniqueSolution: isUniqueSolution(Board),
  };
}

export async function generate(options: Options): Promise<Board> {
  const { getBoard } = await createSudokuInstance(options);
  if (!(await analyze(getBoard())).hasUniqueSolution) {
    return generate(options);
  }
  return getBoard();
}

export async function solve(Board: Board): Promise<SolvingResult> {
  const solvingSteps: SolvingStep[] = [];

  const { solveAll } = await createSudokuInstance({
    initBoard: Board.slice(),
    onUpdate: (solvingStep) => solvingSteps.push(solvingStep),
  });

  const analysis = await analyze(Board);

  if (!analysis.hasSolution) {
    return { solved: false, error: "No solution for provided board!" };
  }

  const board = solveAll();

  if (!analysis.hasUniqueSolution) {
    return {
      solved: true,
      board,
      steps: solvingSteps,
      analysis,
      error: "No unique solution for provided board!",
    };
  }

  return { solved: true, board, steps: solvingSteps, analysis };
}

export async function hint(Board: Board): Promise<SolvingResult> {
  const solvingSteps: SolvingStep[] = [];
  const { solveStep } = await createSudokuInstance({
    initBoard: Board.slice(),
    onUpdate: (solvingStep) => solvingSteps.push(solvingStep),
  });
  const analysis = await analyze(Board);

  if (!analysis.hasSolution) {
    return { solved: false, error: "No solution for provided board!" };
  }
  const board = solveStep();

  if (!board) {
    return { solved: false, error: "No solution for provided board!" };
  }

  if (!analysis.hasUniqueSolution) {
    return {
      solved: true,
      board,
      steps: solvingSteps,
      analysis,
      error: "No unique solution for provided board!",
    };
  }

  return { solved: true, board, steps: solvingSteps, analysis };
}

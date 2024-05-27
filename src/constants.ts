import { generateHouseIndexList } from "./utils";

export const BOARD_SIZE = 9;
export const BOARD_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const CANDIDATES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const NULL_CANDIDATE_LIST: Array<null> = new Array(9).fill(null);

export const GROUP_OF_HOUSES = generateHouseIndexList(BOARD_SIZE);

export const DIFFICULTY_EASY = "easy";
export const DIFFICULTY_MEDIUM = "medium";
export const DIFFICULTY_HARD = "hard";
export const DIFFICULTY_EXPERT = "expert";
export const DIFFICULTY_MASTER = "master";

export const all_difficulties = [
  DIFFICULTY_EASY,
  DIFFICULTY_MEDIUM,
  DIFFICULTY_HARD,
  DIFFICULTY_EXPERT,
  DIFFICULTY_MASTER,
] as const;

export const SOLVE_MODE_STEP = "step";
export const SOLVE_MODE_ALL = "all";

export const REMOVE_CANDIDATES = "REMOVE_CANDIDATES";
export const FILL_CELL = "FILL_CELL";

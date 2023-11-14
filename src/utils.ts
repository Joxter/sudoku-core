import {
  BOARD_SIZE,
  DIFFICULTY_EASY,
  DIFFICULTY_EXPERT,
  DIFFICULTY_HARD,
  DIFFICULTY_MEDIUM,
  NULL_CANDIDATE_LIST,
} from './constants'
import {CellValue, Difficulty, Houses, InternalBoardType} from './types'

//array contains function
export const contains = (array: Array<unknown>, object: unknown) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === object) {
      return true
    }
  }
  return false
}

export const uniqueArray = (array: Array<number>): Array<number> => {
  const temp: Record<number, unknown> = {}
  for (let i = 0; i < array.length; i++) temp[array[i]] = true
  const record: number[] = []
  for (const k in temp) record.push(Number(k))
  return record
}

/* generateHouseIndexList
 * -----------------------------------------------------------------*/
export const generateHouseIndexList = (boardSize: number): Houses[] => {
  const groupOfHouses: Houses[] = [[], [], []]
  const boxSideSize = Math.sqrt(boardSize)
  for (let i = 0; i < boardSize; i++) {
    const horizontalRow = [] //horizontal row
    const verticalRow = [] //vertical row
    const box = []
    for (let j = 0; j < boardSize; j++) {
      horizontalRow.push(boardSize * i + j)
      verticalRow.push(boardSize * j + i)

      if (j < boxSideSize) {
        for (let k = 0; k < boxSideSize; k++) {
          const a = Math.floor(i / boxSideSize) * boardSize * boxSideSize
          const b = (i % boxSideSize) * boxSideSize
          const boxStartIndex = a + b //0 3 6 27 30 33 54 57 60

          box.push(boxStartIndex + boardSize * j + k)
        }
      }
    }
    groupOfHouses[0].push(horizontalRow)
    groupOfHouses[1].push(verticalRow)
    groupOfHouses[2].push(box)
  }
  return groupOfHouses
}

export const isBoardFinished = (board: InternalBoardType): boolean => {
  return new Array(BOARD_SIZE * BOARD_SIZE)
    .fill(null)
    .every((_, i) => board[i].value !== null)
}

export const isEasyEnough = (
  difficulty: Difficulty,
  currentDifficulty: Difficulty,
): boolean => {
  switch (currentDifficulty) {
    case DIFFICULTY_EASY:
      return true
    case DIFFICULTY_MEDIUM:
      return difficulty !== DIFFICULTY_EASY
    case DIFFICULTY_HARD:
      return difficulty !== DIFFICULTY_EASY && difficulty !== DIFFICULTY_MEDIUM
    case DIFFICULTY_EXPERT:
      return (
        difficulty !== DIFFICULTY_EASY &&
        difficulty !== DIFFICULTY_MEDIUM &&
        difficulty !== DIFFICULTY_HARD
      )
  }
}
export const isHardEnough = (
  difficulty: Difficulty,
  currentDifficulty: Difficulty,
): boolean => {
  switch (difficulty) {
    case DIFFICULTY_EASY:
      return true
    case DIFFICULTY_MEDIUM:
      return currentDifficulty !== DIFFICULTY_EASY
    case DIFFICULTY_HARD:
      return (
        currentDifficulty !== DIFFICULTY_EASY &&
        currentDifficulty !== DIFFICULTY_MEDIUM
      )
    case DIFFICULTY_EXPERT:
      return (
        currentDifficulty !== DIFFICULTY_EASY &&
        currentDifficulty !== DIFFICULTY_MEDIUM &&
        currentDifficulty !== DIFFICULTY_HARD
      )
  }
}

export const getRemovalCountBasedOnDifficulty = (difficulty: Difficulty) => {
  switch (difficulty) {
    case DIFFICULTY_EASY:
      return BOARD_SIZE * BOARD_SIZE - 40
    case DIFFICULTY_MEDIUM:
      return BOARD_SIZE * BOARD_SIZE - 30
    default:
      return BOARD_SIZE * BOARD_SIZE - 17
  }
}

/* addValueToCellIndex - does not update UI
          -----------------------------------------------------------------*/
export const addValueToCellIndex = (
  board: InternalBoardType,
  cellIndex: number,
  value: CellValue,
) => {
  return board.map((cell, index) =>
    cellIndex === index
      ? {
          ...cell,
          value: value,
          candidates:
            value !== null
              ? NULL_CANDIDATE_LIST.slice()
              : cell.candidates.slice(),
        }
      : {...cell, candidates: cell.candidates.slice()},
  )
}

import {SudokuInstance} from './sudoku' // Import the SudokuInstance module (update path as needed)

describe('SudokuInstance', () => {
  describe('options', () => {
    describe('difficulty', () => {
      it('should generate a valid easy difficulty board', () => {
        //Arrange
        const sudoku = SudokuInstance({difficulty: 'easy'})

        //Act
        const analyze = sudoku.analyzeBoard()

        // Assert
        expect(analyze.level).toBe('easy')
      })
      it('should generate a valid medium difficulty board', () => {
        //Arrange
        const sudoku = SudokuInstance({difficulty: 'medium'})

        //Act
        const analyze = sudoku.analyzeBoard()

        // Assert
        expect(analyze.level).toBe('medium')
      })
      it('should generate a valid hard difficulty board', () => {
        //Arrange
        const sudoku = SudokuInstance({difficulty: 'hard'})

        //Act
        const analyze = sudoku.analyzeBoard()

        // Assert
        expect(analyze.level).toBe('hard')
      })
      it('should generate a valid expert difficulty board', () => {
        //Arrange
        const sudoku = SudokuInstance({difficulty: 'expert'})

        //Act
        const analyze = sudoku.analyzeBoard()

        // Assert
        expect(analyze.level).toBe('expert')
      })
    })
    describe('initialBoard', () => {
      it('should work with the board passed', () => {
        //Arrange
        const sudoku = SudokuInstance({difficulty: 'hard'})
        const board = sudoku.getBoard()

        //Act
        const newSudoku = SudokuInstance({initBoardData: board})

        // Assert
        const newAnalyze = newSudoku.analyzeBoard()
        const newBoard = newSudoku.getBoard()
        expect(newAnalyze.level).toBe('hard')
        expect(
          newBoard.every((newCell, index) => board[index] == newCell),
        ).toBe(true)
      })
    })
    describe('boardErrorFn', () => {
      it('should be called when passing invalid board', () => {
        //Arrange
        const invalidBoard = [1, 2, 3, 4]
        let errorMessage = ''
        const boardErrorFn = jest.fn(({message}) => {
          errorMessage = message
        })
        const {solveAll} = SudokuInstance({
          initBoardData: invalidBoard,
          boardErrorFn,
        })

        //Act
        solveAll()

        // Assert
        expect(boardErrorFn).toHaveBeenCalled()
        expect(errorMessage).toBe('no more strategies')
      })
    })
    describe('boardUpdatedFn', () => {
      it('should be called when board is changed', () => {
        //Arrange
        let updatedData = {strategy: '', updatedCellsIndexes: []}
        const boardUpdatedFn = jest.fn(args => {
          updatedData = args
        })
        const {solveStep} = SudokuInstance({
          boardUpdatedFn,
        })

        //Act
        solveStep()

        // Assert
        expect(boardUpdatedFn).toHaveBeenCalled()
        expect(
          typeof updatedData.strategy === 'string' &&
            updatedData.strategy.length > 0,
        ).toBe(true)
        // expect(errorMessage).toBe('no more strategies')
      })
    })
    describe('boardFinishedFn', () => {
      it('should be called when board is finished', () => {
        //Arrange
        const boardFinishedFn = jest.fn()
        const {solveAll} = SudokuInstance({
          boardFinishedFn,
        })

        //Act
        solveAll()

        // Assert
        expect(boardFinishedFn).toHaveBeenCalled()
        // expect(errorMessage).toBe('no more strategies')
      })
    })
    it('should be called when board is finished', () => {
      //Arrange
      let finishedData = {level: '', score: 0}
      const boardFinishedFn = jest.fn(args => {
        finishedData = args
      })
      const {solveAll} = SudokuInstance({
        boardFinishedFn,
        difficulty: 'expert',
      })

      //Act
      solveAll()

      // Assert
      expect(boardFinishedFn).toHaveBeenCalled()
      expect(finishedData.level === 'expert').toBe(true)
      // expect(errorMessage).toBe('no more strategies')
    })
  })

  describe('getBoard method', () => {
    it('should return the board', () => {
      //Arrange
      const sudoku = SudokuInstance({difficulty: 'expert'})

      //Act
      const board = sudoku.getBoard()

      // Assert
      expect(board.length === 81).toBe(true)
      board.forEach(cell => {
        expect(typeof cell === 'number' || cell == null).toBe(true)
      })
    })
  })
  describe('solveAll method', () => {
    it('should solve the board', () => {
      //Arrange
      const sudoku = SudokuInstance({difficulty: 'expert'})

      //Act
      sudoku.solveAll()

      // Assert
      const board = sudoku.getBoard()
      expect(board.every(cell => cell !== null)).toBe(true)
    })
  })
  describe('solveStep method', () => {
    it('should solve one more step', () => {
      //Arrange
      const sudoku = SudokuInstance({difficulty: 'expert'})
      const boardBefore = sudoku.getBoard()

      //Act
      sudoku.solveStep()

      // Assert
      const boardAfter = sudoku.getBoard()
      expect(
        boardAfter.filter(cell => cell !== null).length -
          boardBefore.filter(cell => cell !== null).length,
      ).toBe(1)
    })
    it('should do nothing', () => {
      //Arrange
      const sudoku = SudokuInstance({difficulty: 'expert'})
      sudoku.solveAll()

      //Act
      sudoku.solveStep()

      // Assert
      const board = sudoku.getBoard()
      expect(board.filter(cell => cell !== null).length).toBe(81)
    })
  })
})

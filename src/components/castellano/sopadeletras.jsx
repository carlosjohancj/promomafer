import { useState, useEffect, useCallback } from 'preact/hooks';

// --- Configuración del Juego ---
const GRID_SIZE = 12;
const SPANISH_ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
const DIRECTIONS = [
  { dr: 0, dc: 1 },  { dr: 0, dc: -1 }, { dr: 1, dc: 0 },
  { dr: -1, dc: 0 }, { dr: 1, dc: 1 },  { dr: 1, dc: -1 },
  { dr: -1, dc: 1 }, { dr: -1, dc: -1 }
];

function getRandomLetter() {
  return SPANISH_ALPHABET[Math.floor(Math.random() * SPANISH_ALPHABET.length)];
}

function placeWord(grid, word) {
  const wordLength = word.length;
  const shuffledDirections = [...DIRECTIONS].sort(() => Math.random() - 0.5);
  const gridSize = grid.length;

  for (let i = 0; i < 100; i++) {
    const direction = shuffledDirections[i % DIRECTIONS.length];
    const startRow = Math.floor(Math.random() * gridSize);
    const startCol = Math.floor(Math.random() * gridSize);

    let canPlace = true;
    const cellsToPlace = [];

    for (let j = 0; j < wordLength; j++) {
      const currentRow = startRow + j * direction.dr;
      const currentCol = startCol + j * direction.dc;

      if (currentRow < 0 || currentRow >= gridSize || currentCol < 0 || currentCol >= gridSize) {
        canPlace = false;
        break;
      }

      const existingLetter = grid[currentRow][currentCol];
      if (existingLetter !== null && existingLetter !== word[j]) {
        canPlace = false;
        break;
      }
      cellsToPlace.push({ r: currentRow, c: currentCol, letter: word[j] });
    }

    if (canPlace) {
      cellsToPlace.forEach(({ r, c, letter }) => {
        grid[r][c] = letter;
      });
      return cellsToPlace.map(({r, c}) => ({r, c}));
    }
  }
  return null;
}

function generateGrid(words, size) {
  let grid = Array.from({ length: size }, () => Array(size).fill(null));
  const placedWordsData = {};

  const wordsToPlace = words.map(w => w.toUpperCase()).sort((a, b) => b.length - a.length);

  wordsToPlace.forEach(word => {
    const placedCells = placeWord(grid, word);
    if (placedCells) {
      placedWordsData[word] = placedCells;
    }
  });

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = getRandomLetter();
      }
    }
  }

  return { grid, placedWordsData };
}

/**
 * @typedef {Object} Props
 * @property {string[]} words - Array de palabras para la sopa de letras
 */

/**
 * @param {Props} props
 */
export default function SopaDeLetras({ words = [] }) {
  const [grid, setGrid] = useState([]);
  const [wordsToFind, setWordsToFind] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundCells, setFoundCells] = useState(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const initializeGame = useCallback(() => {
    setIsWon(false);
    setSelectedCells([]);
    setFoundCells(new Set());
    setIsSelecting(false);

    const { grid: newGrid, placedWordsData } = generateGrid(words, GRID_SIZE);
    setGrid(newGrid);

    const wordsData = Object.keys(placedWordsData).map(word => ({
      word: word,
      found: false,
      cells: placedWordsData[word] || []
    }));
    setWordsToFind(wordsData);
  }, [words]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (wordsToFind.length > 0 && wordsToFind.every(w => w.found)) {
      setIsWon(true);
    }
  }, [wordsToFind]);

  const handleTouchStart = (r, c) => {
    if (isWon) return;
    setIsSelecting(true);
    setSelectedCells([{ r, c }]);
  };

  const handleTouchMove = (r, c) => {
    if (!isSelecting || isWon) return;
    if (selectedCells.length > 0) {
      const lastCell = selectedCells[selectedCells.length - 1];
      if (lastCell.r === r && lastCell.c === c) return;
    }
    setSelectedCells(prev => [...prev, { r, c }]);
  };

  const handleTouchEnd = () => {
    if (!isSelecting || isWon) return;
    setIsSelecting(false);

    const selectedWordForward = selectedCells.map(({ r, c }) => grid[r][c]).join('');
    const selectedWordBackward = selectedWordForward.split('').reverse().join('');

    let wordFound = false;
    setWordsToFind(prevWords => prevWords.map(wordData => {
      if (!wordData.found && (wordData.word === selectedWordForward || wordData.word === selectedWordBackward)) {
        const actualCells = wordData.cells.map(cell => `${cell.r}-${cell.c}`).sort();
        const selectedPathCells = selectedCells.map(cell => `${cell.r}-${cell.c}`).sort();

        const isCorrectPath = actualCells.length === selectedPathCells.length && 
          actualCells.every((val, index) => val === selectedPathCells[index]);

        if(isCorrectPath) {
          wordFound = true;
          setFoundCells(prevFound => {
            const newFound = new Set(prevFound);
            wordData.cells.forEach(cell => newFound.add(`${cell.r}-${cell.c}`));
            return newFound;
          });
          return { ...wordData, found: true };
        }
      }
      return wordData;
    }));

    setSelectedCells([]);
  };

  const handleMouseLeaveGrid = () => {
    if (isSelecting) {
      setIsSelecting(false);
      setSelectedCells([]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start p-2 md:p-4 w-full">
      <div
        className="grid select-none border border-gray-300 shadow-md bg-white touch-none"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          touchAction: 'none',
        }}
        onMouseLeave={handleMouseLeaveGrid}
     
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const cellId = `${r}-${c}`;
            const isSelected = selectedCells.some(cell => cell.r === r && cell.c === c);
            const isFound = foundCells.has(cellId);

            return (
              <div
                key={cellId}
                className={`
                  w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-gray-200
                  text-lg sm:text-xl font-medium uppercase cursor-pointer
                  ${isFound ? 'bg-green-300 text-green-800' : ''}
                  ${isSelected ? 'bg-blue-300 text-blue-800 ring-2 ring-blue-500' : ''}
                  ${!isFound && !isSelected ? 'bg-white hover:bg-gray-100 text-gray-700' : ''}
                `}
                onMouseDown={() => handleMouseDown(r, c)}
                onMouseEnter={() => handleMouseEnter(r, c)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleTouchStart(r, c);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  handleTouchMove(r, c);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleTouchEnd();
                }}
                onTouchCancel={() => {
                  setIsSelecting(false);
                  setSelectedCells([]);
                }}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>

      <div className="w-full md:w-64 flex-shrink-0">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Palabras a Buscar:</h2>
        <ul className="space-y-1 mb-6">
          {wordsToFind.map(({ word, found }) => (
            <li
              key={word}
              className={`text-base sm:text-lg ${found ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}
            >
              {word}
            </li>
          ))}
        </ul>

        {isWon && (
          <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-center mb-4">
            <p className="font-bold text-lg text-green-700">¡Felicidades!</p>
            <p className="text-green-600">Has encontrado todas las palabras.</p>
          </div>
        )}

        <button
          onClick={initializeGame}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <span>↻</span>
          <span>Nuevo Juego</span>
        </button>
      </div>
    </div>
  );
}
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

  const handleCellMouseDown = (r, c, event) => {
    if (isWon) return;
    event.preventDefault();
    setIsSelecting(true);
    setSelectedCells([{ r, c }]);
  };

  const handleCellMouseEnter = (r, c) => {
    if (isSelecting && !isWon) {
      setSelectedCells(prev => {
        // Evitar duplicados
        if (prev.some(cell => cell.r === r && cell.c === c)) return prev;
        return [...prev, { r, c }];
      });
    }
  };

  const handleCellTouchStart = (r, c, event) => {
    if (isWon) return;
    event.preventDefault();
    setIsSelecting(true);
    setSelectedCells([{ r, c }]);
  };

  const handleCellTouchMove = (r, c, event) => {
    if (isSelecting && !isWon) {
      event.preventDefault();
      const touch = event.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      if (element && element.dataset.row && element.dataset.col) {
        const newR = parseInt(element.dataset.row);
        const newC = parseInt(element.dataset.col);
        if (!selectedCells.some(cell => cell.r === newR && cell.c === newC)) {
          setSelectedCells(prev => [...prev, { r: newR, c: newC }]);
        }
      }
    }
  };

  const handleSelectionEnd = () => {
    if (!isSelecting || isWon) return;
    setIsSelecting(false);

    if (selectedCells.length < 2) {
      setSelectedCells([]);
      return;
    }

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

  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start p-1 md:p-4 w-full max-w-screen">
      <div
        className="grid select-none border border-gray-300 shadow-md bg-white mx-auto touch-pan-y touch-pinch-zoom"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          maxWidth: '100%',
          overflow: 'hidden',
          touchAction: 'pan-y pinch-zoom'
        }}
        onMouseUp={handleSelectionEnd}
        onMouseLeave={handleSelectionEnd}
        onTouchEnd={handleSelectionEnd}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const cellId = `${r}-${c}`;
            const isSelected = selectedCells.some(cell => cell.r === r && cell.c === c);
            const isFound = foundCells.has(cellId);

            return (
              <div
                key={cellId}
                data-row={r}
                data-col={c}
                className={`
                  w-6 h-6 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-200
                  text-sm sm:text-lg md:text-xl font-medium uppercase cursor-pointer
                  ${isFound ? 'bg-green-300 text-green-800' : ''}
                  ${isSelected ? 'bg-blue-300 text-blue-800 ring-1 ring-blue-500' : ''}
                  ${!isFound && !isSelected ? 'bg-white hover:bg-gray-100 text-gray-700' : ''}
                `}
                onMouseDown={(e) => handleCellMouseDown(r, c, e)}
                onMouseEnter={() => handleCellMouseEnter(r, c)}
                onTouchStart={(e) => handleCellTouchStart(r, c, e)}
                onTouchMove={(e) => handleCellTouchMove(r, c, e)}
                onContextMenu={(e) => e.preventDefault()}
              >
                {letter}
              </div>
            );
          })
        )}
      </div>

      <div className="w-full md:w-56 flex-shrink-0 px-2">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Palabras:</h2>
        <ul className="grid grid-cols-2 gap-1 mb-4">
          {wordsToFind.map(({ word, found }) => (
            <li
              key={word}
              className={`text-xs sm:text-sm ${found ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}
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

        {typeof window !== 'undefined' && window.innerWidth < 640 && (
          <div className="md:hidden bg-yellow-100 text-yellow-800 p-2 text-center text-sm mb-2">
            ⤷ Gira tu teléfono para mejor visualización
          </div>
        )}

        <button
          onClick={initializeGame}
          className="flex items-center justify-center gap-1 w-full px-2 py-1 sm:px-4 sm:py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm sm:text-base"
        >
          <span>↻</span>
          <span>Nuevo Juego</span>
        </button>
      </div>
    </div>
  );
}
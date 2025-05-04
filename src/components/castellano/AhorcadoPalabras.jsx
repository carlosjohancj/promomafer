import { useState, useEffect } from 'preact/hooks';

const words = [
  { word: "AMISTAD", category: "Valor" },
  { word: "FAMILIA", category: "Personas" },
  { word: "ESCUELA", category: "Lugar" },
  { word: "MAESTRO", category: "Persona" },
  { word: "COMPAÑERO", category: "Persona" },
  { word: "BIBLIOTECA", category: "Lugar" },
  { word: "RESPETO", category: "Valor" },
  { word: "DIVERSIÓN", category: "Sentimiento" }
];

const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

export default function AhorcadoPalabras() {
  const [currentWordObj, setCurrentWordObj] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing"); // playing, won, lost
  
  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);
  
  const startNewGame = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    setCurrentWordObj(words[randomIndex]);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameStatus("playing");
  };
  
  const handleLetterClick = (letter) => {
    if (guessedLetters.includes(letter) || gameStatus !== "playing") {
      return;
    }
    
    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);
    
    if (!currentWordObj.word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      if (newWrongGuesses >= 6) {
        setGameStatus("lost");
      }
    } else {
      // Check if all letters in the word have been guessed
      const allLettersGuessed = [...currentWordObj.word].every(
        (letter) => newGuessedLetters.includes(letter)
      );
      
      if (allLettersGuessed) {
        setGameStatus("won");
      }
    }
  };
  
  const renderWord = () => {
    if (!currentWordObj) return null;
    
    return (
      <div className="flex justify-center mb-6 space-x-2">
        {[...currentWordObj.word].map((letter, index) => (
          <div
            key={index}
            className="w-10 h-10 border-b-4 border-spanish-dark flex items-center justify-center"
          >
            <span
              className={`text-2xl font-bold ${
                guessedLetters.includes(letter) || gameStatus === "lost"
                  ? "text-spanish-dark"
                  : "opacity-0"
              }`}
            >
              {letter}
            </span>
          </div>
        ))}
      </div>
    );
  };
  
  const renderHangman = () => {
    return (
      <div className="w-48 h-64 mx-auto mb-6 relative">
        {/* Base */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-spanish-dark"></div>
        
        {/* Pole */}
        <div className="absolute bottom-0 left-1/4 w-2 h-60 bg-spanish-dark"></div>
        
        {/* Top */}
        <div className="absolute top-0 left-1/4 w-32 h-2 bg-spanish-dark"></div>
        
        {/* Rope */}
        <div className="absolute top-0 right-1/4 w-2 h-8 bg-spanish-dark"></div>
        
        {/* Head */}
        {wrongGuesses >= 1 && (
          <div className="absolute top-8 right-1/4 -mr-5 w-12 h-12 rounded-full border-4 border-spanish-dark"></div>
        )}
        
        {/* Body */}
        {wrongGuesses >= 2 && (
          <div className="absolute top-20 right-1/4 w-2 h-20 bg-spanish-dark -mr-1"></div>
        )}
        
        {/* Left arm */}
        {wrongGuesses >= 3 && (
          <div className="absolute top-24 right-1/4 w-12 h-2 bg-spanish-dark -mr-12 rotate-45 origin-right"></div>
        )}
        
        {/* Right arm */}
        {wrongGuesses >= 4 && (
          <div className="absolute top-24 right-1/4 w-12 h-2 bg-spanish-dark mr-10 -rotate-45 origin-left"></div>
        )}
        
        {/* Left leg */}
        {wrongGuesses >= 5 && (
          <div className="absolute top-40 right-1/4 w-14 h-2 bg-spanish-dark -mr-13 rotate-45 origin-right"></div>
        )}
        
        {/* Right leg */}
        {wrongGuesses >= 6 && (
          <div className="absolute top-40 right-1/4 w-14 h-2 bg-spanish-dark mr-11 -rotate-45 origin-left"></div>
        )}
      </div>
    );
  };
  
  const renderKeyboard = () => {
    return (
      <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
        {[...alphabet].map((letter) => (
          <button
            key={letter}
            onClick={() => handleLetterClick(letter)}
            disabled={guessedLetters.includes(letter) || gameStatus !== "playing"}
            className={`w-10 h-10 rounded-lg font-bold text-lg ${
              guessedLetters.includes(letter)
                ? currentWordObj.word.includes(letter)
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
                : "bg-spanish-light text-spanish-dark hover:bg-spanish-DEFAULT hover:text-white"
            } transition-colors duration-300`}
          >
            {letter}
          </button>
        ))}
      </div>
    );
  };
  
  const renderGameStatus = () => {
    if (gameStatus === "won") {
      return (
        <div className="text-center my-6 p-4 bg-green-100 rounded-xl">
          <h2 className="text-2xl font-bold text-green-700 mb-2">¡Felicidades!</h2>
          <p className="mb-4">Has adivinado la palabra correctamente.</p>
          <button
            onClick={startNewGame}
            className="bg-spanish-DEFAULT hover:bg-spanish-dark text-white font-bold py-2 px-6 rounded-full transition-colors duration-300"
          >
            Jugar otra vez
          </button>
        </div>
      );
    } else if (gameStatus === "lost") {
      return (
        <div className="text-center my-6 p-4 bg-red-100 rounded-xl">
          <h2 className="text-2xl font-bold text-red-700 mb-2">¡Oh no!</h2>
          <p className="mb-2">No has podido adivinar la palabra.</p>
          <p className="mb-4">La palabra era: {currentWordObj?.word}</p>
          <button
            onClick={startNewGame}
            className="bg-spanish-DEFAULT hover:bg-spanish-dark text-white font-bold py-2 px-6 rounded-full transition-colors duration-300"
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }
    
    return null;
  };
  
  if (!currentWordObj) return <div>Cargando...</div>;
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6 text-center">
        <p className="text-spanish-dark font-bold mb-2">Categoría: {currentWordObj.category}</p>
        <p className="text-gray-600">Intentos fallidos: {wrongGuesses}/6</p>
      </div>
      
      {renderHangman()}
      {renderWord()}
      {renderGameStatus()}
      {renderKeyboard()}
    </div>
  );
}
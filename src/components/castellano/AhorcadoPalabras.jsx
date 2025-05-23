import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import * as d3 from 'd3';

const words = [
  { word: "AMISTAD", category: "Valor", hint: "Cuando te llevas bien con tus amigos" },
  { word: "FAMILIA", category: "Personas", hint: "Papá, mamá, hermanos, abuelos..." },
  { word: "ESCUELA", category: "Lugar", hint: "Donde vas a aprender cada día" },
  { word: "MAESTRO", category: "Persona", hint: "Te enseña cosas nuevas en clase" },
  { word: "COMPAÑERO", category: "Persona", hint: "Está en tu mismo salón de clases" },
  { word: "BIBLIOTECA", category: "Lugar", hint: "Tiene muchos libros para leer" },
  { word: "RESPETO", category: "Valor", hint: "Tratar bien a los demás" },
  { word: "DIVERSION", category: "Actividad", hint: "Cuando juegas y te ríes mucho" }
];

const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

export default function AhorcadoPalabras() {
  const [currentWordObj, setCurrentWordObj] = useState(() => 
    words[Math.floor(Math.random() * words.length)]
  );
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState("playing");
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [error, setError] = useState(null);

  // Validate word data on mount
  useEffect(() => {
    if (!currentWordObj?.word || currentWordObj.word.length === 0) {
      setError('No se pudo cargar la palabra');
      return;
    }
    setError(null);
  }, [currentWordObj]);

  // Manejo de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      const letter = e.key.toUpperCase();
      if (alphabet.includes(letter) && gameStatus === "playing") {
        handleLetterClick(letter);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [guessedLetters, gameStatus]);

  const startNewGame = () => {
    try {
      const randomIndex = Math.floor(Math.random() * words.length);
      if (randomIndex < 0 || randomIndex >= words.length) {
        throw new Error('Índice fuera de rango');
      }
      setCurrentWordObj(words[randomIndex]);
      setGuessedLetters([]);
      setWrongGuesses(0);
      setGameStatus("playing");
      setShowHint(false);
      setHintUsed(false);
    } catch (err) {
      setError(err.message);
      console.error('Error al iniciar nuevo juego:', err);
    }
  };

  const handleLetterClick = useCallback((letter) => {
    if (guessedLetters.includes(letter)) return;
    if (!alphabet.includes(letter)) return;

    setGuessedLetters(prev => [...prev, letter]);
    
    if (!currentWordObj.word.includes(letter)) {
      setWrongGuesses(prev => {
        const newWrong = prev + 1;
        if (newWrong >= 6) {
          setGameStatus("lost");
          return newWrong;
        }
        return newWrong;
      });
    } else {
      const won = [...currentWordObj.word].every(l => [...guessedLetters, letter].includes(l));
      if (won) setGameStatus("won");
    }
  }, [guessedLetters, currentWordObj, alphabet]);

  const handleShowHint = () => {
    if (!hintUsed) {
      setShowHint(true);
      setHintUsed(true);
      // Penalización por usar pista
      setWrongGuesses(prev => Math.min(prev + 1, 6));
    }
  };

  const renderWord = () => (
    <div className="flex justify-center mb-6 space-x-2" role="list" aria-label="Palabra actual">
      {[...currentWordObj.word].map((letter, i) => (
        <div 
          key={`${letter}-${i}`} 
          className="w-10 h-12 border-b-4 border-indigo-600 flex items-center justify-center relative"
          role="listitem"
          aria-label={`Letra ${letter} ${guessedLetters.includes(letter) ? 'revelada' : 'oculta'}`}
        >
          <span className={`text-3xl font-bold transition-all duration-500 ${ 
            guessedLetters.includes(letter) || gameStatus !== "playing"
              ? 'text-indigo-800 opacity-100 animate-bounce-in'
              : 'opacity-0'
          }`}>
            {letter}
          </span>
          {/* Línea decorativa */}
          <div className={`absolute bottom-0 h-1 bg-indigo-300 transition-all duration-300 ${
            guessedLetters.includes(letter) || gameStatus !== "playing"
              ? 'w-0 opacity-0'
              : 'w-8 opacity-100'
          }`} />
        </div>
      ))}
    </div>
  );

  const HangmanSVG = () => {
    const svgRef = useRef();

    useEffect(() => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Limpiar
      
      // Dibujar estructura del ahorcado
      svg.append("rect")
        .attr("x", 10).attr("y", 180)
        .attr("width", 120).attr("height", 5)
        .attr("fill", "#4b5563"); // Base

      svg.append("rect")
        .attr("x", 20).attr("y", 20)
        .attr("width", 5).attr("height", 160)
        .attr("fill", "#4b5563"); // Poste

      svg.append("rect")
        .attr("x", 20).attr("y", 20)
        .attr("width", 80).attr("height", 5)
        .attr("fill", "#4b5563"); // Travesaño

      svg.append("rect")
        .attr("x", 100).attr("y", 20)
        .attr("width", 5).attr("height", 30)
        .attr("fill", "#92400e"); // Cuerda

      // Partes del cuerpo
      if(wrongGuesses >= 1) {
        svg.append("circle")
          .attr("cx", 102.5).attr("cy", 65)
          .attr("r", 15)
          .attr("stroke", "#1e293b")
          .attr("stroke-width", 3)
          .attr("fill", "none");
      }
      
      if(wrongGuesses >= 2) {
        svg.append("rect")
          .attr("x", 100).attr("y", 80)
          .attr("width", 5).attr("height", 60)
          .attr("fill", "#1e293b"); // Cuerpo
      }
      
      if(wrongGuesses >= 3) {
        svg.append("line")
          .attr("x1", 105).attr("y1", 90)
          .attr("x2", 140).attr("y2", 110)
          .attr("stroke", "#1e293b")
          .attr("stroke-width", 3); // Brazo derecho
      }
      
      if(wrongGuesses >= 4) {
        svg.append("line")
          .attr("x1", 105).attr("y1", 90)
          .attr("x2", 70).attr("y2", 110)
          .attr("stroke", "#1e293b")
          .attr("stroke-width", 3); // Brazo izquierdo
      }
      
      if(wrongGuesses >= 5) {
        svg.append("line")
          .attr("x1", 105).attr("y1", 140)
          .attr("x2", 140).attr("y2", 180)
          .attr("stroke", "#1e293b")
          .attr("stroke-width", 3); // Pierna derecha
      }
      
      if(wrongGuesses >= 6) {
        svg.append("line")
          .attr("x1", 105).attr("y1", 140)
          .attr("x2", 70).attr("y2", 180)
          .attr("stroke", "#1e293b")
          .attr("stroke-width", 3); // Pierna izquierda
      }
    }, [wrongGuesses]);

    return (
      <div className="flex justify-center mb-6">
        <svg 
          ref={svgRef} 
          width="200" 
          height="200" 
          viewBox="0 0 200 200"
          className="drop-shadow-md"
        ></svg>
      </div>
    );
  };

  const renderKeyboard = () => (
    <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto px-4" role="group" aria-label="Teclado virtual">
      {[...alphabet].map(letter => (
        <button
          key={letter}
          onClick={() => handleLetterClick(letter)}
          disabled={guessedLetters.includes(letter) || gameStatus !== "playing"}
          aria-label={`Letra ${letter}`}
          aria-disabled={guessedLetters.includes(letter) || gameStatus !== "playing"}
          className={`w-10 h-10 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
            guessedLetters.includes(letter)
              ? currentWordObj.word.includes(letter)
                ? 'bg-green-500 text-white shadow-green'
                : 'bg-red-500 text-white shadow-red'
              : 'bg-yellow-300 text-gray-800 hover:bg-yellow-400 shadow-md'
          } ${
            guessedLetters.includes(letter) ? 'scale-90' : ''
          }`}
        >
          {letter}
        </button>
      ))}
    </div>
  );

  const renderGameStatus = () => {
    if (gameStatus === "won") return (
      <div className="text-center my-6 p-6 bg-gradient-to-r from-green-100 to-green-50 rounded-2xl border-2 border-green-300 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-green-700 mb-3">¡Ganaste! 🎉</h2>
        <p className="text-lg mb-4">¡Muy bien adivinado!</p>
        <button
          onClick={startNewGame}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
        >
          Jugar otra vez
        </button>
      </div>
    );

    if (gameStatus === "lost") return (
      <div className="text-center my-6 p-6 bg-gradient-to-r from-red-100 to-red-50 rounded-2xl border-2 border-red-300 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-red-700 mb-3">¡Oh no! 😢</h2>
        <p className="text-lg mb-2">La palabra era:</p>
        <p className="text-2xl font-bold text-red-800 mb-4 animate-pulse">{currentWordObj.word}</p>
        <button
          onClick={startNewGame}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
        >
          Intentar de nuevo
        </button>
      </div>
    );

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-4" role="application" aria-label="Juego del Ahorcado">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Ahorcado de Palabras</h1>
        <p className="text-gray-600 mb-4">Categoría: {currentWordObj?.category}</p>
      </div>
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-indigo-700 mb-2 animate-bounce">Ahorcado</h1>
        <div className="flex justify-between items-center mb-4">
          <div className="text-left">
            <p className="text-lg font-semibold text-indigo-800">Categoría: 
              <span className="ml-2 px-3 py-1 bg-indigo-100 rounded-full text-indigo-700">
                {currentWordObj.category}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-700">Errores: 
              <span className={`ml-2 px-3 py-1 rounded-full font-bold ${
                wrongGuesses < 3 ? 'bg-green-100 text-green-700' : 
                wrongGuesses < 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>
                {wrongGuesses}/6
              </span>
            </p>
          </div>
        </div>
        
        {/* Botón de pista */}
        <button
          onClick={handleShowHint}
          disabled={hintUsed || gameStatus !== "playing"}
          className={`mt-2 mb-4 px-4 py-2 rounded-full font-bold transition-all ${
            hintUsed 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-500 hover:bg-purple-600 text-white transform hover:scale-105 shadow-md'
          }`}
        >
          {hintUsed ? 'Pista usada' : '¿Necesitas ayuda?'}
        </button>
        
        {/* Mostrar pista */}
        {showHint && (
          <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl animate-fade-in">
            <p className="text-blue-800 font-medium">
              <span className="font-bold text-blue-600">Pista:</span> {currentWordObj.hint}
            </p>
          </div>
        )}
      </header>
      
      <HangmanSVG />
      {renderWord()}
      {renderGameStatus()}
      {renderKeyboard()}

      <footer className="mt-8 text-center text-sm text-gray-600">
        <p>✨ Presiona las letras o usa tu teclado ✨</p>
      </footer>
    </div>
  );
}
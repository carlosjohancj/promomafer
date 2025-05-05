import { useState, useEffect } from 'preact/hooks';

// Colores con sus nombres en inglés y español
const COLORS = [
  { name: "Red", hex: "#FF5252", spanish: "Rojo" },
  { name: "Blue", hex: "#4285F4", spanish: "Azul" },
  { name: "Green", hex: "#0F9D58", spanish: "Verde" },
  { name: "Yellow", hex: "#FFB900", spanish: "Amarillo" },
  { name: "Orange", hex: "#FF7043", spanish: "Naranja" },
  { name: "Purple", hex: "#9C27B0", spanish: "Morado" },
  { name: "Pink", hex: "#FF4081", spanish: "Rosa" },
  { name: "Brown", hex: "#795548", spanish: "Marrón" },
  { name: "Black", hex: "#212121", spanish: "Negro" },
  { name: "White", hex: "#F5F5F5", spanish: "Blanco" },
  { name: "Gray", hex: "#9E9E9E", spanish: "Gris" }
];

// Modos de juego
const MODES = {
  IDENTIFY: 'identify',
  SPELL: 'spell',
  LISTEN: 'listen'
};

// Textos traducidos
const TEXTS = {
  title: {
    en: "Learn Colors in English!",
    es: "¡Aprende los Colores en Inglés!"
  },
  instructions: {
    en: "Choose a game mode:",
    es: "Elige un modo de juego:"
  },
  modes: {
    identify: {
      en: "Identify",
      es: "Identificar",
      desc: {
        en: "Choose the correct color name",
        es: "Elige el nombre correcto del color"
      }
    },
    spell: {
      en: "Spell",
      es: "Deletrear",
      desc: {
        en: "Type the color name",
        es: "Escribe el nombre del color"
      }
    },
    listen: {
      en: "Listen",
      es: "Escuchar",
      desc: {
        en: "Identify the color you hear",
        es: "Identifica el color que escuchas"
      }
    }
  },
  questions: {
    identify: {
      en: "What color is this?",
      es: "¿Qué color es este?"
    },
    spell: {
      en: "Spell this color:",
      es: "Deletrea este color:"
    },
    listen: {
      en: "What color did you hear?",
      es: "¿Qué color escuchaste?"
    }
  },
  inSpanish: {
    en: "In Spanish:",
    es: "En español:"
  },
  placeholder: {
    en: "Type the color",
    es: "Escribe el color"
  },
  check: {
    en: "Check",
    es: "Comprobar"
  },
  correct: {
    en: "Correct!",
    es: "¡Correcto!"
  },
  incorrect: {
    en: "It's",
    es: "Es"
  },
  speaking: {
    en: "Speaking...",
    es: "Reproduciendo..."
  },
  hearAgain: {
    en: "Click to hear again",
    es: "Haz clic para escuchar de nuevo"
  },
  score: {
    en: "Score:",
    es: "Puntuación:"
  },
  changeMode: {
    en: "Change Game Mode",
    es: "Cambiar modo de juego"
  },
  colorsTitle: {
    en: "Colors in English",
    es: "Colores en Inglés"
  },
  tip: {
    en: "Pronunciation Tip:",
    es: "Consejo de pronunciación:"
  },
  tipContent: {
    en: "Click the speaker icon to hear the colors pronounced in English.",
    es: "Haz clic en el icono de altavoz para escuchar la pronunciación en inglés."
  },
  noSupport: {
    en: "Speech synthesis is not supported in your browser.",
    es: "La síntesis de voz no es compatible con tu navegador."
  }
};

export default function EnglishColorGame() {
  const [currentColor, setCurrentColor] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [gameMode, setGameMode] = useState(MODES.IDENTIFY);
  const [showInstructions, setShowInstructions] = useState(true);
  const [userSpelling, setUserSpelling] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [language, setLanguage] = useState('es'); // 'es' o 'en'

  // Verificar soporte de speechSynthesis al cargar el componente
  useEffect(() => {
    setIsSpeechSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  // Inicializar el juego
  const startGame = (mode) => {
    if (mode === MODES.LISTEN && !isSpeechSupported) {
      alert(language === 'es' ? 
        "Lo sentimos, tu navegador no soporta la función de audio para este modo." : 
        "Sorry, your browser doesn't support the audio feature for this mode.");
      return;
    }
    setGameMode(mode);
    setShowInstructions(false);
    setScore(0);
    selectNewColor();
  };

  // Seleccionar un nuevo color y opciones
  const selectNewColor = () => {
    // Cancelar cualquier audio en reproducción
    if (isSpeechSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const availableColors = COLORS.filter(c => c.name !== currentColor?.name);
    const newColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    setCurrentColor(newColor);
    
    // Reproducir audio en modo escucha
    if (gameMode === MODES.LISTEN && isSpeechSupported) {
      speakColor(newColor.name);
    }

    // Preparar opciones para el modo identificación
    if (gameMode === MODES.IDENTIFY) {
      const incorrectOptions = availableColors
        .filter(c => c.name !== newColor.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const allOptions = [newColor, ...incorrectOptions]
        .sort(() => Math.random() - 0.5);
      
      setOptions(allOptions);
    } else {
      setOptions([]);
    }
    
    setSelectedOption(null);
    setIsCorrect(null);
    setUserSpelling('');
  };

  // Función para reproducir el audio del color
  const speakColor = (colorName) => {
    if (!isSpeechSupported) return;

    const utterance = new SpeechSynthesisUtterance();
    utterance.text = colorName;
    utterance.lang = 'en-US';
    utterance.rate = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Manejar selección de opción
  const handleSelection = (option) => {
    if (isCorrect !== null || isSpeaking) return;
    
    const correct = option.name === currentColor.name;
    setSelectedOption(option);
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
      setTimeout(selectNewColor, 1500);
    } else {
      setTimeout(selectNewColor, 1500);
    }
  };

  // Manejar envío del deletreo
  const handleSpellingSubmit = (e) => {
    e.preventDefault();
    if (isCorrect !== null) return;

    const correct = userSpelling.trim().toLowerCase() === currentColor.name.toLowerCase();
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
      setTimeout(selectNewColor, 1500);
    } else {
      setTimeout(selectNewColor, 1500);
    }
  };

  // Reproducir audio nuevamente
  const playAgain = () => {
    if (currentColor && isSpeechSupported && !isSpeaking) {
      speakColor(currentColor.name);
    }
  };

  // Cambiar idioma
  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  // Inicializar el juego cuando se sale de las instrucciones
  useEffect(() => {
    if (!showInstructions && currentColor === null) {
      selectNewColor();
    }
  }, [showInstructions, currentColor]);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start p-4 max-w-4xl mx-auto">
      {/* Panel principal del juego */}
      <div className="w-full bg-white rounded-xl shadow-lg p-6 relative">
        {/* Botón para cambiar idioma */}
        <button 
          onClick={toggleLanguage}
          className="absolute top-4 right-4 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
        >
          {language === 'es' ? 'EN' : 'ES'}
        </button>

        {showInstructions ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">
              {TEXTS.title[language]}
            </h2>
            <div className="mb-6 text-gray-700">
              <p className="mb-4">{TEXTS.instructions[language]}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Modo Identificar */}
                <button
                  onClick={() => startGame(MODES.IDENTIFY)}
                  className="p-4 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                >
                  <span className="font-bold block">{TEXTS.modes.identify[language]}</span>
                  <span className="text-sm">{TEXTS.modes.identify.desc[language]}</span>
                </button>
                
                {/* Modo Deletrear */}
                <button
                  onClick={() => startGame(MODES.SPELL)}
                  className="p-4 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <span className="font-bold block">{TEXTS.modes.spell[language]}</span>
                  <span className="text-sm">{TEXTS.modes.spell.desc[language]}</span>
                </button>
                
                {/* Modo Escuchar */}
                <button
                  onClick={() => startGame(MODES.LISTEN)}
                  className={`p-4 rounded-lg transition-colors ${
                    isSpeechSupported
                      ? 'bg-purple-100 hover:bg-purple-200'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!isSpeechSupported}
                >
                  <span className="font-bold block">{TEXTS.modes.listen[language]}</span>
                  <span className="text-sm">{TEXTS.modes.listen.desc[language]}</span>
                  {!isSpeechSupported && (
                    <span className="text-xs block text-red-500">
                      ({TEXTS.noSupport[language]})
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
              {TEXTS.questions[gameMode][language]}
            </h2>
            
            {/* Modo Identificar */}
            {gameMode === MODES.IDENTIFY && (
              <div className="flex flex-col items-center mb-8">
                <div 
                  className="w-32 h-32 rounded-full shadow-md border-4 border-white mb-4"
                  style={{ backgroundColor: currentColor?.hex }}
                ></div>
                <span className="text-sm text-gray-500">
                  {TEXTS.inSpanish[language]} {currentColor?.spanish}
                </span>
              </div>
            )}
            
            {/* Modo Deletrear */}
            {gameMode === MODES.SPELL && (
              <div className="flex flex-col items-center mb-8">
                <div 
                  className="w-32 h-32 rounded-full shadow-md border-4 border-white mb-4"
                  style={{ backgroundColor: currentColor?.hex }}
                ></div>
                <form onSubmit={handleSpellingSubmit} className="w-full max-w-xs">
                  <input
                    type="text"
                    value={userSpelling}
                    onChange={(e) => setUserSpelling(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg text-center text-lg"
                    placeholder={TEXTS.placeholder[language]}
                    disabled={isCorrect !== null}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
                    disabled={isCorrect !== null}
                  >
                    {TEXTS.check[language]}
                  </button>
                </form>
                {isCorrect !== null && (
                  <div className={`mt-2 text-lg font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? TEXTS.correct[language] : `${TEXTS.incorrect[language]} ${currentColor?.name}`}
                  </div>
                )}
              </div>
            )}
            
            {/* Modo Escuchar */}
            {gameMode === MODES.LISTEN && (
              <div className="flex flex-col items-center mb-8">
                <button
                  onClick={playAgain}
                  className={`p-4 rounded-full mb-4 transition-colors ${
                    isSpeaking
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-100 hover:bg-blue-200'
                  }`}
                  disabled={isSpeaking}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
                <p className="text-sm text-gray-500 mb-2">
                  {isSpeaking ? TEXTS.speaking[language] : TEXTS.hearAgain[language]}
                </p>
              </div>
            )}
            
            {/* Opciones para los modos Identificar y Escuchar */}
            {(gameMode === MODES.IDENTIFY || gameMode === MODES.LISTEN) && (
              <div className="grid grid-cols-2 gap-4">
                {(gameMode === MODES.IDENTIFY ? options : 
                  [...COLORS].sort(() => 0.5 - Math.random()).slice(0, 4)).map((option) => {
                  const isSelected = selectedOption?.name === option.name;
                  let buttonClass = "py-4 px-2 rounded-lg font-medium text-lg transition-all ";
                  
                  if (isSelected) {
                    buttonClass += isCorrect 
                      ? "bg-green-300 text-green-800 shadow-inner" 
                      : "bg-red-300 text-red-800 shadow-inner";
                  } else if (isCorrect !== null && option.name === currentColor.name) {
                    buttonClass += "bg-green-100 text-green-700";
                  } else {
                    buttonClass += "bg-gray-100 hover:bg-gray-200 text-gray-700";
                  }
                  
                  return (
                    <button
                      key={option.name}
                      className={buttonClass}
                      onClick={() => handleSelection(option)}
                      disabled={isCorrect !== null || isSpeaking}
                    >
                      {option.name}
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Puntuación y controles */}
            <div className="mt-6 text-center">
              <span className="font-semibold">{TEXTS.score[language]} </span>
              <span className="text-xl font-bold">{score}</span>
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  if (isSpeechSupported) window.speechSynthesis.cancel();
                  setShowInstructions(true);
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {TEXTS.changeMode[language]}
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Panel lateral con información de colores */}
      <div className="w-full md:w-64 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {TEXTS.colorsTitle[language]}
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {COLORS.map(color => (
            <div key={color.name} className="flex items-center">
              <div 
                className="w-6 h-6 rounded-full mr-2 border border-gray-300"
                style={{ backgroundColor: color.hex }}
              ></div>
              <span className="text-sm">
                <span className="font-medium">{color.name}</span>
                <span className="text-gray-500 text-xs block">{color.spanish}</span>
              </span>
            </div>
          ))}
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-2">
            {TEXTS.tip[language]}
          </h4>
          <p className="text-yellow-700 text-sm">
            {isSpeechSupported 
              ? TEXTS.tipContent[language]
              : TEXTS.noSupport[language]}
          </p>
        </div>
      </div>
    </div>
  );
}
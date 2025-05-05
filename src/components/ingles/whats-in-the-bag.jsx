import { useState, useRef } from 'preact/hooks';
import { 
  FaAppleAlt, 
  FaKey, 
  FaPaw, 
  FaCube,
  FaVolumeUp,
  FaCheck, 
  FaTimes,
  FaLanguage,
  FaPlay
} from 'react-icons/fa';

// Objetos con iconos
const OBJECTS = [
  {
    id: 'apple',
    name: { en: 'apple', es: 'manzana' },
    textures: ['smooth', 'round'],
    icon: FaAppleAlt,
    hints: {
      en: ['It\'s round', 'It can be red or green', 'Healthy snack'],
      es: ['Es redondo', 'Puede ser roja o verde', 'Snack saludable']
    }
  },
  {
    id: 'keys',
    name: { en: 'keys', es: 'llaves' },
    textures: ['hard', 'metallic'],
    icon: FaKey,
    hints: {
      en: ['Made of metal', 'Used to open doors', 'They jingle'],
      es: ['De metal', 'Se usan para abrir puertas', 'Hacen sonido']
    }
  },
  {
    id: 'teddy',
    name: { en: 'teddy bear', es: 'oso de peluche' },
    textures: ['soft', 'fluffy'],
    icon: FaPaw,
    hints: {
      en: ['It\'s soft', 'Children love it', 'Stuffed animal'],
      es: ['Es suave', 'A los niños les encanta', 'Animal de peluche']
    }
  },
  {
    id: 'block',
    name: { en: 'wooden block', es: 'bloque de madera' },
    textures: ['hard', 'square'],
    icon: FaCube,
    hints: {
      en: ['It\'s square', 'Made of wood', 'Used for building'],
      es: ['Es cuadrado', 'De madera', 'Se usa para construir']
    }
  }
];

// Vocabulario descriptivo
const DESCRIPTIVE_WORDS = {
  en: ['soft', 'hard', 'round', 'square', 'big', 'small', 'smooth', 'rough', 'fuzzy', 'metallic'],
  es: ['suave', 'duro', 'redondo', 'cuadrado', 'grande', 'pequeño', 'liso', 'áspero', 'peludo', 'metálico']
};

export default function WhatsInTheBag() {
  const [currentObject, setCurrentObject] = useState(null);
  const [revealedParts, setRevealedParts] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const [language, setLanguage] = useState('es');
  const [gameState, setGameState] = useState('waiting');
  const bagRef = useRef(null);

  // Inicializar el juego
  const startGame = () => {
    const randomObject = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    setCurrentObject(randomObject);
    setRevealedParts([]);
    setGuesses([]);
    setFeedback('');
    setHintIndex(0);
    setGameState('playing');
  };

  // Manejar interacción con la bolsa
  const handleBagInteraction = (e) => {
    if (gameState !== 'playing') return;
    
    const rect = bagRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    const newPart = {
      x: x * 100,
      y: y * 100,
      texture: currentObject.textures[Math.floor(Math.random() * currentObject.textures.length)]
    };
    
    setRevealedParts([...revealedParts, newPart]);
  };

  // Verificar respuesta
  const checkGuess = (guess) => {
    const isCorrect = guess === currentObject.id;
    setGuesses([...guesses, { guess, isCorrect }]);
    
    if (isCorrect) {
      setFeedback(language === 'es' ? '¡Correcto!' : 'Correct!');
      setGameState('guessed');
    } else {
      setFeedback(language === 'es' ? 'Intenta de nuevo' : 'Try again');
      if (guesses.length >= 1 && hintIndex < currentObject.hints[language].length - 1) {
        setHintIndex(hintIndex + 1);
      }
    }
  };

  // Obtener pista actual
  const getCurrentHint = () => {
    return currentObject?.hints[language][hintIndex] || '';
  };

  // Renderizar partes reveladas del objeto
  const renderRevealedParts = () => {
    return revealedParts.map((part, index) => (
      <div 
        key={index}
        className={`absolute w-8 h-8 rounded-full opacity-70 ${
          part.texture === 'soft' ? 'bg-pink-200' :
          part.texture === 'hard' ? 'bg-gray-300' :
          part.texture === 'smooth' ? 'bg-blue-200' :
          'bg-yellow-200'
        }`}
        style={{ left: `${part.x}%`, top: `${part.y}%`, transform: 'translate(-50%, -50%)' }}
        title={part.texture}
      />
    ));
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Encabezado e idioma */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-purple-600">
            {language === 'es' ? '¿Qué hay en la bolsa?' : 'What\'s in the Bag?'}
          </h1>
          <button 
            onClick={() => setLanguage(l => l === 'es' ? 'en' : 'es')}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm flex items-center gap-1"
          >
            <FaLanguage /> {language === 'es' ? 'EN' : 'ES'}
          </button>
        </div>

        {/* Instrucciones */}
        <p className="mb-4 text-gray-700">
          {language === 'es' 
            ? 'Toca la bolsa para sentir el objeto y adivina qué es' 
            : 'Touch the bag to feel the object and guess what it is'}
        </p>

        {/* Bolsa interactiva */}
        <div 
          ref={bagRef}
          onClick={handleBagInteraction}
          onMouseMove={(e) => {
            if (e.buttons === 1) handleBagInteraction(e);
          }}
          className="relative bg-brown-200 rounded-lg h-64 w-full mb-4 cursor-pointer overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: '#d2b48c' }}
        >
          {/* Parte superior de la bolsa */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-brown-400 rounded-t-lg" style={{ backgroundColor: '#8b4513' }}></div>
          
          {/* Objeto revelado (si se adivinó) */}
          {gameState === 'guessed' && currentObject && (
            <div className="text-6xl text-brown-800 animate-bounce">
              <currentObject.icon />
            </div>
          )}
          
          {/* Partes reveladas del objeto */}
          {gameState === 'playing' && renderRevealedParts()}
          
          {/* Textura de la bolsa */}
          <div className="absolute inset-0 opacity-20 bg-repeat" style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20L0 20z\' fill=\'%238b4513\' fill-opacity=\'0.3\'/%3E%3C/svg%3E")' 
          }}></div>
        </div>

        {/* Pista actual */}
        {currentObject && gameState === 'playing' && (
          <div className="bg-yellow-50 p-3 rounded-lg mb-4">
            <p className="font-semibold text-yellow-800">
              {language === 'es' ? 'Pista:' : 'Hint:'} {getCurrentHint()}
            </p>
            <p className="text-sm mt-1">
              {language === 'es' 
                ? 'Palabras descriptivas:' 
                : 'Descriptive words:'} {currentObject.textures.join(', ')}
            </p>
          </div>
        )}

        {/* Retroalimentación */}
        {feedback && (
          <div className={`p-3 rounded-lg mb-4 text-center font-bold ${
            feedback.includes('Correct') || feedback.includes('¡Correcto') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {feedback}
          </div>
        )}

        {/* Opciones de respuesta */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {OBJECTS.map(obj => (
            <button
              key={obj.id}
              onClick={() => checkGuess(obj.id)}
              disabled={gameState !== 'playing'}
              className={`p-3 rounded-lg border flex items-center justify-center gap-2 ${
                gameState === 'playing' 
                  ? 'bg-white hover:bg-gray-50 border-gray-300' 
                  : 'bg-gray-100 border-gray-200'
              } ${
                guesses.some(g => g.guess === obj.id && g.isCorrect) 
                  ? '!bg-green-100 !border-green-300' 
                  : guesses.some(g => g.guess === obj.id) 
                    ? '!bg-red-100 !border-red-300' 
                    : ''
              }`}
            >
              <obj.icon className="text-lg" />
              {obj.name[language]}
              <span className="ml-auto">
                {guesses.some(g => g.guess === obj.id) && (
                  guesses.find(g => g.guess === obj.id).isCorrect 
                    ? <FaCheck className="text-green-500" /> 
                    : <FaTimes className="text-red-500" />
                )}
              </span>
            </button>
          ))}
        </div>

        {/* Botón de inicio/reinicio */}
        <button
          onClick={startGame}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FaPlay />
          {gameState === 'waiting' 
            ? (language === 'es' ? 'Comenzar Juego' : 'Start Game') 
            : (language === 'es' ? 'Jugar de Nuevo' : 'Play Again')}
        </button>

        {/* Vocabulario descriptivo */}
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">
            {language === 'es' ? 'Vocabulario Descriptivo' : 'Descriptive Vocabulary'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {DESCRIPTIVE_WORDS[language].map(word => (
              <span key={word} className="bg-white px-3 py-1 rounded-full text-sm shadow-sm">
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
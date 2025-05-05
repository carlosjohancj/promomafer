import { useState, useEffect } from 'preact/hooks';

export default function PatternRace() {
  // Estados del juego
  const [patterns, setPatterns] = useState([]);
  const [currentPattern, setCurrentPattern] = useState([]);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [computerPosition, setComputerPosition] = useState(0);
  const [gameStatus, setGameStatus] = useState('ready'); // ready, playing, won, lost
  const [feedback, setFeedback] = useState('¡Descubre el patrón para ganar la carrera!');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  
  // Opciones de patrones (colores y formas)
  const patternOptions = [
    { type: 'color', value: 'bg-red-500', label: 'Rojo' },
    { type: 'color', value: 'bg-blue-500', label: 'Azul' },
    { type: 'color', value: 'bg-green-500', label: 'Verde' },
    { type: 'color', value: 'bg-yellow-500', label: 'Amarillo' },
    { type: 'shape', value: 'circle', label: 'Círculo' },
    { type: 'shape', value: 'square', label: 'Cuadrado' },
    { type: 'shape', value: 'triangle', label: 'Triángulo' }
  ];

  // Iniciar un nuevo juego
  const startGame = () => {
    // Generar patrones aleatorios según el nivel
    const newPatterns = [];
    const patternLength = 3 + Math.floor(level / 2);
    
    for (let i = 0; i < 3; i++) {
      const randomPattern = [];
      for (let j = 0; j < patternLength; j++) {
        randomPattern.push(patternOptions[Math.floor(Math.random() * patternOptions.length)]);
      }
      newPatterns.push(randomPattern);
    }
    
    setPatterns(newPatterns);
    setCurrentPattern([]);
    setPlayerPosition(0);
    setComputerPosition(0);
    setGameStatus('playing');
    setFeedback(`Observa el patrón y selecciona el siguiente elemento. Nivel ${level}`);
    
    // Mostrar el primer patrón
    showPattern(newPatterns[0]);
  };

  // Mostrar un patrón con animación
  const showPattern = (pattern) => {
    setCurrentPattern(pattern);
    setTimeout(() => {
      setCurrentPattern([]);
    }, 2000);
  };

  // Manejar selección del jugador
  const handleSelection = (selectedOption) => {
    if (gameStatus !== 'playing') return;
    
    const currentTargetPattern = patterns[0];
    const expectedNext = currentTargetPattern[currentPattern.length % currentTargetPattern.length];
    
    if (selectedOption.value === expectedNext.value) {
      // Respuesta correcta
      const newPattern = [...currentPattern, selectedOption];
      setCurrentPattern(newPattern);
      setPlayerPosition(playerPosition + 1);
      setScore(score + 10);
      
      // Verificar si completó el patrón
      if (newPattern.length === patterns[0].length) {
        setFeedback('¡Correcto! Avanzas un lugar.');
        setTimeout(() => {
          setPatterns(patterns.slice(1));
          if (patterns.length === 1) {
            // Ganó el nivel
            setLevel(level + 1);
            setFeedback(`¡Nivel ${level + 1} completado!`);
            setGameStatus('won');
          } else {
            showPattern(patterns[1]);
          }
        }, 1000);
      }
    } else {
      // Respuesta incorrecta
      setFeedback('¡Ups! Esa no es la opción correcta. Intenta de nuevo.');
      setComputerPosition(computerPosition + 1);
      
      if (computerPosition >= 3) {
        setGameStatus('lost');
        setFeedback('¡La computadora ganó esta vez! Inténtalo de nuevo.');
      }
    }
  };

  // Renderizar un elemento del patrón
  const renderPatternItem = (item, index) => {
    if (item.type === 'color') {
      return (
        <div 
          key={index}
          className={`w-12 h-12 rounded-full ${item.value} mx-1 shadow-md`}
          title={item.label}
        />
      );
    } else {
      return (
        <div 
          key={index}
          className={`w-12 h-12 mx-1 flex items-center justify-center`}
          title={item.label}
        >
          {item.value === 'circle' && <div className="w-10 h-10 rounded-full bg-purple-500" />}
          {item.value === 'square' && <div className="w-10 h-10 bg-purple-500" />}
          {item.value === 'triangle' && (
            <div 
              className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-purple-500"
              style={{ borderBottomWidth: '16px', borderLeftWidth: '8px', borderRightWidth: '8px' }}
            />
          )}
        </div>
      );
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Cabecera del juego */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700 mb-2">La Carrera de los Patrones</h1>
        <p className="text-lg text-gray-700">
          Descubre el patrón para que tu corredor avance y gane la carrera.
        </p>
      </div>

      {/* Panel de información */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-bold text-indigo-700">
          Nivel: <span className="text-2xl">{level}</span>
        </div>
        <div className="text-xl font-bold text-indigo-700">
          Puntuación: <span className="text-2xl">{score}</span>
        </div>
        <button
          onClick={startGame}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          {gameStatus === 'ready' ? 'Comenzar' : 'Reiniciar'}
        </button>
      </div>

      {/* Área de feedback */}
      <div className={`mb-6 p-4 rounded-lg text-center font-medium text-lg ${
        gameStatus === 'won' ? 'bg-green-100 text-green-800' :
        gameStatus === 'lost' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {feedback}
      </div>

      {/* Carrera */}
      <div className="relative bg-gray-200 rounded-lg p-4 mb-8 h-40">
        {/* Pista de carreras */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-400 transform -translate-y-1/2"></div>
        
        {/* Corredor del jugador */}
        <div 
          className="absolute left-0 bottom-0 transition-all duration-500"
          style={{ left: `${Math.min(playerPosition * 20, 90)}%` }}
        >
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
            Tú
          </div>
        </div>
        
        {/* Corredor de la computadora */}
        <div 
          className="absolute left-0 bottom-0 transition-all duration-500"
          style={{ left: `${Math.min(computerPosition * 20, 90)}%` }}
        >
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
            PC
          </div>
        </div>
      </div>

      {/* Área del patrón */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-center">Patrón a seguir</h3>
        <div className="flex justify-center mb-6">
          {currentPattern.length > 0 ? (
            <div className="flex">
              {currentPattern.map((item, index) => renderPatternItem(item, index))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">Observa atentamente el patrón...</p>
          )}
        </div>

        {/* Opciones de selección */}
        <h3 className="text-xl font-semibold mb-4 text-center">Selecciona el siguiente elemento</h3>
        <div className="grid grid-cols-4 gap-4">
          {patternOptions.map((option) => (
            <button
              key={`${option.type}-${option.value}`}
              onClick={() => handleSelection(option)}
              disabled={gameStatus !== 'playing'}
              className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${
                gameStatus === 'playing' ? 
                'hover:scale-105 hover:shadow-md cursor-pointer' : 
                'opacity-50 cursor-not-allowed'
              } ${
                option.type === 'color' ? option.value : 'bg-white border-2 border-gray-300'
              }`}
            >
              {option.type === 'shape' && (
                <div className="w-8 h-8 mb-1">
                  {option.value === 'circle' && <div className="w-full h-full rounded-full bg-purple-500" />}
                  {option.value === 'square' && <div className="w-full h-full bg-purple-500" />}
                  {option.value === 'triangle' && (
                    <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-purple-500 mx-auto" />
                  )}
                </div>
              )}
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
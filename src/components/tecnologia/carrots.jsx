import { useState, useRef, useEffect } from 'preact/hooks';
import { FaPlay, FaRedo, FaStepForward, FaCarrot, FaChevronUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function BunnyAdventure() {
  // Estados del juego
  const [blocks, setBlocks] = useState([]);
  const [bunnyPosition, setBunnyPosition] = useState({ x: 0, y: 0 });
  const [bunnyDirection, setBunnyDirection] = useState(0); // 0: arriba, 1: derecha, 2: abajo, 3: izquierda
  const [gameState, setGameState] = useState('idle'); // idle, running, success, error
  const [level, setLevel] = useState(1);
  const [draggingBlock, setDraggingBlock] = useState(null);
  const programAreaRef = useRef(null);
  
  // Configuración de niveles
  const levels = [
    {
      start: { x: 0, y: 2 },
      carrot: { x: 4, y: 2 },
      obstacles: [
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 }
      ]
    },
    // Puedes agregar más niveles aquí
  ];

  // Bloques de comandos disponibles
  const commandBlocks = [
    { id: 'move', text: 'Mover', icon: <FaChevronUp /> },
    { id: 'left', text: 'Izquierda', icon: <FaChevronLeft /> },
    { id: 'right', text: 'Derecha', icon: <FaChevronRight /> }
  ];

  // Inicializar nivel
  const initLevel = (lvl) => {
    const currentLevel = levels[lvl - 1];
    setBunnyPosition(currentLevel.start);
    setBunnyDirection(0);
    setBlocks([]);
    setGameState('idle');
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  // Manejadores de clic/push
  const handleBlockClick = (block) => {
    if (gameState !== 'idle') return;
    setBlocks(prev => [...prev, block]);
  };

  // Manejador para borrar bloque
  const handleDeleteBlock = (index) => {
    if (gameState !== 'idle') return;
    setBlocks(prev => prev.filter((_, i) => i !== index));
  };

  // Ejecutar programa
  const executeProgram = async () => {
    if (gameState !== 'idle' || blocks.length === 0) return;
    
    setGameState('running');
    let currentDirection = bunnyDirection;
    let currentPosition = {...bunnyPosition};
    const currentLevel = levels[level - 1];
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      
      // Actualizar dirección
      if (block.id === 'left') {
        currentDirection = (currentDirection + 3) % 4;
        setBunnyDirection(currentDirection);
      } else if (block.id === 'right') {
        currentDirection = (currentDirection + 1) % 4;
        setBunnyDirection(currentDirection);
      }
      
      // Mover si es el comando de movimiento
      if (block.id === 'move') {
        const newPosition = {...currentPosition};
        
        // Calcular nueva posición basada en la dirección
        if (currentDirection === 0) newPosition.y -= 1; // arriba
        else if (currentDirection === 1) newPosition.x += 1; // derecha
        else if (currentDirection === 2) newPosition.y += 1; // abajo
        else if (currentDirection === 3) newPosition.x -= 1; // izquierda
        
        // Verificar colisiones con obstáculos o bordes
        if (
          newPosition.x < 0 || newPosition.x > 4 ||
          newPosition.y < 0 || newPosition.y > 4 ||
          currentLevel.obstacles.some(obs => 
            obs.x === newPosition.x && obs.y === newPosition.y
          )
        ) {
          setGameState('error');
          return;
        }
        
        // Verificar si llegó a la zanahoria
        if (
          newPosition.x === currentLevel.carrot.x &&
          newPosition.y === currentLevel.carrot.y
        ) {
          setBunnyPosition(newPosition);
          setGameState('success');
          return;
        }
        
        currentPosition = newPosition;
        setBunnyPosition(newPosition);
      }
      
      // Pequeña pausa para la animación
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setGameState('idle');
  };

  // Reiniciar nivel
  const resetLevel = () => {
    initLevel(level);
  };

  // Siguiente nivel
  const nextLevel = () => {
    if (level < levels.length) {
      setLevel(level + 1);
    } else {
      // Volver al primer nivel si se completó el último
      setLevel(1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-orange-600 mb-2">Aventura del Conejo</h1>
        <p className="text-lg text-gray-700">
          Ayuda al conejo a llegar a la zanahoria arrastrando y conectando los bloques de comandos.
          ¡Aprende los primeros pasos de la programación!
        </p>
        <div className="mt-2 text-sm text-gray-500">
          Nivel: {level}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* Área de programación */}
        <div className="bg-white p-2 md:p-4 rounded-lg border border-gray-200 w-full md:w-1/4 overflow-y-auto max-h-[300px]">
          <h3 className="font-bold text-lg mb-3 text-blue-800">Programa</h3>
          <div className="space-y-2">
            <h2 className="font-bold text-lg mb-4 text-blue-800">Bloques de Comando</h2>
            <p className="text-sm text-gray-600 mb-4">Arrastra estos bloques al área de programación</p>
            
            <div className="space-y-3">
              {commandBlocks.map(block => (
                <div
                  key={block.id}
                  onClick={() => handleBlockClick(block)}
                  className="p-2 md:p-3 bg-blue-50 rounded-lg flex items-center gap-2 border-l-4 border-blue-400 cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <div className="text-purple-500">{block.icon}</div>
                  <span>{block.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Área principal */}
        <div className="flex-1">
          {/* Tablero de juego */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-2 md:p-4 mb-4">
            <div className="relative h-64 bg-green-100 rounded">
              {/* Cuadrícula */}
              {Array.from({ length: 5 }).map((_, y) => (
                <div key={y} className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, x) => {
                    const isObstacle = levels[level - 1].obstacles.some(obs => obs.x === x && obs.y === y);
                    const isCarrot = levels[level - 1].carrot.x === x && levels[level - 1].carrot.y === y;
                    const isBunny = bunnyPosition.x === x && bunnyPosition.y === y;
                    
                    return (
                      <div 
                        key={x}
                        className={`w-12 h-12 flex items-center justify-center text-2xl font-bold ${
                          isBunny ? 'text-orange-600' :
                          isCarrot ? 'text-yellow-600' :
                          isObstacle ? 'text-gray-600' :
                          'text-gray-300'
                        }`}
                        style={{
                          touchAction: 'none',
                          userSelect: 'none'
                        }}
                      >
                        {isBunny ? <FaCarrot className="rotate-45" /> : 
                         isCarrot ? '🥕' : 
                         isObstacle ? '❌' : 
                         '•'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Área de programación */}
          <div 
            ref={programAreaRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 min-h-32 mb-4"
          >
            <h2 className="font-bold text-lg mb-2 text-purple-800">Tu Programa</h2>
            
            {blocks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Arrastra bloques aquí para crear tu programa
              </p>
            ) : (
              <div className="space-y-2">
                {blocks.map((block, index) => (
                  <div
                    key={index}
                    className="p-2 md:p-3 bg-blue-50 rounded-lg flex items-center gap-2 mb-2 relative"
                    style={{
                      touchAction: 'none'
                    }}
                  >
                    <div
                      className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlock(index);
                      }}
                    >
                      ✕
                    </div>
                    <div className="text-purple-500">{block.icon}</div>
                    <span>{block.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controles */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={executeProgram}
              disabled={blocks.length === 0 || gameState === 'running'}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                blocks.length === 0 || gameState === 'running'
                  ? 'bg-gray-200 text-gray-500'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <FaPlay /> Ejecutar
            </button>
            
            <button 
              onClick={resetLevel}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
            >
              <FaRedo /> Reiniciar
            </button>
          </div>
        </div>
      </div>

      {/* Mensajes de retroalimentación */}
      {gameState === 'success' && (
        <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg text-center animate-bounce">
          <h3 className="font-bold text-green-800 text-xl">¡Zanahoria conseguida!</h3>
          <p className="text-green-700">El conejo ha llegado a la zanahoria. ¡Buen trabajo!</p>
          <button 
            onClick={nextLevel}
            className="mt-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
          >
            Siguiente Nivel
          </button>
        </div>
      )}
      
      {gameState === 'error' && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-center">
          <h3 className="font-bold text-red-800">¡Oh no!</h3>
          <p className="text-red-700">El conejo encontró un obstáculo. Intenta con un programa diferente.</p>
        </div>
      )}

      {/* Instrucciones */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-bold text-blue-800 mb-2">¿Cómo jugar?</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Arrastra bloques de comando al área de programación</li>
          <li>Ordena los bloques para crear una secuencia</li>
          <li>Presiona "Ejecutar" para ver al conejo seguir tus instrucciones</li>
          <li>Lleva al conejo hasta la zanahoria</li>
        </ol>
      </div>
    </div>
  );
}
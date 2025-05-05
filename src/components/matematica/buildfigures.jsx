import { useState, useRef, useEffect } from 'preact/hooks';

export default function BuildFigures() {
  // Estados del componente
  const [shapes, setShapes] = useState([]);
  const [targetFigure, setTargetFigure] = useState(null);
  const [feedback, setFeedback] = useState('¡Arrastra las formas para construir la figura!');
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const workspaceRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Figuras objetivo posibles
  const targetFigures = [
    { type: 'circle', color: 'bg-blue-500', size: 150 },
    { type: 'square', color: 'bg-green-500', size: 150 },
    { type: 'triangle', color: 'bg-yellow-500', size: 150 }
  ];

  // Formas disponibles para arrastrar
  const availableShapes = [
    { id: 'circle1', type: 'circle', color: 'bg-blue-300', left: 0, top: 0, size: 40, isDragging: false },
    { id: 'circle2', type: 'circle', color: 'bg-blue-400', left: 0, top: 0, size: 30, isDragging: false },
    { id: 'square1', type: 'square', color: 'bg-green-300', left: 0, top: 0, size: 40, isDragging: false },
    { id: 'square2', type: 'square', color: 'bg-green-400', left: 0, top: 0, size: 30, isDragging: false },
    { id: 'triangle1', type: 'triangle', color: 'bg-yellow-300', left: 0, top: 0, size: 40, isDragging: false },
    { id: 'triangle2', type: 'triangle', color: 'bg-yellow-400', left: 0, top: 0, size: 30, isDragging: false }
  ];

  // Iniciar un nuevo juego
  const startGame = () => {
    const randomTarget = targetFigures[Math.floor(Math.random() * targetFigures.length)];
    setTargetFigure(randomTarget);
    setShapes([]);
    setFeedback(`Construye un ${getShapeName(randomTarget.type)} usando las formas pequeñas.`);
    setGameStarted(true);
    setShowSuccess(false);
  };

  // Obtener nombre de la figura en español
  const getShapeName = (type) => {
    switch (type) {
      case 'circle': return 'círculo';
      case 'square': return 'cuadrado';
      case 'triangle': return 'triángulo';
      default: return 'figura';
    }
  };
  const getColorValue = (tailwindClass) => {
    const colorMap = {
      'bg-blue-300': '#93c5fd',
      'bg-blue-400': '#60a5fa',
      'bg-blue-500': '#3b82f6',
      'bg-green-300': '#86efac',
      'bg-green-400': '#4ade80',
      'bg-green-500': '#10b981',
      'bg-yellow-300': '#fcd34d',
      'bg-yellow-400': '#fbbf24',
      'bg-yellow-500': '#f59e0b'
    };
    return colorMap[tailwindClass] || '#fbbf24';
  };

  // Manejar inicio del arrastre
  const handleDragStart = (e, shape) => {
    if (!gameStarted) return;
    
    const rect = e.target.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    setShapes(prev => prev.map(s => 
      s.id === shape.id ? { ...s, isDragging: true } : s
    ));
  };

  // Manejar el arrastre
  const handleDrag = (e, shape) => {
    if (!shape.isDragging || !workspaceRef.current) return;
    
    e.preventDefault();
    
    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    const left = e.clientX - workspaceRect.left - dragOffset.current.x;
    const top = e.clientY - workspaceRect.top - dragOffset.current.y;
    
    setShapes(prev => prev.map(s => 
      s.id === shape.id ? { ...s, left, top } : s
    ));
  };

  // Manejar fin del arrastre
  const handleDragEnd = (shape) => {
    setShapes(prev => prev.map(s => 
      s.id === shape.id ? { ...s, isDragging: false } : s
    ));
    checkCompletion();
  };

  // Añadir una nueva forma al área de trabajo
  const addShapeToWorkspace = (shape) => {
    if (!gameStarted || shapes.length >= 15) return;
    
    const newShape = {
      ...shape,
      left: Math.random() * 200,
      top: Math.random() * 200,
      isDragging: false
    };
    
    setShapes(prev => [...prev, newShape]);
    setFeedback('¡Buena elección! Ahora coloca la forma donde quieras.');
  };

  // Verificar si se completó la figura
  const checkCompletion = () => {
    if (!targetFigure) return;
    
    // Contar cuántas formas del tipo correcto hay
    const correctShapes = shapes.filter(s => s.type === targetFigure.type).length;
    
    if (correctShapes >= 5) {
      const coverage = calculateCoverage();
      
      if (coverage >= 0.7) {
        setFeedback('¡Excelente! Has construido la figura correctamente.');
        setScore(prev => prev + 10);
        setShowSuccess(true);
        setTimeout(() => {
          startGame();
        }, 2000);
      } else {
        setFeedback('¡Casi lo logras! Usa más formas para cubrir la figura completa.');
      }
    }
  };

  // Calcular qué tan bien cubre la figura objetivo
  const calculateCoverage = () => {
    return Math.min(1, shapes.length / 8);
  };

  // Renderizar una forma individual
  const renderShape = (shape) => {
    const baseClasses = `absolute cursor-move transition-transform duration-200 ${
      shape.isDragging ? 'scale-110 z-10 shadow-lg' : 'hover:scale-105 z-0'
    }`;

    const commonStyles = {
      left: `${shape.left}px`,
      top: `${shape.top}px`,
    };

    switch (shape.type) {
      case 'circle':
        return (
          <div
            className={`${baseClasses} rounded-full ${shape.color}`}
            style={{
              ...commonStyles,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
            }}
            onMouseDown={(e) => handleDragStart(e, shape)}
          />
        );
      case 'square':
        return (
          <div
            className={`${baseClasses} ${shape.color}`}
            style={{
              ...commonStyles,
              width: `${shape.size}px`,
              height: `${shape.size}px`,
            }}
            onMouseDown={(e) => handleDragStart(e, shape)}
          />
        );
      case 'triangle':
        const colorValue = getColorValue(shape.color);
        return (
          <div
            className={baseClasses}
            style={{
              ...commonStyles,
              width: '0',
              height: '0',
              borderLeft: `${shape.size/2}px solid transparent`,
              borderRight: `${shape.size/2}px solid transparent`,
              borderBottom: `${shape.size}px solid ${colorValue}`,
              backgroundColor: 'transparent !important',
            }}
            onMouseDown={(e) => handleDragStart(e, shape)}
          />
        );
      default:
        return null;
    }
  };
  // Efecto para manejar el movimiento del ratón
  useEffect(() => {
    const handleMouseMove = (e) => {
      const draggingShape = shapes.find(s => s.isDragging);
      if (draggingShape) {
        handleDrag(e, draggingShape);
      }
    };

    const handleMouseUp = () => {
      const draggingShape = shapes.find(s => s.isDragging);
      if (draggingShape) {
        handleDragEnd(draggingShape);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [shapes]);

  return (
    <div className="p-4">
      {/* Panel de control */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-bold text-indigo-700">
          Puntuación: <span className="text-2xl">{score}</span>
        </div>
        <button
          onClick={startGame}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          {gameStarted ? 'Nueva Figura' : 'Comenzar'}
        </button>
      </div>

      {/* Área de instrucciones y feedback */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-lg text-center font-medium text-blue-800">
          {feedback}
        </p>
      </div>

      {/* Contenedor principal del juego */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Panel de formas disponibles */}
        <div className="w-full md:w-1/4 bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Formas Disponibles</h3>
          <div className="grid grid-cols-2 gap-4">
            {availableShapes.map(shape => (
              <div
                key={shape.id}
                className="flex flex-col items-center p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => addShapeToWorkspace(shape)}
              >
                {renderShape({ ...shape, left: 0, top: 0 })}
                <span className="mt-2 text-sm text-gray-600 capitalize">
                  {getShapeName(shape.type)} pequeño
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Área de trabajo */}
        <div className="flex-1 relative">
          <div
            ref={workspaceRef}
            className="relative w-full h-96 bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
          >
            {/* Figura objetivo (solo si el juego ha comenzado) */}
            {gameStarted && targetFigure && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`opacity-20 ${targetFigure.color}`}>
                  {targetFigure.type === 'circle' && (
                    <div
                      className="rounded-full"
                      style={{
                        width: `${targetFigure.size}px`,
                        height: `${targetFigure.size}px`,
                      }}
                    />
                  )}
                  {targetFigure.type === 'square' && (
                    <div
                      style={{
                        width: `${targetFigure.size}px`,
                        height: `${targetFigure.size}px`,
                      }}
                    />
                  )}
                  {targetFigure.type === 'triangle' && (
                    <div
                      className="bg-transparent"
                      style={{
                        width: '0',
                        height: '0',
                        borderLeft: `${targetFigure.size/2}px solid transparent`,
                        borderRight: `${targetFigure.size/2}px solid transparent`,
                        borderBottom: `${targetFigure.size}px solid ${targetFigure.color.replace('bg-', '')}`,
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Formas colocadas por el usuario */}
            {shapes.map(shape => renderShape(shape))}

            {/* Mensaje de éxito (animado) */}
            {showSuccess && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-bounce text-4xl font-bold text-green-500 bg-white bg-opacity-80 p-4 rounded-full">
                  ¡Bien hecho!
                </div>
              </div>
            )}
          </div>

          {/* Contador de formas */}
          <div className="mt-2 text-right text-gray-600">
            Formas usadas: {shapes.length}/15
          </div>
        </div>
      </div>
    </div>
  );
}
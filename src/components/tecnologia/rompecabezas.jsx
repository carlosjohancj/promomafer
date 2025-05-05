import { useState, useRef, useEffect } from 'preact/hooks';
import { FaLightbulb, FaBolt, FaRedo, FaQuestionCircle } from 'react-icons/fa';

export default function CircuitPuzzle() {
  // Estado inicial con el circuito armado
  const initialState = {
    components: [
      { id: 'battery', x: 50, y: 50, connectedTo: null, rotation: 0 },
      { id: 'switch', x: 200, y: 50, connectedTo: null, rotation: 0, isOn: true },
      { id: 'bulb', x: 350, y: 50, connectedTo: null, rotation: 0, isLit: true },
      { id: 'wire1', x: 125, y: 150, connectedTo: null, rotation: 0 },
      { id: 'wire2', x: 275, y: 150, connectedTo: null, rotation: 0 }
    ],
    connections: [
      { from: 'battery', to: 'wire1' },
      { from: 'wire1', to: 'switch' },
      { from: 'switch', to: 'wire2' },
      { from: 'wire2', to: 'bulb' },
      { from: 'bulb', to: 'battery' }
    ]
  };

  const [components, setComponents] = useState(initialState.components);
  const [connections, setConnections] = useState(initialState.connections);
  const [dragging, setDragging] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [hoveredComponent, setHoveredComponent] = useState(null);
  const canvasRef = useRef(null);

  // Verificar si el circuito está completo
  useEffect(() => {
    const battery = components.find(c => c.id === 'battery');
    const bulb = components.find(c => c.id === 'bulb');
    const switchComp = components.find(c => c.id === 'switch');
    
    // Verificar conexiones
    const isComplete = (
      connections.some(c => c.from === 'battery' && c.to === 'wire1') &&
      connections.some(c => c.from === 'wire1' && c.to === 'switch') &&
      connections.some(c => c.from === 'switch' && c.to === 'wire2') &&
      connections.some(c => c.from === 'wire2' && c.to === 'bulb') &&
      connections.some(c => c.from === 'bulb' && c.to === 'battery') &&
      switchComp.isOn
    );

    if (isComplete) {
      // Encender la bombilla
      setComponents(prev => prev.map(c => 
        c.id === 'bulb' ? { ...c, isLit: true } : c
      ));
    } else {
      // Apagar la bombilla si no está completo
      setComponents(prev => prev.map(c => 
        c.id === 'bulb' ? { ...c, isLit: false } : c
      ));
    }
  }, [connections, components]);

  const handleDragStart = (id, e) => {
    setDragging(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!dragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setComponents(prev => prev.map(c => 
      c.id === dragging ? { ...c, x, y } : c
    ));

    setDragging(null);
  };

  const handleConnect = (from, to) => {
    if (from === to) return;
    
    // Verificar si ya están conectados
    const existingConnection = connections.find(c => 
      (c.from === from && c.to === to) || (c.from === to && c.to === from)
    );

    if (!existingConnection) {
      // Verificar si la conexión es válida
      const validConnections = {
        'battery': ['wire1'],
        'wire1': ['battery', 'switch'],
        'switch': ['wire1', 'wire2'],
        'wire2': ['switch', 'bulb'],
        'bulb': ['wire2', 'battery']
      };

      if (validConnections[from]?.includes(to)) {
        setConnections([...connections, { from, to }]);
      } else {
        // Mostrar mensaje de error
        alert('Esta conexión no es válida. Sigue el orden: Batería -> Cable -> Interruptor -> Cable -> Bombilla -> Batería');
      }
    } else {
      setConnections(connections.filter(c => 
        !(c.from === from && c.to === to) && !(c.from === to && c.to === from)
      ));
    }
    setSelectedComponent(null);
  };

  const toggleSwitch = () => {
    setComponents(prev => prev.map(c => 
      c.id === 'switch' ? { ...c, isOn: !c.isOn } : c
    ));
  };

  const resetPuzzle = () => {
    setComponents([
      { id: 'battery', x: 50, y: 50, connectedTo: null, rotation: 0 },
      { id: 'switch', x: 200, y: 50, connectedTo: null, rotation: 0, isOn: false },
      { id: 'bulb', x: 350, y: 50, connectedTo: null, rotation: 0, isLit: false },
      { id: 'wire1', x: 125, y: 150, connectedTo: null, rotation: 0 },
      { id: 'wire2', x: 275, y: 150, connectedTo: null, rotation: 0 }
    ]);
    setConnections([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 flex items-center justify-center gap-2">
          <FaBolt className="text-yellow-400" /> Rompecabezas de Circuitos
        </h1>
        <p className="text-lg text-gray-700 mt-2">
          Une los componentes para crear un circuito que encienda una luz virtual. ¡Aprende sobre electricidad!
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Componentes disponibles */}
        <div className="bg-gray-100 p-4 rounded-lg w-full md:w-1/4">
          <h2 className="font-bold text-lg mb-4 text-gray-800">Componentes</h2>
          <div className="space-y-4">
            {components.map(comp => (
              <div 
                key={comp.id}
                draggable
                onDragStart={(e) => handleDragStart(comp.id, e)}
                className={`p-3 bg-white rounded-lg shadow-md cursor-move flex items-center gap-2 ${
                  dragging === comp.id ? 'ring-2 ring-blue-500' : ''
                } ${selectedComponent === comp.id ? 'ring-2 ring-green-500' : ''}`}
                onClick={() => setSelectedComponent(comp.id)}
              >
                {comp.id === 'battery' && <FaBolt className="text-yellow-500" />}
                {comp.id === 'switch' && <div className="w-4 h-4 bg-gray-400 rounded"></div>}
                {comp.id === 'bulb' && <FaLightbulb className={comp.isLit ? 'text-yellow-300' : 'text-gray-400'} />}
                {(comp.id === 'wire1' || comp.id === 'wire2') && <div className="w-4 h-1 bg-gray-600"></div>}
                <span className="capitalize">{comp.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Área de trabajo */}
        <div className="flex-1">
          <div 
            ref={canvasRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative bg-gray-50 border-2 border-gray-200 rounded-lg h-96 w-full"
          >
            {/* Conexiones dibujadas */}
            {connections.map((conn, idx) => {
              const fromComp = components.find(c => c.id === conn.from);
              const toComp = components.find(c => c.id === conn.to);
              
              if (!fromComp || !toComp) return null;

              return (
                <svg key={idx} className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <line 
                    x1={fromComp.x} 
                    y1={fromComp.y} 
                    x2={toComp.x} 
                    y2={toComp.y} 
                    stroke="#3b82f6" 
                    strokeWidth="3"
                    strokeDasharray={!components.find(c => c.id === 'switch')?.isOn ? "5,5" : "0"}
                  />
                </svg>
              );
            })}

            {/* Componentes colocados */}
            {components.map(comp => (
              <div 
                key={comp.id}
                className={`absolute cursor-pointer ${comp.isLit ? 'animate-pulse' : ''} ${
                  selectedComponent === comp.id ? 'ring-4 ring-green-500' : ''
                } ${hoveredComponent === comp.id ? 'ring-4 ring-blue-500' : ''}`}
                style={{ left: `${comp.x}px`, top: `${comp.y}px` }}
                onClick={() => {
                  if (selectedComponent) {
                    handleConnect(selectedComponent, comp.id);
                  } else {
                    setSelectedComponent(comp.id);
                  }
                }}
                onDoubleClick={() => {
                  if (comp.id === 'switch') {
                    toggleSwitch();
                  }
                }}
                onMouseEnter={() => setHoveredComponent(comp.id)}
                onMouseLeave={() => setHoveredComponent(null)}
              >
                {comp.id === 'battery' && (
                  <div className="bg-red-500 w-16 h-8 rounded flex items-center justify-center text-white">
                    <FaBolt />
                  </div>
                )}
                {comp.id === 'switch' && (
                  <div 
                    className={`w-16 h-8 rounded flex items-center justify-center ${comp.isOn ? 'bg-green-500' : 'bg-gray-400'}`}
                  >
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                  </div>
                )}
                {comp.id === 'bulb' && (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${comp.isLit ? 'bg-yellow-200 shadow-lg shadow-yellow-200/50' : 'bg-gray-300'}`}>
                    <FaLightbulb className={comp.isLit ? 'text-yellow-500' : 'text-gray-500'} size={24} />
                  </div>
                )}
                {(comp.id === 'wire1' || comp.id === 'wire2') && (
                  <div className="w-24 h-4 bg-gray-600 rounded-full"></div>
                )}
              </div>
            ))}
          </div>

          {/* Controles */}
          <div className="flex justify-center gap-4 mt-4">
            <button 
              onClick={resetPuzzle}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2"
            >
              <FaRedo /> Reiniciar
            </button>
            <button 
              onClick={() => setShowHint(!showHint)}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center gap-2"
            >
              <FaQuestionCircle /> Pista
            </button>
          </div>
        </div>
      </div>

      {/* Instrucciones y retroalimentación */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        {showHint && (
          <div className="mb-4 p-3 bg-yellow-100 rounded-lg">
            <h3 className="font-bold text-yellow-800">Pista:</h3>
            <p>1. Haz clic en un componente para seleccionarlo</p>
            <p>2. Haz clic en otro componente para conectarlos</p>
            <p>3. Sigue el orden: Batería - Cable - Interruptor - Cable - Bombilla - Batería</p>
            <p>4. ¡No olvides encender el interruptor!</p>
          </div>
        )}
        
        {components.find(c => c.id === 'bulb')?.isLit ? (
          <div className="p-3 bg-green-100 text-green-800 rounded-lg font-bold text-center animate-bounce">
            ¡Circuito completo! La bombilla está encendida.
          </div>
        ) : (
          <div className="text-gray-700">
            <p className="text-center mb-2">Instrucciones:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Selecciona un componente haciendo clic en él</li>
              <li>Haz clic en otro componente para conectarlos</li>
              <li>Sigue el orden correcto de conexión</li>
              <li>Enciende el interruptor cuando todo esté conectado</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
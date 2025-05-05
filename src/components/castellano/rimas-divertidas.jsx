import { useState, useEffect } from 'preact/hooks';

// Palabras con sus respectivas rimas (puedes ampliar esta lista)
const PALABRAS_CON_RIMAS = [
  { palabra: "casa", rimas: ["masa", "tasa", "gasa", "asa"] },
  { palabra: "flor", rimas: ["amor", "dolor", "color", "calor"] },
  { palabra: "luna", rimas: ["una", "tuna", "fortuna", "cuna"] },
  { palabra: "sol", rimas: ["col", "rol", "hol", "mol"] },
  { palabra: "árbol", rimas: ["fárbol", "márbol", "cárbol"] },
  { palabra: "pez", rimas: ["vez", "luz", "cruz", "altivez"] },
  { palabra: "mano", rimas: ["llano", "hermano", "gano", "piano"] },
  { palabra: "pato", rimas: ["trato", "gato", "plato", "rato"] }
];

export default function JuegoDeRimas() {
  const [palabraActual, setPalabraActual] = useState(null);
  const [opciones, setOpciones] = useState([]);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [esCorrecto, setEsCorrecto] = useState(null);
  const [puntaje, setPuntaje] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(true);

  // Inicializar el juego
  const iniciarJuego = () => {
    setMostrarInstrucciones(false);
    setJuegoTerminado(false);
    setPuntaje(0);
    seleccionarNuevaPalabra();
  };

  // Seleccionar una nueva palabra y sus opciones
  const seleccionarNuevaPalabra = () => {
    const palabrasDisponibles = PALABRAS_CON_RIMAS.filter(p => p.palabra !== palabraActual?.palabra);
    
    if (palabrasDisponibles.length === 0) {
      setJuegoTerminado(true);
      return;
    }

    const nuevaPalabra = palabrasDisponibles[Math.floor(Math.random() * palabrasDisponibles.length)];
    setPalabraActual(nuevaPalabra);

    // Mezclar las opciones (2 rimas correctas y 2 incorrectas)
    const rimasCorrectas = [...nuevaPalabra.rimas].sort(() => Math.random() - 0.5).slice(0, 2);
    
    // Obtener rimas incorrectas de otras palabras
    const todasLasRimas = PALABRAS_CON_RIMAS.flatMap(p => p.rimas);
    const rimasIncorrectas = todasLasRimas
      .filter(r => !nuevaPalabra.rimas.includes(r))
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    const todasLasOpciones = [...rimasCorrectas, ...rimasIncorrectas].sort(() => Math.random() - 0.5);
    setOpciones(todasLasOpciones);
    setOpcionSeleccionada(null);
    setEsCorrecto(null);
  };

  // Manejar selección de opción
  const manejarSeleccion = (opcion) => {
    if (esCorrecto !== null) return; // Evitar múltiples selecciones

    const correcta = palabraActual.rimas.includes(opcion);
    setOpcionSeleccionada(opcion);
    setEsCorrecto(correcta);
    
    if (correcta) {
      setPuntaje(puntaje + 1);
      setTimeout(seleccionarNuevaPalabra, 1500);
    } else {
      setTimeout(seleccionarNuevaPalabra, 1500);
    }
  };

  // Efecto para iniciar el juego al montar el componente
  useEffect(() => {
    if (!mostrarInstrucciones && !juegoTerminado && !palabraActual) {
      seleccionarNuevaPalabra();
    }
  }, [mostrarInstrucciones, juegoTerminado, palabraActual]);

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start p-4 max-w-4xl mx-auto">
      {/* Panel principal del juego */}
      <div className="w-full bg-white rounded-xl shadow-lg p-6">
        {mostrarInstrucciones ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">¡Encuentra las Rimas!</h2>
            <p className="mb-6 text-gray-700">
              En este juego, verás una palabra y deberás seleccionar cuál de las opciones <strong>rima</strong> con ella.
              <br />
              Las palabras que riman suenan parecido al final, como <strong>"casa"</strong> y <strong>"masa"</strong>.
            </p>
            <button
              onClick={iniciarJuego}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
            >
              ¡Comenzar!
            </button>
          </div>
        ) : juegoTerminado ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">¡Juego Terminado!</h2>
            <p className="text-xl mb-6">Tu puntaje: <span className="font-bold">{puntaje}</span> de {PALABRAS_CON_RIMAS.length}</p>
            <button
              onClick={iniciarJuego}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
            >
              Jugar de nuevo
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
              ¿Cuál de estas palabras rima con...?
            </h2>
            
            <div className="text-center mb-8">
              <div className="inline-block bg-yellow-100 px-6 py-3 rounded-lg shadow-sm">
                <span className="text-3xl font-bold text-blue-700">{palabraActual?.palabra}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {opciones.map((opcion) => {
                const esSeleccionada = opcionSeleccionada === opcion;
                let claseBoton = "py-4 px-2 rounded-lg font-medium text-lg transition-all ";
                
                if (esSeleccionada) {
                  claseBoton += esCorrecto 
                    ? "bg-green-300 text-green-800 shadow-inner" 
                    : "bg-red-300 text-red-800 shadow-inner";
                } else if (esCorrecto !== null && palabraActual.rimas.includes(opcion)) {
                  claseBoton += "bg-green-100 text-green-700";
                } else {
                  claseBoton += "bg-gray-100 hover:bg-gray-200 text-gray-700";
                }
                
                return (
                  <button
                    key={opcion}
                    className={claseBoton}
                    onClick={() => manejarSeleccion(opcion)}
                    disabled={esCorrecto !== null}
                  >
                    {opcion}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 text-center">
              <span className="font-semibold">Puntaje: </span>
              <span className="text-xl font-bold">{puntaje}</span>
            </div>
          </>
        )}
      </div>
      
      {/* Panel lateral con información */}
      <div className="w-full md:w-64 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">¿Qué es una rima?</h3>
        <p className="text-gray-600 mb-4">
          Una rima es cuando dos palabras suenan parecido al final, como:
        </p>
        <ul className="space-y-2 mb-6">
          <li className="text-blue-600">• <strong>Casa</strong> - <strong>Masa</strong></li>
          <li className="text-blue-600">• <strong>Flor</strong> - <strong>Amor</strong></li>
          <li className="text-blue-600">• <strong>Luna</strong> - <strong>Tuna</strong></li>
        </ul>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-2">Consejo:</h4>
          <p className="text-yellow-700 text-sm">
            Pronuncia las palabras en voz alta para escuchar mejor si riman.
          </p>
        </div>
      </div>
    </div>
  );
}
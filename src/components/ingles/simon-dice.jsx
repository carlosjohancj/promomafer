import { useState, useEffect, useCallback } from 'preact/hooks';
import { FaRunning, FaRedo, FaShoePrints, FaHandPaper, FaEye, FaLaugh, FaHeart } from 'react-icons/fa';
import { IoMdMic } from 'react-icons/io';
import { FaHandsClapping } from "react-icons/fa6";
// Acciones actualizadas sin "tocar cabeza" y con nuevos íconos
const ACTIONS = [
  { id: 'wave', command: "wave your hand", icon: FaHandPaper, iconText: "Wave" },
  { id: 'jump', command: "jump", icon: FaRunning, iconText: "Jump" },
  { id: 'clap', command: "clap your hands", icon: FaHandsClapping, iconText: "Clap" },
  { id: 'spin', command: "spin around", icon: FaRedo, iconText: "Spin" },
  { id: 'stomp', command: "stomp your feet", icon: FaShoePrints, iconText: "Stomp" },
  { id: 'blink', command: "blink your eyes", icon: FaEye, iconText: "Blink" },
  { id: 'laugh', command: "laugh out loud", icon: FaLaugh, iconText: "Laugh" },
  { id: 'love', command: "show love", icon: FaHeart, iconText: "Love" }
];

// Textos del juego
const TEXTS = {
  title: {
    en: "Simon Says Game",
    es: "Juego Simón Dice"
  },
  instructions: {
    en: "Only follow the command if it starts with 'Simon says'!",
    es: "¡Solo sigue el comando si empieza con 'Simón dice'!"
  },
  correct: {
    en: "Great job! You followed Simon!",
    es: "¡Bien hecho! ¡Obedeciste a Simón!"
  },
  wrongCommand: {
    en: "Oops! Simon didn't say!",
    es: "¡Ups! ¡Simón no dijo eso!"
  },
  missed: {
    en: "You missed Simon's command!",
    es: "¡Te perdiste el comando de Simón!"
  },
  start: {
    en: "Start Game",
    es: "Comenzar Juego"
  },
  score: {
    en: "Score:",
    es: "Puntuación:"
  },
  level: {
    en: "Level:",
    es: "Nivel:"
  },
  simonSays: {
    en: "Simon says",
    es: "Simón dice"
  },
  listening: {
    en: "Listening to Simon...",
    es: "Escuchando a Simón..."
  },
  repeat: {
    en: "Repeat Command",
    es: "Repetir Comando"
  },
  currentCommand: {
    en: "Current Command:",
    es: "Comando Actual:"
  },
  next: {
    en: "Next Command",
    es: "Siguiente Comando"
  },
  waiting: {
    en: "Waiting for your action...",
    es: "Esperando tu acción..."
  }
};

export default function SimonSaysGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [currentCommand, setCurrentCommand] = useState("");
  const [currentAction, setCurrentAction] = useState("");
  const [isSimonSays, setIsSimonSays] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState('es');
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [showCommand, setShowCommand] = useState(true);

  // Verificar soporte de voz
  useEffect(() => {
    setIsSpeechSupported('speechSynthesis' in window);
  }, []);

  // Función para hablar
  const speak = useCallback((text) => {
    if (!isSpeechSupported) return;
    
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = text;
    utterance.lang = 'en-US';
    utterance.rate = 0.6; // Velocidad aún más lenta para mejor comprensión
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Mantener el comando visible por más tiempo después de hablar
      setTimeout(() => setShowCommand(false), 2000);
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [isSpeechSupported]);

  // Generar nuevo comando
  const generateCommand = useCallback(() => {
    const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const shouldSaySimon = Math.random() > 0.3;
    
    const commandText = shouldSaySimon 
      ? `${TEXTS.simonSays[language]} ${randomAction.command}`
      : randomAction.command;
    
    const actionText = randomAction.command;
    
    setIsSimonSays(shouldSaySimon);
    setCurrentCommand(commandText);
    setCurrentAction(actionText);
    setShowCommand(true);
    
    if (isSpeechSupported) {
      speak(shouldSaySimon ? `Simon says ${randomAction.command}` : randomAction.command);
    }
  }, [language, isSpeechSupported, speak]);

  // Iniciar juego
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setLevel(1);
    generateCommand();
  };

  // Manejar acción del jugador
  const handleAction = (actionId) => {
    if (!gameStarted || isSpeaking) return;
    
    const action = ACTIONS.find(a => a.id === actionId);
    if (!action) return;
    
    const isCorrectAction = currentAction === action.command;
    
    if (isSimonSays && isCorrectAction) {
      setFeedback(TEXTS.correct[language]);
      setScore(s => s + 1);
      if (score > 0 && score % 5 === 0) setLevel(l => l + 1);
    } else if (!isSimonSays && isCorrectAction) {
      setFeedback(TEXTS.wrongCommand[language]);
      setScore(s => Math.max(0, s - 1));
    } else if (isSimonSays) {
      setFeedback(TEXTS.wrongCommand[language]);
      setScore(s => Math.max(0, s - 1));
    }
    
    setShowCommand(false);
  };

  // Repetir comando
  const repeatCommand = () => {
    if (currentCommand && isSpeechSupported) {
      speak(isSimonSays 
        ? `Simon says ${currentCommand.replace(`${TEXTS.simonSays[language]} `, '')}` 
        : currentCommand);
    }
  };

  // Renderizar botones de acción
  const renderActionButtons = () => {
    // Mostrar todas las acciones disponibles
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {ACTIONS.map(({id, icon: Icon, iconText}) => (
          <button
            key={id}
            onClick={() => handleAction(id)}
            disabled={!gameStarted || isSpeaking}
            className={`flex flex-col items-center p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-all ${
              !gameStarted || isSpeaking ? 'opacity-50' : 'hover:bg-gray-50'
            }`}
          >
            <Icon className="text-3xl mb-2 text-blue-600" />
            <span className="text-sm font-medium">{iconText}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-600">
            {TEXTS.title[language]}
          </h1>
          <button 
            onClick={() => setLanguage(l => l === 'es' ? 'en' : 'es')}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
          >
            {language === 'es' ? 'EN' : 'ES'}
          </button>
        </div>
        
        {/* Instrucciones */}
        <p className="mb-6 text-gray-700">
          {TEXTS.instructions[language]}
        </p>
        
        {/* Puntaje y nivel */}
        {gameStarted && (
          <div className="flex gap-4 mb-6">
            <div className="font-bold">
              {TEXTS.score[language]} <span className="text-xl">{score}</span>
            </div>
            <div className="font-bold">
              {TEXTS.level[language]} <span className="text-xl">{level}</span>
            </div>
          </div>
        )}
        
        {/* Área de Simón */}
        <div className={`relative bg-blue-50 rounded-lg p-6 mb-6 text-center transition-all min-h-40 flex flex-col items-center justify-center ${
          isSimonSays ? 'border-2 border-blue-300' : 'border-2 border-transparent'
        }`}>
          <div className="text-6xl mb-4">👨</div>
          
          {/* Comando actual - siempre visible cuando hay comando */}
          {gameStarted && showCommand && currentCommand && (
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-600">
                {TEXTS.currentCommand[language]}
              </div>
              <div className={`text-xl font-medium mt-1 ${
                isSimonSays ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {currentCommand}
              </div>
            </div>
          )}
          
          {/* Indicador de audio */}
          {isSpeaking && (
            <div className="flex items-center text-blue-600 mb-2">
              <IoMdMic className="animate-pulse mr-2" />
              <span>{TEXTS.listening[language]}</span>
            </div>
          )}
          
          {/* Botones de control */}
          <div className="flex gap-4 mt-4">
            {/* Botón para repetir */}
            {!isSpeaking && gameStarted && isSpeechSupported && (
              <button
                onClick={repeatCommand}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center gap-2"
              >
                <IoMdMic />
                {TEXTS.repeat[language]}
              </button>
            )}
            
            {/* Botón siguiente */}
            {gameStarted && !showCommand && (
              <button
                onClick={generateCommand}
                className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg flex items-center gap-2"
              >
                {TEXTS.next[language]}
              </button>
            )}
          </div>
        </div>
        
        {/* Mensaje de espera */}
        {gameStarted && !showCommand && !currentCommand && (
          <div className="text-center text-gray-600 mb-6">
            {TEXTS.waiting[language]}
          </div>
        )}
        
        {/* Retroalimentación */}
        {feedback && (
          <div className={`mb-4 p-3 rounded-lg text-center font-bold ${
            feedback === TEXTS.correct[language] 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {feedback}
          </div>
        )}
        
        {/* Botones de acción */}
        {renderActionButtons()}
        
        {/* Botón de inicio */}
        {!gameStarted && (
          <button
            onClick={startGame}
            className="mt-6 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
          >
            {TEXTS.start[language]}
          </button>
        )}
        
        {/* Advertencia si no hay soporte de voz */}
        {!isSpeechSupported && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            {language === 'es' 
              ? 'Nota: Los comandos se mostrarán como texto. ¡Sigue las instrucciones en pantalla!' 
              : 'Note: Commands will appear as text. Follow the on-screen instructions!'}
          </div>
        )}
      </div>
    </div>
  );
}
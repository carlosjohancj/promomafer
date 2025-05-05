import { useState, useEffect, useRef } from 'preact/hooks';
import { FaPlay, FaPause, FaRedo } from 'react-icons/fa';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const OBJECT_TYPES = ['balloon', 'kite', 'bird', 'ufo'];
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange'];
const START_SPEED = 10000; // 10 segundos para cruzar la pantalla
const SPEED_INCREASE = 0.95; // Cada nivel es 5% más rápido
const LEVEL_UP_SCORE = 10;

const FlyingObject = ({ type, letter, color, top, left, duration, onDestroy, onReachBottom }) => {
    const [exploded, setExploded] = useState(false);
    const objectRef = useRef(null);
    
    useEffect(() => {
        const element = objectRef.current;
        if (!element) return;
        
        const handleAnimationEnd = () => {
            if (!exploded) {
                onReachBottom();
            }
        };
        
        element.addEventListener('animationend', handleAnimationEnd);
        return () => element.removeEventListener('animationend', handleAnimationEnd);
    }, [exploded, onReachBottom]);
    
    const handleClick = () => {
        setExploded(true);
        setTimeout(() => onDestroy(), 500);
    };
    
    const getObjectImage = () => {
        switch(type) {
            case 'balloon':
                return (
                    <div className={`w-16 h-20 rounded-full border-4 border-${color}-500 bg-${color}-200 flex items-center justify-center relative`}>
                        <div className="w-1 h-8 bg-gray-400 mt-16 absolute"></div>
                    </div>
                );
            case 'kite':
                return (
                    <div className={`w-16 h-16 bg-${color}-500 rotate-45 flex items-center justify-center relative`}>
                        <div className="-rotate-45"></div>
                    </div>
                );
            case 'bird':
                return (
                    <div className={`w-16 h-12 bg-${color}-500 rounded-full flex items-center justify-center relative`}>
                        <div className="w-4 h-4 bg-yellow-400 rounded-full absolute -right-1 -top-1"></div>
                        <div className="w-2 h-8 bg-yellow-400 absolute right-0 top-4 -rotate-45"></div>
                    </div>
                );
            case 'ufo':
                return (
                    <div className="flex flex-col items-center relative">
                        <div className={`w-16 h-6 bg-${color}-600 rounded-full`}></div>
                        <div className={`w-12 h-3 bg-${color}-400 rounded-full -mt-1`}></div>
                    </div>
                );
            default:
                return <div className={`w-16 h-16 bg-${color}-500 rounded-full`}></div>;
        }
    };
    
    return (
        <div
            ref={objectRef}
            className={`absolute flying-object ${exploded ? 'explosion' : ''} cursor-pointer`}
            style={{
                '--start-x': `${left}px`,
                '--end-x': `${Math.random() * 100 - 50}px`,
                '--duration': `${duration}ms`,
                top: `${top}px`,
                left: `${left}px`,
            }}
            onClick={handleClick}
        >
            <div className="flex flex-col items-center">
                {getObjectImage()}
                <div className={`text-2xl font-bold mt-1 text-${color}-300`}>{letter}</div>
            </div>
        </div>
    );
};

const SpaceBirds = () => {
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [objects, setObjects] = useState([]);
    const [lives, setLives] = useState(3);
    const [isPaused, setIsPaused] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const gameAreaRef = useRef(null);
    
    const spawnObject = () => {
        if (isPaused || !gameStarted || gameOver) return;
        
        const type = OBJECT_TYPES[Math.floor(Math.random() * OBJECT_TYPES.length)];
        const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        const gameArea = gameAreaRef.current;
        if (!gameArea) return;
        
        const maxLeft = gameArea.clientWidth - 80;
        const left = Math.random() * maxLeft;
        const duration = START_SPEED * Math.pow(SPEED_INCREASE, level - 1);
        
        const newObject = {
            id: Date.now() + Math.random(),
            type,
            letter,
            color,
            top: 0,
            left,
            duration
        };
        
        setObjects(prev => [...prev, newObject]);
    };
    
    const destroyObject = (id, scored = true) => {
        setObjects(prev => prev.filter(obj => obj.id !== id));
        if (scored) {
            setScore(prev => prev + level);
            if (score > 0 && score % LEVEL_UP_SCORE === 0) {
                setLevel(prev => prev + 1);
            }
        }
    };
    
    const handleKeyDown = (e) => {
        if (!gameStarted || gameOver) return;
        
        const keyPressed = e.key.toUpperCase();
        const objectToDestroy = objects.find(obj => obj.letter === keyPressed);
        
        if (objectToDestroy) {
            destroyObject(objectToDestroy.id);
        }
    };
    
    const handleObjectReachBottom = (id) => {
        destroyObject(id, false);
        setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
                setGameOver(true);
            }
            return newLives;
        });
    };
    
    const startGame = () => {
        setScore(0);
        setLevel(1);
        setLives(3);
        setObjects([]);
        setGameOver(false);
        setGameStarted(true);
    };
    
    const togglePause = () => {
        setIsPaused(prev => !prev);
    };
    
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [objects, gameStarted, gameOver]);
    
    useEffect(() => {
        if (!gameStarted || gameOver || isPaused) return;
        
        const spawnInterval = setInterval(spawnObject, 2000 - (level * 100));
        
        return () => clearInterval(spawnInterval);
    }, [gameStarted, gameOver, level, isPaused]);
    
    return (
        <div className="flex flex-col items-center w-full">
            <h1 className="text-4xl font-bold mb-2 text-purple-600">¡Aves Espaciales!</h1>
            <p className="text-lg mb-6 text-center text-gray-700">
                ¡Practica tu mecanografía derribando objetos voladores espaciales! Pulsa la letra correcta antes de que te alcancen.
            </p>
            
            {!gameStarted ? (
                <div className="flex flex-col items-center mt-4 w-full">
                    <button 
                        onClick={startGame}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-xl mb-4 transition-colors flex items-center gap-2"
                    >
                        <FaPlay /> Comenzar Juego
                    </button>
                    <div className="text-gray-600 text-center max-w-md">
                        <p className="mb-2 font-semibold">Instrucciones:</p>
                        <p className="mb-1">1. Los objetos voladores aparecerán en la pantalla.</p>
                        <p className="mb-1">2. Cada objeto tiene una letra asignada.</p>
                        <p className="mb-1">3. Presiona la tecla correspondiente en tu teclado para derribarlo.</p>
                        <p className="mb-1">4. Si un objeto llega al fondo, perderás una vida.</p>
                        <p>5. Cada 10 puntos subes de nivel y los objetos se mueven más rápido.</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between w-full mb-4">
                        <div className="text-lg">
                            <span className="text-gray-600">Puntuación: </span>
                            <span className="font-bold text-yellow-600">{score}</span>
                        </div>
                        <div className="text-lg">
                            <span className="text-gray-600">Nivel: </span>
                            <span className="font-bold text-blue-600">{level}</span>
                        </div>
                        <div className="flex items-center">
                            {[...Array(3)].map((_, i) => 
                                <div 
                                    key={i}
                                    className={`w-5 h-5 rounded-full mx-1 ${i < lives ? 'bg-red-500' : 'bg-gray-300'}`}
                                />
                            )}
                        </div>
                        <button 
                            onClick={togglePause}
                            className="bg-gray-200 hover:bg-gray-300 px-4 py-1 rounded flex items-center gap-1"
                        >
                            {isPaused ? <FaPlay size={14} /> : <FaPause size={14} />}
                            {isPaused ? 'Continuar' : 'Pausar'}
                        </button>
                    </div>
                    
                    <div 
                        ref={gameAreaRef}
                        className="relative w-full h-96 bg-gray-100 rounded-lg border-2 border-purple-200 overflow-hidden"
                        style={{ backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', 
                                 backgroundSize: '20px 20px' }}
                    >
                        {objects.map(obj => 
                            <FlyingObject
                                key={obj.id}
                                type={obj.type}
                                letter={obj.letter}
                                color={obj.color}
                                top={obj.top}
                                left={obj.left}
                                duration={obj.duration}
                                onDestroy={() => destroyObject(obj.id)}
                                onReachBottom={() => handleObjectReachBottom(obj.id)}
                            />
                        )}
                        <div 
                            className="absolute bottom-0 left-0 right-0 h-2 bg-red-500"
                            style={{ boxShadow: '0 0 10px 2px rgba(239, 68, 68, 0.7)' }}
                        />
                        {gameOver && (
                            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
                                <div className="text-3xl font-bold mb-4 text-red-500">¡Juego Terminado!</div>
                                <div className="text-xl mb-6">Puntuación final: {score}</div>
                                <button 
                                    onClick={startGame}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg text-lg transition-colors flex items-center gap-2"
                                >
                                    <FaRedo /> Jugar de nuevo
                                </button>
                            </div>
                        )}
                        {isPaused && !gameOver && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="text-3xl font-bold text-white">PAUSA</div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-4 text-gray-600 text-sm">
                        Presiona la tecla correspondiente a la letra en los objetos para derribarlos.
                    </div>
                </>
            )}
        </div>
    );
};

export default SpaceBirds;
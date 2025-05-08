import { useState, useEffect, useRef } from 'preact/hooks';
import { FaPlay, FaPause, FaRedo } from 'react-icons/fa';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange'];
const START_SPEED = 20000; // 10 segundos para cruzar la pantalla
const SPEED_INCREASE = 0.95; // Cada nivel es 5% más rápido
const LEVEL_UP_SCORE = 10;

const FloatingLetter = ({ letter, color, left, duration, onDestroy, onReachBottom }) => {
    const [exploded, setExploded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const letterRef = useRef(null);

    useEffect(() => {
        const element = letterRef.current;
        if (!element) return;

        // Esperar a que el elemento esté en el DOM y sea visible
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const element = letterRef.current;
        if (!element) return;

        requestAnimationFrame(() => {
            element.style.animation = `fall ${duration}ms linear forwards`;
        });

        const handleAnimationEnd = () => {
            if (!exploded) {
                onReachBottom();
            }
        };

        element.addEventListener('animationend', handleAnimationEnd);
        return () => element.removeEventListener('animationend', handleAnimationEnd);
    }, [duration, exploded, onReachBottom, isVisible]);

    const handleClick = () => {
        setExploded(true);
        setTimeout(() => onDestroy(), 500);
    };

    return (
        <div
            ref={letterRef}
            className={`flying-letter ${exploded ? 'explosion' : ''} cursor-pointer`}
            style={{
                '--left': `${left}px`,
                '--duration': duration,
                opacity: isVisible ? 1 : 0
            }}
            onClick={handleClick}
        >
            <div className={`text-4xl font-bold text-${color}-500`}>{letter}</div>
        </div>
    );
};

const SpaceLetters = () => {
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [letters, setLetters] = useState([]);
    const [lives, setLives] = useState(3);
    const [isPaused, setIsPaused] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const gameAreaRef = useRef(null);

    const spawnLetter = () => {
        if (isPaused || !gameStarted || gameOver) return;

        const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];

        const gameArea = gameAreaRef.current;
        if (!gameArea) return;

        // Calcular el margen de seguridad basado en el tamaño de la letra
        const letterSize = 40; // Tamaño aproximado de la letra en píxeles
        const margin = letterSize;
        const maxLeft = gameArea.clientWidth - (margin * 2);
        const left = margin + (Math.random() * maxLeft);

        // Duración base ajustada al tamaño del contenedor
        const baseDuration = START_SPEED * (400 / gameArea.clientHeight);
        const duration = baseDuration * Math.pow(SPEED_INCREASE, level - 1);

        const newLetter = {
            id: Date.now() + Math.random(),
            letter,
            color,
            left,
            duration
        };

        setLetters(prev => [...prev, newLetter]);
    };

    const destroyLetter = (id, scored = true) => {
        setLetters(prev => prev.filter(l => l.id !== id));
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
        const letterToDestroy = letters.find(l => l.letter === keyPressed);

        if (letterToDestroy) {
            destroyLetter(letterToDestroy.id);
        }
    };

    const handleLetterReachBottom = (id) => {
        destroyLetter(id, false);
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
        setLetters([]);
        setGameOver(false);
        setGameStarted(true);
    };

    const togglePause = () => {
        setIsPaused(prev => !prev);
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [letters, gameStarted, gameOver]);

    useEffect(() => {
        if (!gameStarted || gameOver || isPaused) return;

        const spawnInterval = setInterval(spawnLetter, 2000 - (level * 100));

        return () => clearInterval(spawnInterval);
    }, [gameStarted, gameOver, level, isPaused]);

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
            <h1 className="text-4xl font-bold mb-2 text-purple-600">¡Letras Voladoras!</h1>
            <p className="text-lg mb-6 text-center text-gray-700">
                ¡Practica tu mecanografía presionando las letras antes de que lleguen al fondo!
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
                        <p className="mb-1">1. Las letras aparecerán en la pantalla.</p>
                        <p className="mb-1">2. Presiona la tecla correspondiente en tu teclado.</p>
                        <p className="mb-1">3. Si una letra llega al fondo, perderás una vida.</p>
                        <p>4. Cada 10 puntos subes de nivel y las letras se mueven más rápido.</p>
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
                        {letters.map(letter => 
                            <FloatingLetter
                                key={letter.id}
                                letter={letter.letter}
                                color={letter.color}
                                left={letter.left}
                                duration={letter.duration}
                                onDestroy={() => destroyLetter(letter.id)}
                                onReachBottom={() => handleLetterReachBottom(letter.id)}
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
                        Presiona la tecla correspondiente a las letras que aparecen en pantalla.
                    </div>
                </>
            )}
        </div>
    );
};

export default SpaceLetters;
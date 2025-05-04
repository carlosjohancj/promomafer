import { useState, useEffect } from 'preact/hooks';

const questions = [
  { question: "¿Cuánto es 3 + 4?", options: [5, 6, 7, 8], answer: 7 },
  { question: "¿Cuánto es 10 - 3?", options: [5, 6, 7, 8], answer: 7 },
  { question: "¿Qué número es mayor: 12 o 21?", options: [12, 21], answer: 21 },
  { question: "¿Cuánto es 2 + 2 + 2?", options: [4, 5, 6, 8], answer: 6 },
  { question: "¿Cuánto es 8 - 5?", options: [2, 3, 4, 5], answer: 3 },
  { question: "¿Qué número es menor: 9 o 7?", options: [7, 9], answer: 7 },
  { question: "¿Cuánto es 4 + 5?", options: [8, 9, 10, 11], answer: 9 },
  { question: "¿Cuánto es 10 - 4?", options: [4, 5, 6, 7], answer: 6 }
];

export default function TesoroNumeros() {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showTreasure, setShowTreasure] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  
  const handleOptionClick = (option) => {
    setSelectedOption(option);
    const correct = option === questions[currentStep].answer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Game completed
        setShowTreasure(true);
      }
      setSelectedOption(null);
      setIsCorrect(null);
    }, 1000);
  };
  
  const restartGame = () => {
    setCurrentStep(0);
    setScore(0);
    setShowTreasure(false);
    setSelectedOption(null);
    setIsCorrect(null);
  };
  
  if (showTreasure) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-8 text-6xl animate-bounce">🏆</div>
        <h2 className="text-3xl font-bold mb-4 text-math-dark">
          ¡Encontraste el tesoro!
        </h2>
        <p className="text-xl mb-6">
          Contestaste correctamente {score} de {questions.length} preguntas.
        </p>
        <div className="flex justify-center mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`text-3xl ${i < Math.ceil((score / questions.length) * 5) ? '' : 'opacity-30'}`}>
              ⭐
            </div>
          ))}
        </div>
        <button
          onClick={restartGame}
          className="bg-math-DEFAULT hover:bg-math-dark text-white font-bold py-3 px-6 rounded-full transition-colors duration-300"
        >
          Jugar de nuevo
        </button>
      </div>
    );
  }
  
  const currentQuestion = questions[currentStep];
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between mb-6">
        <div>
          <p className="font-bold text-math-dark">Pregunta {currentStep + 1}/{questions.length}</p>
        </div>
        <div>
          <p className="font-bold text-math-dark">Puntos: {score}</p>
        </div>
      </div>
      
      <div className="bg-math-light p-6 rounded-xl mb-8 shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-math-dark text-center">
          {currentQuestion.question}
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              disabled={selectedOption !== null}
              className={`p-4 text-xl font-bold rounded-lg transition-all duration-300 ${
                selectedOption === option
                  ? isCorrect
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-white hover:bg-math-DEFAULT hover:text-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-math-light rounded-full flex items-center justify-center text-2xl">
          {currentStep + 1}
        </div>
        <div className="h-2 flex-1 bg-gray-200 mx-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-math-DEFAULT rounded-full"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="w-12 h-12 bg-math-light rounded-full flex items-center justify-center text-2xl">
          🏆
        </div>
      </div>
    </div>
  );
}
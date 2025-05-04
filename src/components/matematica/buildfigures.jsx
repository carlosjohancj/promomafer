import { useState, useEffect, useRef } from 'preact/hooks';

export default function BuildFigures() {
  const targetShapes = ['circle', 'square', 'triangle'];
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [pieces, setPieces] = useState([]);
  const targetRef = useRef(null);
  const piecesRef = useRef([]);
  const containerRef = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [offsets, setOffsets] = useState({ x: 0, y: 0 });

  const currentShape = targetShapes[currentShapeIndex];
  const colors = ['bg-red-300', 'bg-blue-300', 'bg-yellow-300', 'bg-green-300', 'bg-purple-300'];

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const numPieces = 5;
      const newPieces = Array.from({ length: numPieces }, (_, i) => {
        const size = Math.random() * 30 + 20;
        const x = Math.random() * (container.offsetWidth - size);
        const y = Math.random() * (container.offsetHeight - size * 2);
        const colorClass = colors[i % colors.length];
        const shapeType = Math.random() < 0.5 ? 'rect' : 'circle';
        return {
          id: i,
          type: shapeType,
          size,
          x,
          y,
          colorClass,
          originalX: x,
          originalY: y,
        };
      });
      setPieces(newPieces);
    }
  }, [currentShape]);

  useEffect(() => {
    piecesRef.current = piecesRef.current.slice(0, pieces.length);
  }, [pieces]);

  const handleMouseDown = (event, index) => {
    const pieceElement = piecesRef.current[index];
    if (pieceElement) {
      const rect = pieceElement.getBoundingClientRect();
      setOffsets({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
      setDraggingIndex(index);
      pieceElement.classList.add('cursor-grabbing');
    }
  };

  const handleMouseMove = (event) => {
    if (draggingIndex !== null) {
      const pieceElement = piecesRef.current[draggingIndex];
      if (pieceElement && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newX = event.clientX - offsets.x - containerRect.left;
        const newY = event.clientY - offsets.y - containerRect.top;

        setPieces(prevPieces =>
          prevPieces.map((piece, index) =>
            index === draggingIndex ? { ...piece, x: newX, y: newY } : piece
          )
        );
      }
    }
  };

  const handleMouseUp = () => {
    if (draggingIndex !== null) {
      const pieceElement = piecesRef.current[draggingIndex];
      const targetElement = targetRef.current;
      const piece = pieces[draggingIndex];

      if (pieceElement && targetElement && piece) {
        const pieceRect = pieceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();

        // Lógica de "encajar" (simplificada: centro dentro del objetivo)
        const pieceCenterX = pieceRect.left + pieceRect.width / 2;
        const pieceCenterY = pieceRect.top + pieceRect.height / 2;
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        const isOverlapping =
          pieceCenterX > targetRect.left &&
          pieceCenterX < targetRect.right &&
          pieceCenterY > targetRect.top &&
          pieceCenterY < targetRect.bottom;

        if (isOverlapping) {
          alert('¡Encajó!');
          setCurrentShapeIndex((prevIndex) => (prevIndex + 1) % targetShapes.length);
          setPieces([]); // Reset las piezas para la siguiente figura
        } else {
          // Si no encaja, regresa a la posición original (sin animación compleja)
          setPieces(prevPieces =>
            prevPieces.map((p, index) =>
              index === draggingIndex ? { ...p, x: p.originalX, y: p.originalY } : p
            )
          );
        }
      }
      setDraggingIndex(null);
      if (pieceElement) {
        pieceElement.classList.remove('cursor-grabbing');
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingIndex, offsets]);

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gray-100 rounded-md shadow-md p-6">
      <div
        ref={targetRef}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-blue-500 flex items-center justify-center rounded-md text-blue-500 font-bold uppercase`}
      >
        {currentShape}
      </div>

      {pieces.map((piece, index) => (
        <div
          key={piece.id}
          ref={(el) => (piecesRef.current[index] = el)}
          className={`absolute cursor-grab transition-transform duration-150 ease-out shadow-sm`}
          style={{
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            backgroundColor: piece.colorClass.split('-')[1] ? `rgb(var(--color-${piece.colorClass.split('-')[1]}))` : '', // Acceder al color de Tailwind
            borderRadius: piece.type === 'circle' ? '50%' : '0%',
          }}
          onMouseDown={(e) => handleMouseDown(e, index)}
        ></div>
      ))}
    </div>
  );
}
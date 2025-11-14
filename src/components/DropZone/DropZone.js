import React from 'react';

const DropZone = ({
  parentPath,
  insertIndex,
  draggedItem,
  draggedElementType,
  hoveredDropZone,
  setHoveredDropZone,
  handleDropAtPosition
}) => {
  const zoneId = `${parentPath.join('-')}-insert-${insertIndex}`;
  const isDragging = draggedItem || draggedElementType;
  const isHovered = hoveredDropZone === zoneId;

  if (!isDragging) return null;

  return (
    <div
      key={`dropzone-${zoneId}`}
      className={`transition-all duration-200 ${
        isHovered ? 'h-16 z-[9999]' : 'h-8 z-[9999]'
      }`}
      style={{
        pointerEvents: 'auto',
        position: 'relative',
        marginTop: isHovered ? '-8px' : '-4px',
        marginBottom: isHovered ? '-8px' : '-4px'
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setHoveredDropZone(zoneId);
        e.currentTarget.dataset.insertIndex = insertIndex;
        e.currentTarget.dataset.parentPath = JSON.stringify(parentPath);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        const isOutside = x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;
        if (isOutside) {
          setHoveredDropZone(null);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();

        const insertIdx = parseInt(e.currentTarget.dataset.insertIndex);
        const parent = JSON.parse(e.currentTarget.dataset.parentPath);

        handleDropAtPosition(e, parent, insertIdx);
        setHoveredDropZone(null);
      }}
    >
      {/* Drop zone indicator */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
        isHovered ? 'opacity-100' : 'opacity-30 hover:opacity-70'
      }`}>
        {/* Line */}
        <div className={`w-full transition-all duration-200 ${
          isHovered ? 'h-1 bg-blue-600' : 'h-0.5 bg-blue-400'
        } relative`}>
          {/* Dots at the ends */}
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 transition-all duration-200 ${
            isHovered ? 'w-3 h-3' : 'w-2 h-2'
          }`}></div>
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 transition-all duration-200 ${
            isHovered ? 'w-3 h-3' : 'w-2 h-2'
          }`}></div>
          {/* Center dot */}
          {isHovered && (
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          )}
        </div>
        {/* Label when hovered */}
        {isHovered && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-lg whitespace-nowrap">
            Вставить сюда
          </div>
        )}
      </div>
    </div>
  );
};

export default DropZone;

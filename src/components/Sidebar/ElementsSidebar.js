import React from 'react';
import { elementTypes, categories } from '../../constants';

const ElementsSidebar = ({ onAddElement, onElementDragStart }) => {
  return (
    <div className="p-4">
      <h3 className="font-bold mb-3 text-sm flex items-center gap-2">
        <span>Elements</span>
        <span className="text-xs font-normal text-gray-500">(drag to canvas)</span>
      </h3>
      {categories.map(category => (
        <div key={category} className="mb-4">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">{category}</h4>
          <div className="space-y-1">
            {elementTypes
              .filter(el => el.category === category)
              .map((el) => (
                <div
                  key={el.type}
                  draggable
                  onDragStart={(e) => onElementDragStart(e, el.type)}
                  onClick={() => onAddElement(el.type)}
                  className="w-full p-2 border rounded hover:bg-blue-50 text-left flex items-center gap-2 text-xs cursor-move hover:shadow-md transition-all active:opacity-50"
                >
                  <span className="text-sm">{el.icon}</span>
                  <span>{el.label}</span>
                  <span className="ml-auto text-gray-400">⋮⋮</span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ElementsSidebar;

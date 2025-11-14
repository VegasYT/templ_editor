import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Download, Upload, Eye, Code, Settings, ChevronDown, ChevronRight, GripVertical, X } from 'lucide-react';

const App = () => {
  const [structure, setStructure] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [editableStyles, setEditableStyles] = useState({});
  const [defaultData, setDefaultData] = useState({});
  const [templateName, setTemplateName] = useState('CustomBlock');
  const [categoryId, setCategoryId] = useState(1);
  const [viewMode, setViewMode] = useState('builder');
  const [collapsedNodes, setCollapsedNodes] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [dropZone, setDropZone] = useState(null); // 'before', 'after', 'inside'
  const [draggedElementType, setDraggedElementType] = useState(null); // For dragging from left panel
  const [previewStyles, setPreviewStyles] = useState({}); // For live preview of editable styles
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, tablet, mobile
  const [hoveredDropZone, setHoveredDropZone] = useState(null); // For explicit drop zones between elements

  // Базовые элементы для добавления
  const elementTypes = [
    { type: 'container', label: 'Container', icon: '📦', category: 'Layout' },
    { type: 'div', label: 'Div', icon: '□', category: 'Layout' },
    { type: 'grid', label: 'Grid', icon: '⊞', category: 'Layout' },
    { type: 'h1', label: 'Heading 1', icon: 'H1', category: 'Text' },
    { type: 'h2', label: 'Heading 2', icon: 'H2', category: 'Text' },
    { type: 'h3', label: 'Heading 3', icon: 'H3', category: 'Text' },
    { type: 'h4', label: 'Heading 4', icon: 'H4', category: 'Text' },
    { type: 'h5', label: 'Heading 5', icon: 'H5', category: 'Text' },
    { type: 'h6', label: 'Heading 6', icon: 'H6', category: 'Text' },
    { type: 'p', label: 'Paragraph', icon: 'P', category: 'Text' },
    { type: 'span', label: 'Span', icon: 'S', category: 'Text' },
    { type: 'strong', label: 'Bold', icon: 'B', category: 'Text' },
    { type: 'em', label: 'Italic', icon: 'I', category: 'Text' },
    { type: 'small', label: 'Small', icon: 's', category: 'Text' },
    { type: 'button', label: 'Button', icon: '🔘', category: 'Interactive' },
    { type: 'a', label: 'Link', icon: '🔗', category: 'Interactive' },
    { type: 'img', label: 'Image', icon: '🖼️', category: 'Media' },
    { type: 'video', label: 'Video', icon: '🎬', category: 'Media' },
    { type: 'audio', label: 'Audio', icon: '🎵', category: 'Media' },
    { type: 'iframe', label: 'iFrame', icon: '🌐', category: 'Media' },
    { type: 'ul', label: 'List (ul)', icon: '•', category: 'Lists' },
    { type: 'ol', label: 'List (ol)', icon: '1.', category: 'Lists' },
    { type: 'li', label: 'List Item', icon: '◦', category: 'Lists' },
    { type: 'br', label: 'Line Break', icon: '↵', category: 'Utility' },
    { type: 'hr', label: 'Divider', icon: '─', category: 'Utility' },
  ];

  const categories = ['Layout', 'Text', 'Interactive', 'Media', 'Lists', 'Utility'];

  // Часто используемые Tailwind классы
  const commonClasses = {
    spacing: ['p-4', 'py-8', 'py-12', 'py-16', 'px-4', 'px-6', 'mx-auto', 'mb-4', 'mb-6', 'mb-8'],
    responsive: ['sm:', 'md:', 'lg:', 'xl:'],
    text: ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'],
    layout: ['flex', 'grid', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'max-w-full', 'max-w-6xl', 'w-full'],
    other: ['rounded', 'rounded-lg', 'shadow', 'shadow-md', 'font-bold', 'text-center', 'hover:opacity-90']
  };

  // Добавление элемента
  const addElement = (type, parentPath = null) => {
    const containerTypes = ['container', 'div', 'grid', 'ul', 'ol', 'button', 'a'];
    const needsDataKey = !['container', 'div', 'grid', 'br', 'hr', 'ul', 'ol'].includes(type);
    
    const newElement = {
      type,
      className: getDefaultClasses(type),
      styles: {},
      children: containerTypes.includes(type) ? [] : undefined,
      dataKey: needsDataKey ? `${type}_${Date.now()}` : undefined,
    };

    // Дополнительные поля для медиа элементов
    if (type === 'img') {
      newElement.srcKey = `image_${Date.now()}`;
      newElement.altKey = `alt_${Date.now()}`;
      setDefaultData({
        ...defaultData,
        [newElement.srcKey]: 'https://via.placeholder.com/800x600',
        [newElement.altKey]: 'Image description'
      });
    }
    if (type === 'video' || type === 'audio') {
      newElement.srcKey = `${type}_${Date.now()}`;
      newElement.controls = true;
      newElement.loop = false;
      newElement.muted = false;
      newElement.autoPlay = false;
      if (type === 'video') {
        newElement.posterKey = `poster_${Date.now()}`;
        setDefaultData({
          ...defaultData,
          [newElement.srcKey]: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
          [newElement.posterKey]: 'https://via.placeholder.com/1920x1080'
        });
      } else {
        setDefaultData({
          ...defaultData,
          [newElement.srcKey]: 'https://example.com/audio.mp3'
        });
      }
    }
    if (type === 'iframe') {
      newElement.srcKey = `iframe_${Date.now()}`;
      newElement.titleKey = `title_${Date.now()}`;
      newElement.allowFullScreen = true;
      setDefaultData({
        ...defaultData,
        [newElement.srcKey]: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        [newElement.titleKey]: 'Embedded content'
      });
    }
    if (type === 'a') {
      newElement.hrefKey = `link_${Date.now()}`;
      setDefaultData({
        ...defaultData,
        [newElement.hrefKey]: '#'
      });
    }

    // Добавление defaultData для текстовых элементов
    if (needsDataKey && newElement.dataKey) {
      setDefaultData({
        ...defaultData,
        [newElement.dataKey]: `Sample ${type} text`
      });
    }

    if (parentPath === null) {
      setStructure([...structure, newElement]);
    } else {
      const newStructure = [...structure];
      const parent = getElementByPath(newStructure, parentPath);
      if (parent && parent.children) {
        parent.children.push(newElement);
      }
      setStructure(newStructure);
    }
  };

  // Получение элемента по пути
  const getElementByPath = (struct, path) => {
    let current = { children: struct };
    for (const index of path) {
      current = current.children[index];
    }
    return current;
  };

  // Дефолтные классы для элементов
  const getDefaultClasses = (type) => {
    switch (type) {
      case 'container':
        return 'py-12';
      case 'div':
        return '';
      case 'h1':
        return 'text-4xl font-bold mb-4';
      case 'h2':
        return 'text-3xl font-bold mb-4';
      case 'h3':
        return 'text-2xl font-bold mb-3';
      case 'h4':
        return 'text-xl font-bold mb-3';
      case 'h5':
        return 'text-lg font-bold mb-2';
      case 'h6':
        return 'text-base font-bold mb-2';
      case 'p':
        return 'text-base mb-4';
      case 'span':
        return 'text-base';
      case 'button':
        return 'px-6 py-3 rounded text-white font-semibold bg-blue-500 hover:bg-blue-600';
      case 'a':
        return 'text-blue-600 hover:underline';
      case 'img':
        return 'w-full h-auto';
      case 'video':
      case 'audio':
        return 'w-full';
      case 'iframe':
        return 'w-full h-96';
      case 'grid':
        return 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3';
      case 'ul':
      case 'ol':
        return 'space-y-2';
      case 'li':
        return 'text-base';
      case 'strong':
        return 'font-bold';
      case 'em':
        return 'italic';
      case 'small':
        return 'text-sm';
      case 'hr':
        return 'my-4 border-gray-300';
      default:
        return '';
    }
  };

  // Удаление элемента
  const deleteElement = (path) => {
    const newStructure = [...structure];
    if (path.length === 1) {
      newStructure.splice(path[0], 1);
    } else {
      const parentPath = path.slice(0, -1);
      const parent = getElementByPath(newStructure, parentPath);
      parent.children.splice(path[path.length - 1], 1);
    }
    setStructure(newStructure);
    setSelectedElement(null);
  };

  // Копирование элемента
  const copyElement = (path) => {
    const newStructure = [...structure];
    const element = getElementByPath(newStructure, path);
    const copied = JSON.parse(JSON.stringify(element));
    
    if (path.length === 1) {
      newStructure.splice(path[0] + 1, 0, copied);
    } else {
      const parentPath = path.slice(0, -1);
      const parent = getElementByPath(newStructure, parentPath);
      parent.children.splice(path[path.length - 1] + 1, 0, copied);
    }
    setStructure(newStructure);
  };

  // Перемещение элемента вверх/вниз
  const moveElement = (path, direction) => {
    const newStructure = [...structure];
    
    if (path.length === 1) {
      const index = path[0];
      if (direction === 'up' && index > 0) {
        [newStructure[index], newStructure[index - 1]] = [newStructure[index - 1], newStructure[index]];
      } else if (direction === 'down' && index < newStructure.length - 1) {
        [newStructure[index], newStructure[index + 1]] = [newStructure[index + 1], newStructure[index]];
      }
    } else {
      const parentPath = path.slice(0, -1);
      const parent = getElementByPath(newStructure, parentPath);
      const index = path[path.length - 1];
      
      if (direction === 'up' && index > 0) {
        [parent.children[index], parent.children[index - 1]] = [parent.children[index - 1], parent.children[index]];
      } else if (direction === 'down' && index < parent.children.length - 1) {
        [parent.children[index], parent.children[index + 1]] = [parent.children[index + 1], parent.children[index]];
      }
    }
    
    setStructure(newStructure);
  };

  // Обновление className элемента
  const updateClassName = (path, newClassName) => {
    const newStructure = [...structure];
    const element = getElementByPath(newStructure, path);
    element.className = newClassName;
    setStructure(newStructure);
  };

  // Добавление стиля в editableStyles
  const addEditableStyle = (styleKey, config) => {
    setEditableStyles({
      ...editableStyles,
      [styleKey]: config
    });
  };

  // Связывание CSS свойства элемента со стилем
  const linkStyleToElement = (path, cssProperty, styleKey) => {
    const newStructure = [...structure];
    const element = getElementByPath(newStructure, path);
    if (!element.styles) element.styles = {};
    element.styles[cssProperty] = styleKey;
    setStructure(newStructure);
  };

  // Toggle collapse node
  const toggleNode = (pathStr) => {
    setCollapsedNodes({
      ...collapsedNodes,
      [pathStr]: !collapsedNodes[pathStr]
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e, path) => {
    e.stopPropagation();
    setDraggedItem(path);
    setDraggedElementType(null);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Drag start for new elements from left panel
  const handleElementDragStart = (e, elementType) => {
    e.stopPropagation();
    setDraggedElementType(elementType);
    setDraggedItem(null);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e, path) => {
    e.preventDefault();
    e.stopPropagation();

    // Don't allow dropping on the element being dragged
    if (draggedItem && JSON.stringify(draggedItem) === JSON.stringify(path)) {
      return;
    }

    // Don't allow dropping inside a child of the dragged element
    if (draggedItem && path.length > draggedItem.length) {
      const isChild = draggedItem.every((val, idx) => val === path[idx]);
      if (isChild) {
        return;
      }
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    // Determine drop zone based on cursor position
    const element = getElementByPath(structure, path);

    // Guard against undefined element
    if (!element) {
      setDropZone('after');
      setDropTarget(path);
      return;
    }

    const hasChildren = element.children !== undefined;
    const isEmpty = hasChildren && element.children.length === 0;

    // Simplified drop zone logic - clear and predictable (like Elementor/Puck)
    if (hasChildren) {
      // For empty containers: entire area is 'inside' zone
      if (isEmpty) {
        setDropZone('inside');
      } else {
        // For non-empty containers: percentage-based with minimum pixel thresholds
        // This ensures even small containers have usable before/after zones
        const MIN_ZONE_SIZE = 25; // minimum pixels for a zone

        // Calculate zone sizes: prefer 30/40/30 split, but ensure minimum sizes
        let topZoneSize = Math.max(MIN_ZONE_SIZE, height * 0.30);
        let bottomZoneSize = Math.max(MIN_ZONE_SIZE, height * 0.30);

        // If element is very small, adjust percentages
        if (height < 100) {
          // For small elements, use larger percentage for before/after
          topZoneSize = Math.max(MIN_ZONE_SIZE, height * 0.35);
          bottomZoneSize = Math.max(MIN_ZONE_SIZE, height * 0.35);
        }

        if (y < topZoneSize) {
          setDropZone('before');
        } else if (y > height - bottomZoneSize) {
          setDropZone('after');
        } else {
          setDropZone('inside');
        }
      }
    } else {
      // For non-containers: simple 50/50 split
      if (y < height * 0.5) {
        setDropZone('before');
      } else {
        setDropZone('after');
      }
    }

    setDropTarget(path);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Get the element we're leaving
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // Check if mouse is actually outside the element bounds
    const isOutside = x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;

    if (isOutside) {
      setDropTarget(null);
      setDropZone(null);
    }
  };

  const handleDrop = (e, targetPath) => {
    e.preventDefault();
    e.stopPropagation();

    const zone = dropZone || 'after';

    // If dropping a new element from left panel
    if (draggedElementType) {
      const newStructure = [...structure];
      const containerTypes = ['container', 'div', 'grid', 'ul', 'ol', 'button', 'a'];
      const needsDataKey = !['container', 'div', 'grid', 'br', 'hr', 'ul', 'ol', 'img', 'video', 'audio', 'iframe'].includes(draggedElementType);

      const newElement = {
        type: draggedElementType,
        className: getDefaultClasses(draggedElementType),
        styles: {},
        children: containerTypes.includes(draggedElementType) ? [] : undefined,
        dataKey: needsDataKey ? `${draggedElementType}_${Date.now()}` : undefined,
      };

      // Add default data for text elements
      if (needsDataKey && newElement.dataKey) {
        setDefaultData({
          ...defaultData,
          [newElement.dataKey]: `Sample ${draggedElementType} text`
        });
      }

      // Special handling for media elements
      if (draggedElementType === 'img') {
        newElement.srcKey = `image_${Date.now()}`;
        newElement.altKey = `alt_${Date.now()}`;
        setDefaultData({
          ...defaultData,
          [newElement.srcKey]: 'https://via.placeholder.com/800x600',
          [newElement.altKey]: 'Image description'
        });
      } else if (draggedElementType === 'video' || draggedElementType === 'audio') {
        newElement.srcKey = `${draggedElementType}_${Date.now()}`;
        newElement.controls = true;
        newElement.loop = false;
        newElement.muted = false;
        newElement.autoPlay = false;
        if (draggedElementType === 'video') {
          newElement.posterKey = `poster_${Date.now()}`;
          setDefaultData({
            ...defaultData,
            [newElement.srcKey]: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4',
            [newElement.posterKey]: 'https://via.placeholder.com/800x600'
          });
        } else {
          setDefaultData({
            ...defaultData,
            [newElement.srcKey]: 'https://example.com/audio.mp3'
          });
        }
      } else if (draggedElementType === 'iframe') {
        newElement.srcKey = `iframe_${Date.now()}`;
        newElement.titleKey = `title_${Date.now()}`;
        newElement.allowFullScreen = true;
        setDefaultData({
          ...defaultData,
          [newElement.srcKey]: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          [newElement.titleKey]: 'Embedded content'
        });
      }

      // Add based on drop zone
      if (zone === 'inside') {
        // Add inside target
        const target = getElementByPath(newStructure, targetPath);
        if (!target) {
          console.error('Target element not found');
          setDraggedElementType(null);
          setDropTarget(null);
          setDropZone(null);
          return;
        }
        if (target.children) {
          target.children.push(newElement);
        }
      } else if (zone === 'before') {
        // Add before target
        if (targetPath.length === 1) {
          newStructure.splice(targetPath[0], 0, newElement);
        } else {
          const targetParentPath = targetPath.slice(0, -1);
          const targetParent = getElementByPath(newStructure, targetParentPath);
          if (!targetParent || !targetParent.children) {
            console.error('Target parent not found or has no children');
            setDraggedElementType(null);
            setDropTarget(null);
            setDropZone(null);
            return;
          }
          targetParent.children.splice(targetPath[targetPath.length - 1], 0, newElement);
        }
      } else {
        // Add after target
        if (targetPath.length === 1) {
          newStructure.splice(targetPath[0] + 1, 0, newElement);
        } else {
          const targetParentPath = targetPath.slice(0, -1);
          const targetParent = getElementByPath(newStructure, targetParentPath);
          if (!targetParent || !targetParent.children) {
            console.error('Target parent not found or has no children');
            setDraggedElementType(null);
            setDropTarget(null);
            setDropZone(null);
            return;
          }
          targetParent.children.splice(targetPath[targetPath.length - 1] + 1, 0, newElement);
        }
      }

      setStructure(newStructure);
      setDraggedElementType(null);
      setDropTarget(null);
      setDropZone(null);
      return;
    }

    if (!draggedItem || JSON.stringify(draggedItem) === JSON.stringify(targetPath)) {
      setDraggedItem(null);
      setDropTarget(null);
      setDropZone(null);
      return;
    }

    // Move element from draggedItem path to targetPath
    const newStructure = [...structure];

    // Get dragged element
    const draggedElement = getElementByPath(newStructure, draggedItem);
    if (!draggedElement) {
      console.error('Dragged element not found');
      setDraggedItem(null);
      setDropTarget(null);
      setDropZone(null);
      return;
    }
    const draggedElementCopy = JSON.parse(JSON.stringify(draggedElement));

    // Remove from old position
    if (draggedItem.length === 1) {
      newStructure.splice(draggedItem[0], 1);
    } else {
      const dragParentPath = draggedItem.slice(0, -1);
      const dragParent = getElementByPath(newStructure, dragParentPath);
      if (!dragParent || !dragParent.children) {
        console.error('Drag parent not found or has no children');
        setDraggedItem(null);
        setDropTarget(null);
        setDropZone(null);
        return;
      }
      dragParent.children.splice(draggedItem[draggedItem.length - 1], 1);
    }

    // Adjust target path if needed (if dragged from before target in same parent)
    let adjustedTargetPath = [...targetPath];
    if (zone === 'after' && draggedItem.length === targetPath.length &&
        draggedItem.slice(0, -1).every((v, i) => v === targetPath[i]) &&
        draggedItem[draggedItem.length - 1] < targetPath[targetPath.length - 1]) {
      adjustedTargetPath[adjustedTargetPath.length - 1]--;
    }

    // Add to new position based on drop zone
    if (zone === 'inside') {
      // Add inside target
      const target = getElementByPath(newStructure, adjustedTargetPath);
      if (!target) {
        console.error('Target element not found');
        setDraggedItem(null);
        setDropTarget(null);
        setDropZone(null);
        return;
      }
      if (target.children) {
        target.children.push(draggedElementCopy);
      }
    } else if (zone === 'before') {
      // Add before target
      if (adjustedTargetPath.length === 1) {
        newStructure.splice(adjustedTargetPath[0], 0, draggedElementCopy);
      } else {
        const targetParentPath = adjustedTargetPath.slice(0, -1);
        const targetParent = getElementByPath(newStructure, targetParentPath);
        if (!targetParent || !targetParent.children) {
          console.error('Target parent not found or has no children');
          setDraggedItem(null);
          setDropTarget(null);
          setDropZone(null);
          return;
        }
        targetParent.children.splice(adjustedTargetPath[adjustedTargetPath.length - 1], 0, draggedElementCopy);
      }
    } else {
      // Add after target
      if (adjustedTargetPath.length === 1) {
        newStructure.splice(adjustedTargetPath[0] + 1, 0, draggedElementCopy);
      } else {
        const targetParentPath = adjustedTargetPath.slice(0, -1);
        const targetParent = getElementByPath(newStructure, targetParentPath);
        if (!targetParent || !targetParent.children) {
          console.error('Target parent not found or has no children');
          setDraggedItem(null);
          setDropTarget(null);
          setDropZone(null);
          return;
        }
        targetParent.children.splice(adjustedTargetPath[adjustedTargetPath.length - 1] + 1, 0, draggedElementCopy);
      }
    }

    setStructure(newStructure);
    setDraggedItem(null);
    setDropTarget(null);
    setDropZone(null);

    // Restore opacity of dragged elements
    document.querySelectorAll('[draggable="true"]').forEach(el => {
      el.style.opacity = '1';
    });
  };


  // Экспорт JSON
  const exportJSON = () => {
    const template = {
      id: Date.now(),
      category_id: categoryId,
      template_name: templateName,
      name: templateName,
      preview_url: 'https://via.placeholder.com/300x200',
      settings: {
        structure,
        editableElements: Object.keys(defaultData),
        editableStyles
      },
      default_data: defaultData
    };
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName}.json`;
    a.click();
  };

  // Импорт JSON
  const importJSON = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          setStructure(json.settings.structure || []);
          setEditableStyles(json.settings.editableStyles || {});
          setDefaultData(json.default_data || {});
          setTemplateName(json.template_name || 'CustomBlock');
          setCategoryId(json.category_id || 1);
        } catch (err) {
          alert('Ошибка импорта JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // Explicit Drop Zone component - renders between elements
  const renderDropZone = (parentPath, index, position) => {
    const zoneId = `${parentPath.join('-')}-${index}-${position}`;
    const isDragging = draggedItem || draggedElementType;
    const isHovered = hoveredDropZone === zoneId;

    if (!isDragging) return null;

    return (
      <div
        key={`dropzone-${zoneId}`}
        className={`relative transition-all duration-200 ${
          isHovered ? 'h-12' : 'h-2'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setHoveredDropZone(zoneId);
          setDropTarget(parentPath);
          setDropZone(position === 'before-first' ? 'before' : 'after');
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

          // Handle drop logic
          const targetPath = position === 'before-first' ? [...parentPath, 0] : [...parentPath, index];
          handleDrop(e, targetPath);
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

  // Visual rendering of elements
  const renderVisualElement = (element, path = []) => {
    const currentPath = [...path];
    const pathStr = currentPath.join('-');
    const isSelected = selectedElement && JSON.stringify(selectedElement.path) === JSON.stringify(currentPath);
    const isDraggedOver = dropTarget && JSON.stringify(dropTarget) === JSON.stringify(currentPath);
    const hasChildren = element.children !== undefined;
    const canAcceptDrop = draggedItem || draggedElementType;

    // Build breadcrumb path for hierarchical handles
    const buildBreadcrumb = () => {
      const breadcrumb = [];
      let currentStructure = structure;

      for (let i = 0; i < currentPath.length; i++) {
        const index = currentPath[i];
        const elem = currentStructure[index];
        if (elem) {
          breadcrumb.push({
            element: elem,
            path: currentPath.slice(0, i + 1),
            label: elem.type
          });
          if (elem.children) {
            currentStructure = elem.children;
          }
        }
      }

      return breadcrumb;
    };

    const breadcrumb = buildBreadcrumb();

    // Show breadcrumb only when nested inside another element (not for top-level)
    const shouldShowBreadcrumb = breadcrumb.length > 1;

    // Inline styles from element.styles
    const inlineStyles = {};
    if (element.styles) {
      Object.entries(element.styles).forEach(([cssProp, styleKey]) => {
        if (editableStyles[styleKey]) {
          const config = editableStyles[styleKey];
          let value = previewStyles[styleKey] !== undefined ? previewStyles[styleKey] : config.default;

          // Add unit for number/range types (with fallback to 'px' if unit is missing)
          if (config.type === 'number' || config.type === 'range') {
            const unit = config.unit || 'px';
            value = `${value}${unit}`;
          }

          inlineStyles[cssProp] = value;
        }
      });
    }

    const ElementTag = element.type === 'container' ? 'div' : element.type;
    const content = element.dataKey ? (defaultData[element.dataKey] || `[${element.dataKey}]`) : null;

    // Void elements that cannot have children
    const voidElements = ['hr', 'br', 'img', 'input', 'meta', 'link'];
    const isVoidElement = voidElements.includes(element.type);

    return (
      <div
        key={pathStr}
        onDragOver={(e) => handleDragOver(e, currentPath)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, currentPath)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElement({ element, path: currentPath });
        }}
        className={`relative group transition-all duration-150 ease-in-out ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50' : ''
        } ${
          canAcceptDrop && !isDraggedOver ? 'hover:ring-1 hover:ring-gray-300 hover:shadow-sm hover:bg-gray-50' : ''
        }`}
        style={{
          minHeight: element.children ? '40px' : 'auto',
          overflow: 'visible',
          opacity: draggedItem && JSON.stringify(draggedItem) === JSON.stringify(currentPath) ? '0.4' : '1'
        }}
      >
        {/* Element controls overlay - Single handle or breadcrumb */}
        <div className="absolute top-0 left-0 right-0 opacity-30 group-hover:opacity-100 z-20 transition-opacity flex items-center justify-between gap-2 pointer-events-none">
          {/* Left side - Breadcrumb handles (only when nested non-container) or single handle */}
          <div className="flex items-center gap-0.5 pointer-events-auto">
            {shouldShowBreadcrumb ? (
              // Show breadcrumb for nested elements where handles might overlap
              breadcrumb.map((crumb, idx) => (
                <div
                  key={crumb.path.join('-')}
                  data-drag-handle
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    handleDragStart(e, crumb.path);
                  }}
                  onDragEnd={(e) => {
                    e.stopPropagation();
                    setDraggedItem(null);
                    setDropTarget(null);
                    setDropZone(null);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement({ element: crumb.element, path: crumb.path });
                  }}
                  className={`flex items-center gap-1 px-2 py-1 text-white text-xs font-semibold select-none cursor-grab active:cursor-grabbing transition-all ${
                    idx === breadcrumb.length - 1
                      ? 'bg-blue-600/95 backdrop-blur-sm rounded-br shadow-md' // Current element
                      : 'bg-gray-600/90 backdrop-blur-sm hover:bg-gray-700/90' // Parent elements
                  } ${idx === 0 ? 'rounded-tl' : ''}`}
                  title={`Drag ${crumb.label}${crumb.element.children !== undefined ? ' (container)' : ''}`}
                >
                  <GripVertical size={12} />
                  <span>{crumb.label}</span>
                  {idx < breadcrumb.length - 1 && <span className="opacity-50">/</span>}
                </div>
              ))
            ) : (
              // Show single handle for containers and top-level elements
              <div
                data-drag-handle
                draggable
                onDragStart={(e) => {
                  e.stopPropagation();
                  handleDragStart(e, currentPath);
                }}
                onDragEnd={(e) => {
                  e.stopPropagation();
                  setDraggedItem(null);
                  setDropTarget(null);
                  setDropZone(null);
                }}
                className="flex items-center gap-1 px-2 py-1 bg-blue-600/95 backdrop-blur-sm rounded-tl rounded-br shadow-md text-white text-xs font-semibold select-none cursor-grab active:cursor-grabbing"
                title={`Drag ${element.type}${hasChildren ? ' (container)' : ''}`}
              >
                <GripVertical size={12} />
                <span>{element.type}</span>
              </div>
            )}
          </div>

          {/* Right side - Quick actions - visible on hover */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-bl shadow-md overflow-hidden pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyElement(currentPath);
              }}
              className="px-2 py-1 hover:bg-blue-50 text-blue-600 transition-colors"
              title="Duplicate (Ctrl+D)"
            >
              <Copy size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteElement(currentPath);
              }}
              className="px-2 py-1 hover:bg-red-50 text-red-600 transition-colors"
              title="Delete (Del)"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Drop indicators based on zone - Elementor-style with improved visibility */}
        {isDraggedOver && dropZone === 'before' && (
          <div className="absolute -top-2 left-0 right-0 z-40 pointer-events-none">
            {/* Insertion line with animation */}
            <div className="h-1 bg-blue-600 shadow-2xl relative animate-pulse">
              {/* Circles at the ends */}
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow-lg"></div>
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow-lg"></div>
              {/* Center indicator */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-lg"></div>
            </div>
            {/* Label with icon */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm px-4 py-2 rounded-lg font-semibold shadow-2xl whitespace-nowrap flex items-center gap-2 border-2 border-blue-400">
              <span className="text-lg">↑</span>
              <span>Вставить выше</span>
            </div>
          </div>
        )}

        {isDraggedOver && dropZone === 'after' && (
          <div className="absolute -bottom-2 left-0 right-0 z-40 pointer-events-none">
            {/* Insertion line with animation */}
            <div className="h-1 bg-blue-600 shadow-2xl relative animate-pulse">
              {/* Circles at the ends */}
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow-lg"></div>
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow-lg"></div>
              {/* Center indicator */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow-lg"></div>
            </div>
            {/* Label with icon */}
            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm px-4 py-2 rounded-lg font-semibold shadow-2xl whitespace-nowrap flex items-center gap-2 border-2 border-blue-400">
              <span className="text-lg">↓</span>
              <span>Вставить ниже</span>
            </div>
          </div>
        )}

        {isDraggedOver && dropZone === 'inside' && (
          <div className="absolute inset-0 z-40 pointer-events-none">
            {/* Border overlay with animation */}
            <div className="absolute inset-0 border-4 border-dashed border-green-500 bg-green-50/30 rounded-lg animate-pulse"></div>
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100/40 via-transparent to-green-100/40 rounded-lg"></div>
            {/* Label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm px-6 py-3 rounded-xl font-semibold shadow-2xl flex items-center gap-3 border-2 border-green-400">
              <span className="text-2xl">📦</span>
              <span>Вставить внутрь контейнера</span>
            </div>
          </div>
        )}

        {/* Render void elements without children */}
        {isVoidElement ? (
          <ElementTag
            className={element.className || ''}
            style={inlineStyles}
            src={element.srcKey ? defaultData[element.srcKey] : undefined}
            alt={element.altKey ? defaultData[element.altKey] : undefined}
          />
        ) : (
          <ElementTag
            className={element.className || ''}
            style={inlineStyles}
            src={element.srcKey ? defaultData[element.srcKey] : undefined}
            alt={element.altKey ? defaultData[element.altKey] : undefined}
            href={element.hrefKey ? defaultData[element.hrefKey] : undefined}
            poster={element.posterKey ? defaultData[element.posterKey] : undefined}
            title={element.titleKey ? defaultData[element.titleKey] : undefined}
            controls={element.controls}
            loop={element.loop}
            muted={element.muted}
            autoPlay={element.autoPlay}
            allowFullScreen={element.allowFullScreen}
          >
            {content}
            {element.children && element.children.length > 0 && (
              <>
                {/* Drop zone before first child */}
                {renderDropZone(currentPath, 0, 'before-first')}

                {/* Render children with drop zones between them */}
                {element.children.map((child, index) => (
                  <React.Fragment key={`${currentPath.join('-')}-${index}`}>
                    {renderVisualElement(child, [...currentPath, index])}
                    {/* Drop zone after each child */}
                    {renderDropZone(currentPath, index + 1, 'after')}
                  </React.Fragment>
                ))}
              </>
            )}
            {element.children && element.children.length === 0 && (
              <div
                className="text-gray-400 text-sm py-8 text-center border-2 border-dashed border-gray-300 rounded m-2 hover:bg-gray-100 hover:border-gray-400 transition-colors select-none"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDropTarget(currentPath);
                  setDropZone('inside');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDrop(e, currentPath);
                }}
              >
                <div className="text-lg mb-1">📦</div>
                <div className="font-medium">Перетащите элементы сюда</div>
                <div className="text-xs mt-1 opacity-75">или используйте кнопку +</div>
              </div>
            )}
          </ElementTag>
        )}
      </div>
    );
  };

  // Рендер дерева элементов
  const renderElementTree = (elements, path = []) => {
    return elements.map((element, index) => {
      const currentPath = [...path, index];
      const pathStr = currentPath.join('-');
      const isSelected = selectedElement && JSON.stringify(selectedElement.path) === JSON.stringify(currentPath);
      const hasChildren = element.children !== undefined; // Check if element CAN have children, not if it HAS children
      const hasChildrenContent = element.children && element.children.length > 0;
      const isCollapsed = collapsedNodes[pathStr];
      
      return (
        <div key={index} className="ml-2">
          <div 
            className={`flex items-center gap-1 p-2 rounded cursor-pointer hover:bg-blue-50 mb-1 ${
              isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'border border-gray-300'
            }`}
            onClick={() => setSelectedElement({ element, path: currentPath })}
          >
            {hasChildrenContent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(pathStr);
                }}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
            {!hasChildrenContent && <span className="w-5"></span>}
            
            <span className="text-xs font-semibold flex-1">{element.type}</span>
            {element.dataKey && <span className="text-xs text-gray-500">({element.dataKey.substring(0, 8)}...)</span>}

            <div className="flex flex-wrap gap-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveElement(currentPath, 'up');
                }}
                className="p-0.5 hover:bg-gray-200 rounded text-xs"
                title="Move up"
              >
                ↑
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  moveElement(currentPath, 'down');
                }}
                className="p-0.5 hover:bg-gray-200 rounded text-xs"
                title="Move down"
              >
                ↓
              </button>
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addElement('div', currentPath);
                  }}
                  className="p-0.5 hover:bg-green-200 rounded"
                  title="Add child"
                >
                  <Plus size={12} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyElement(currentPath);
                }}
                className="p-0.5 hover:bg-blue-200 rounded"
                title="Copy"
              >
                <Copy size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteElement(currentPath);
                }}
                className="p-0.5 hover:bg-red-200 rounded"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          {hasChildrenContent && !isCollapsed && (
            <div className="ml-2 border-l-2 border-gray-300 pl-2">
              {renderElementTree(element.children, currentPath)}
            </div>
          )}
        </div>
      );
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected element with Delete or Backspace key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && !e.target.matches('input, textarea')) {
        e.preventDefault();
        deleteElement(selectedElement.path);
      }

      // Duplicate selected element with Ctrl+D or Cmd+D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedElement && !e.target.matches('input, textarea')) {
        e.preventDefault();
        copyElement(selectedElement.path);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="px-3 py-1 border rounded font-semibold text-sm"
            placeholder="Template Name"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(parseInt(e.target.value))}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value={1}>Заголовки</option>
            <option value={2}>Контент</option>
            <option value={3}>Галереи</option>
            <option value={4}>Формы</option>
            <option value={5}>Футеры</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('builder')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'builder' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <Settings size={14} className="inline mr-1" /> Builder
          </button>
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'visual' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <Eye size={14} className="inline mr-1" /> Visual
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'json' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            <Code size={14} className="inline mr-1" /> JSON
          </button>
          
          <div className="border-l pl-2 ml-2">
            <label className="px-3 py-1 bg-green-500 text-white rounded cursor-pointer hover:bg-green-600 text-sm">
              <Upload size={14} className="inline mr-1" /> Import
              <input type="file" accept=".json" onChange={importJSON} className="hidden" />
            </label>
          </div>
          
          <button
            onClick={exportJSON}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            <Download size={14} className="inline mr-1" /> Export
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'builder' && (
          <>
            {/* Left Sidebar - Elements */}
            <div className="w-64 bg-white border-r overflow-y-auto">
              <div className="p-4">
                <h3 className="font-bold mb-3 text-sm">Elements</h3>
                {categories.map(category => (
                  <div key={category} className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">{category}</h4>
                    <div className="space-y-1">
                      {elementTypes
                        .filter(el => el.category === category)
                        .map((el) => (
                          <button
                            key={el.type}
                            onClick={() => addElement(el.type)}
                            className="w-full p-2 border rounded hover:bg-blue-50 text-left flex items-center gap-2 text-xs"
                          >
                            <span className="text-sm">{el.icon}</span>
                            <span>{el.label}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-4">
                <h3 className="font-bold mb-3 text-sm">Structure Tree</h3>
                <div className="text-sm">
                  {structure.length === 0 ? (
                    <p className="text-gray-500 text-xs">Add elements to start</p>
                  ) : (
                    renderElementTree(structure)
                  )}
                </div>
              </div>
            </div>

            {/* Center - Canvas */}
            <div className="flex-1 bg-gray-100 p-4 overflow-auto">
              <div className="bg-white rounded shadow-lg p-8 max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Visual Preview</h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Select elements from the tree to edit. This is a structure preview - export and use with UniversalBlockRenderer for full rendering.
                </p>
                
                {structure.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded p-16 text-center">
                    <p className="text-gray-500 text-lg mb-2">Your canvas is empty</p>
                    <p className="text-gray-400 text-sm">Add elements from the left sidebar to start building</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                      <h3 className="font-semibold mb-2 text-blue-900">Structure Overview</h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-white rounded p-3 shadow-sm">
                          <p className="text-gray-600 text-xs">Total Elements</p>
                          <p className="text-2xl font-bold text-blue-600">{JSON.stringify(structure).match(/"type"/g)?.length || 0}</p>
                        </div>
                        <div className="bg-white rounded p-3 shadow-sm">
                          <p className="text-gray-600 text-xs">Data Keys</p>
                          <p className="text-2xl font-bold text-green-600">{Object.keys(defaultData).length}</p>
                        </div>
                        <div className="bg-white rounded p-3 shadow-sm">
                          <p className="text-gray-600 text-xs">Editable Styles</p>
                          <p className="text-2xl font-bold text-purple-600">{Object.keys(editableStyles).length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded p-4 bg-gray-50">
                      <h3 className="font-semibold mb-2 text-sm">JSON Structure (collapsed)</h3>
                      <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(structure, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Properties */}
            <div className="w-96 bg-white border-l overflow-y-auto">
              <div className="p-4">
                <h3 className="font-bold mb-3">Properties</h3>
                
                {selectedElement ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Element Type</label>
                      <input
                        type="text"
                        value={selectedElement.element.type}
                        disabled
                        className="w-full px-3 py-2 border rounded bg-gray-100 text-sm"
                      />
                    </div>

                    {/* Data Key */}
                    {selectedElement.element.dataKey !== undefined && (
                      <div>
                        <label className="block text-sm font-semibold mb-1">Data Key</label>
                        <input
                          type="text"
                          value={selectedElement.element.dataKey || ''}
                          onChange={(e) => {
                            const oldKey = selectedElement.element.dataKey;
                            const newKey = e.target.value;
                            
                            const newStructure = [...structure];
                            const element = getElementByPath(newStructure, selectedElement.path);
                            element.dataKey = newKey;
                            setStructure(newStructure);
                            
                            // Update defaultData
                            if (newKey) {
                              const newData = { ...defaultData };
                              if (oldKey && oldKey !== newKey) {
                                newData[newKey] = newData[oldKey] || 'Sample text';
                                delete newData[oldKey];
                              } else if (!oldKey) {
                                newData[newKey] = 'Sample text';
                              }
                              setDefaultData(newData);
                            }
                          }}
                          className="w-full px-3 py-2 border rounded text-sm"
                          placeholder="e.g., title, subtitle"
                        />
                      </div>
                    )}

                    {/* Media Element Fields */}
                    {(selectedElement.element.type === 'img' ||
                      selectedElement.element.type === 'video' ||
                      selectedElement.element.type === 'audio' ||
                      selectedElement.element.type === 'iframe') && (
                      <div className="space-y-3 border-t pt-3">
                        <h4 className="font-semibold text-sm text-blue-600">Media Properties</h4>

                        <div>
                          <label className="block text-xs font-semibold mb-1">
                            {selectedElement.element.type === 'iframe' ? 'Iframe URL' : 'Source URL'}
                          </label>
                          <input
                            type="text"
                            value={selectedElement.element.src || ''}
                            onChange={(e) => {
                              const newStructure = [...structure];
                              const element = getElementByPath(newStructure, selectedElement.path);
                              element.src = e.target.value;
                              setStructure(newStructure);
                            }}
                            className="w-full px-2 py-1 border rounded text-xs"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>

                        {selectedElement.element.type === 'img' && (
                          <div>
                            <label className="block text-xs font-semibold mb-1">Alt Text</label>
                            <input
                              type="text"
                              value={selectedElement.element.alt || ''}
                              onChange={(e) => {
                                const newStructure = [...structure];
                                const element = getElementByPath(newStructure, selectedElement.path);
                                element.alt = e.target.value;
                                setStructure(newStructure);
                              }}
                              className="w-full px-2 py-1 border rounded text-xs"
                              placeholder="Image description"
                            />
                          </div>
                        )}

                        {selectedElement.element.type === 'video' && (
                          <div>
                            <label className="block text-xs font-semibold mb-1">Poster URL</label>
                            <input
                              type="text"
                              value={selectedElement.element.poster || ''}
                              onChange={(e) => {
                                const newStructure = [...structure];
                                const element = getElementByPath(newStructure, selectedElement.path);
                                element.poster = e.target.value;
                                setStructure(newStructure);
                              }}
                              className="w-full px-2 py-1 border rounded text-xs"
                              placeholder="https://example.com/poster.jpg"
                            />
                          </div>
                        )}

                        {selectedElement.element.type === 'iframe' && (
                          <div>
                            <label className="block text-xs font-semibold mb-1">Title</label>
                            <input
                              type="text"
                              value={selectedElement.element.title || ''}
                              onChange={(e) => {
                                const newStructure = [...structure];
                                const element = getElementByPath(newStructure, selectedElement.path);
                                element.title = e.target.value;
                                setStructure(newStructure);
                              }}
                              className="w-full px-2 py-1 border rounded text-xs"
                              placeholder="Embedded content"
                            />
                          </div>
                        )}

                        {(selectedElement.element.type === 'video' || selectedElement.element.type === 'audio') && (
                          <div className="space-y-2 bg-gray-50 p-3 rounded">
                            <p className="text-xs font-semibold text-gray-700">Playback Options</p>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={selectedElement.element.controls !== false}
                                onChange={(e) => {
                                  const newStructure = [...structure];
                                  const element = getElementByPath(newStructure, selectedElement.path);
                                  element.controls = e.target.checked;
                                  setStructure(newStructure);
                                }}
                              />
                              Show controls
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={selectedElement.element.autoPlay || false}
                                onChange={(e) => {
                                  const newStructure = [...structure];
                                  const element = getElementByPath(newStructure, selectedElement.path);
                                  element.autoPlay = e.target.checked;
                                  setStructure(newStructure);
                                }}
                              />
                              Auto play
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={selectedElement.element.loop || false}
                                onChange={(e) => {
                                  const newStructure = [...structure];
                                  const element = getElementByPath(newStructure, selectedElement.path);
                                  element.loop = e.target.checked;
                                  setStructure(newStructure);
                                }}
                              />
                              Loop
                            </label>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={selectedElement.element.muted || false}
                                onChange={(e) => {
                                  const newStructure = [...structure];
                                  const element = getElementByPath(newStructure, selectedElement.path);
                                  element.muted = e.target.checked;
                                  setStructure(newStructure);
                                }}
                              />
                              Muted
                            </label>
                          </div>
                        )}

                        {selectedElement.element.type === 'iframe' && (
                          <label className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedElement.element.allowFullScreen !== false}
                              onChange={(e) => {
                                const newStructure = [...structure];
                                const element = getElementByPath(newStructure, selectedElement.path);
                                element.allowFullScreen = e.target.checked;
                                setStructure(newStructure);
                              }}
                            />
                            Allow fullscreen
                          </label>
                        )}
                      </div>
                    )}

                    {/* Link href */}
                    {selectedElement.element.type === 'a' && (
                      <div>
                        <label className="block text-sm font-semibold mb-1">Link URL</label>
                        <input
                          type="text"
                          value={selectedElement.element.href || ''}
                          onChange={(e) => {
                            const newStructure = [...structure];
                            const element = getElementByPath(newStructure, selectedElement.path);
                            element.href = e.target.value;
                            setStructure(newStructure);
                          }}
                          className="w-full px-3 py-2 border rounded text-sm"
                          placeholder="https://example.com"
                        />
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <label className="block text-sm font-semibold mb-1">Tailwind Classes</label>
                      <textarea
                        value={selectedElement.element.className || ''}
                        onChange={(e) => updateClassName(selectedElement.path, e.target.value)}
                        className="w-full px-3 py-2 border rounded font-mono text-xs"
                        rows={4}
                        placeholder="py-12 text-center max-w-6xl"
                      />
                      
                      <div className="mt-2">
                        <p className="text-xs font-semibold mb-1">Quick Add Classes:</p>
                        <div className="flex flex-wrap gap-1">
                          {commonClasses.spacing.slice(0, 8).map(cls => (
                            <button
                              key={cls}
                              onClick={() => {
                                const current = selectedElement.element.className || '';
                                if (!current.includes(cls)) {
                                  updateClassName(selectedElement.path, `${current} ${cls}`.trim());
                                }
                              }}
                              className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              {cls}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <label className="block text-sm font-semibold mb-2">Editable Styles</label>
                      <p className="text-xs text-gray-600 mb-3">Link CSS properties to editable styles</p>

                      <div className="space-y-2">
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="CSS property (e.g., backgroundColor)"
                            className="w-full px-2 py-1 border rounded text-xs"
                            id="css-prop"
                          />
                          <input
                            type="text"
                            placeholder="Style key (e.g., primaryColor)"
                            className="w-full px-2 py-1 border rounded text-xs"
                            id="style-key"
                          />
                          <button
                            onClick={() => {
                              const cssProp = document.getElementById('css-prop').value;
                              const styleKey = document.getElementById('style-key').value;
                              if (cssProp && styleKey) {
                                linkStyleToElement(selectedElement.path, cssProp, styleKey);
                                if (!editableStyles[styleKey]) {
                                  addEditableStyle(styleKey, {
                                    type: 'color',
                                    label: styleKey,
                                    default: '#667eea'
                                  });
                                }
                                document.getElementById('css-prop').value = '';
                                document.getElementById('style-key').value = '';
                              }
                            }}
                            className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 font-semibold"
                          >
                            + Add Style Link
                          </button>
                        </div>
                        
                        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                          <p className="font-semibold mb-1">Common CSS properties:</p>
                          <p>backgroundColor, color, fontSize, padding, margin, borderRadius, width, height</p>
                        </div>
                      </div>

                      {selectedElement.element.styles && Object.keys(selectedElement.element.styles).length > 0 && (
                        <div className="mt-3 text-xs bg-green-50 p-3 rounded border border-green-200">
                          <p className="font-semibold mb-2 text-green-800">Linked styles:</p>
                          {Object.entries(selectedElement.element.styles).map(([css, key]) => (
                            <div key={css} className="flex justify-between items-center text-gray-700 mb-1 bg-white px-2 py-1 rounded">
                              <span className="font-mono text-xs">{css} → {key}</span>
                              <button
                                onClick={() => {
                                  const newStructure = [...structure];
                                  const element = getElementByPath(newStructure, selectedElement.path);
                                  delete element.styles[css];
                                  setStructure(newStructure);
                                }}
                                className="text-red-500 hover:text-red-700 font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Editable Styles Configuration */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Settings size={16} />
                        Configure Editable Styles
                      </h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {Object.entries(editableStyles).map(([key, config]) => (
                          <div key={key} className="border rounded p-3 text-xs bg-gray-50">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-semibold text-purple-700">{key}</span>
                              <button
                                onClick={() => {
                                  const newStyles = { ...editableStyles };
                                  delete newStyles[key];
                                  setEditableStyles(newStyles);
                                }}
                                className="text-red-500 hover:text-red-700 font-bold"
                              >
                                ×
                              </button>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs font-semibold mb-1">Type</label>
                                <select
                                  value={config.type}
                                  onChange={(e) => {
                                    const newType = e.target.value;
                                    const updatedConfig = { ...config, type: newType };

                                    // Auto-set unit to 'px' when changing to number/range if not set
                                    if ((newType === 'number' || newType === 'range') && !config.unit) {
                                      updatedConfig.unit = 'px';
                                      updatedConfig.min = config.min || 0;
                                      updatedConfig.max = config.max || 100;
                                      updatedConfig.step = config.step || 1;
                                    }

                                    setEditableStyles({
                                      ...editableStyles,
                                      [key]: updatedConfig
                                    });
                                  }}
                                  className="w-full px-2 py-1 border rounded text-xs"
                                >
                                  <option value="color">Color</option>
                                  <option value="text">Text</option>
                                  <option value="number">Number</option>
                                  <option value="range">Range</option>
                                  <option value="select">Select</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-semibold mb-1">Label</label>
                                <input
                                  type="text"
                                  value={config.label}
                                  onChange={(e) => {
                                    setEditableStyles({
                                      ...editableStyles,
                                      [key]: { ...config, label: e.target.value }
                                    });
                                  }}
                                  className="w-full px-2 py-1 border rounded text-xs"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs font-semibold mb-1">Default Value</label>
                                <input
                                  type="text"
                                  value={config.default}
                                  onChange={(e) => {
                                    setEditableStyles({
                                      ...editableStyles,
                                      [key]: { ...config, default: e.target.value }
                                    });
                                  }}
                                  className="w-full px-2 py-1 border rounded text-xs"
                                />
                              </div>

                              {(config.type === 'number' || config.type === 'range') && (
                                <>
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Min</label>
                                      <input
                                        type="number"
                                        value={config.min || 0}
                                        onChange={(e) => {
                                          setEditableStyles({
                                            ...editableStyles,
                                            [key]: { ...config, min: parseInt(e.target.value) }
                                          });
                                        }}
                                        className="w-full px-1 py-1 border rounded text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Max</label>
                                      <input
                                        type="number"
                                        value={config.max || 100}
                                        onChange={(e) => {
                                          setEditableStyles({
                                            ...editableStyles,
                                            [key]: { ...config, max: parseInt(e.target.value) }
                                          });
                                        }}
                                        className="w-full px-1 py-1 border rounded text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Step</label>
                                      <input
                                        type="number"
                                        step="0.1"
                                        value={config.step || 1}
                                        onChange={(e) => {
                                          setEditableStyles({
                                            ...editableStyles,
                                            [key]: { ...config, step: parseFloat(e.target.value) }
                                          });
                                        }}
                                        className="w-full px-1 py-1 border rounded text-xs"
                                      />
                                    </div>
                                  </div>
                                  {config.type === 'number' && (
                                    <div>
                                      <label className="block text-xs font-semibold mb-1">Unit</label>
                                      <input
                                        type="text"
                                        value={config.unit || 'px'}
                                        onFocus={(e) => {
                                          // Auto-set unit to 'px' on focus if not set
                                          if (!config.unit) {
                                            setEditableStyles({
                                              ...editableStyles,
                                              [key]: { ...config, unit: 'px' }
                                            });
                                          }
                                        }}
                                        onChange={(e) => {
                                          setEditableStyles({
                                            ...editableStyles,
                                            [key]: { ...config, unit: e.target.value }
                                          });
                                        }}
                                        className="w-full px-2 py-1 border rounded text-xs"
                                        placeholder="px, rem, %, etc"
                                      />
                                    </div>
                                  )}
                                </>
                              )}

                              {config.type === 'text' && (
                                <div>
                                  <label className="block text-xs font-semibold mb-1">Placeholder</label>
                                  <input
                                    type="text"
                                    value={config.placeholder || ''}
                                    onChange={(e) => {
                                      setEditableStyles({
                                        ...editableStyles,
                                        [key]: { ...config, placeholder: e.target.value }
                                      });
                                    }}
                                    className="w-full px-2 py-1 border rounded text-xs"
                                  />
                                </div>
                              )}

                              {config.type === 'select' && (
                                <div>
                                  <label className="block text-xs font-semibold mb-1">Options (comma separated)</label>
                                  <input
                                    type="text"
                                    value={config.options?.join(', ') || ''}
                                    onChange={(e) => {
                                      setEditableStyles({
                                        ...editableStyles,
                                        [key]: { ...config, options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) }
                                      });
                                    }}
                                    className="w-full px-2 py-1 border rounded text-xs"
                                    placeholder="option1, option2, option3"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {Object.keys(editableStyles).length === 0 && (
                          <p className="text-xs text-gray-500 text-center py-4">
                            No editable styles configured yet. Link CSS properties above to create them.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Eye size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">Select an element from the tree to edit its properties</p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Code size={16} />
                    Default Data
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(defaultData).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-2 rounded">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-semibold text-gray-700">{key}</label>
                          <button
                            onClick={() => {
                              const newData = { ...defaultData };
                              delete newData[key];
                              setDefaultData(newData);
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-bold"
                          >
                            ×
                          </button>
                        </div>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setDefaultData({ ...defaultData, [key]: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-xs font-mono"
                        />
                      </div>
                    ))}
                    {Object.keys(defaultData).length === 0 && (
                      <p className="text-xs text-gray-500 text-center py-4">
                        No data keys yet. Add elements with dataKey to populate this section.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {viewMode === 'visual' && (
          <>
            {/* Left Sidebar - Elements */}
            <div className="w-64 bg-white border-r overflow-y-auto">
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
                            onDragStart={(e) => handleElementDragStart(e, el.type)}
                            onClick={() => addElement(el.type)}
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

              <div className="border-t p-4">
                <h3 className="font-bold mb-3 text-sm">Structure Tree</h3>
                <div className="text-sm">
                  {structure.length === 0 ? (
                    <p className="text-gray-500 text-xs">Add elements to start</p>
                  ) : (
                    renderElementTree(structure)
                  )}
                </div>
              </div>
            </div>

            {/* Center - Visual Canvas */}
            <div className="flex-1 bg-gray-100 p-4 overflow-auto">
              <div className="mx-auto">
                {/* Preview Mode Switcher */}
                <div className="mb-4 flex items-center justify-center gap-3 bg-white rounded-lg p-3 shadow-md max-w-fit mx-auto">
                  <span className="text-sm font-semibold text-gray-700">Preview:</span>
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      previewMode === 'desktop'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🖥️ Desktop
                    <span className="text-xs ml-1 opacity-75">(100%)</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      previewMode === 'tablet'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📱 Tablet
                    <span className="text-xs ml-1 opacity-75">(768px)</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      previewMode === 'mobile'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📱 Mobile
                    <span className="text-xs ml-1 opacity-75">(375px)</span>
                  </button>
                </div>

                {/* Preview Container with dynamic width */}
                <div
                  className="bg-white rounded shadow-lg p-8 mx-auto transition-all duration-500 ease-in-out"
                  style={{
                    maxWidth: previewMode === 'desktop' ? '100%' :
                              previewMode === 'tablet' ? '768px' : '375px'
                  }}
                >
                  <div className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                    <h2 className="text-xl font-bold mb-2 text-purple-900">🎨 Visual Editor</h2>
                    <div className="text-sm text-purple-700 space-y-2">
                      <p className="font-medium">✨ Улучшенный редактор с поддержкой drag & drop:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                        <li>Перетаскивайте элементы используя <strong>drag handle</strong> (⋮⋮)</li>
                        <li>Быстрые действия на hover: <strong>дублировать</strong> и <strong>удалить</strong></li>
                        <li>Клавиатурные шорткаты: <kbd className="px-1 py-0.5 bg-purple-200 rounded text-purple-900 font-mono">Del</kbd> - удалить, <kbd className="px-1 py-0.5 bg-purple-200 rounded text-purple-900 font-mono">Ctrl+D</kbd> - дублировать</li>
                        <li>Точные зоны вставки: перед, после или внутрь контейнера</li>
                      </ul>
                    </div>
                  </div>

                  {structure.length === 0 ? (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded p-16 text-center bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-green-500', 'bg-green-50');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('border-green-500', 'bg-green-50');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-green-500', 'bg-green-50');
                        if (draggedElementType) {
                          addElement(draggedElementType);
                          setDraggedElementType(null);
                        }
                      }}
                    >
                      <div className="text-4xl mb-4">📦</div>
                      <p className="text-gray-500 text-lg mb-2">Начните создавать</p>
                      <p className="text-gray-400 text-sm">Перетащите элементы из левой панели или нажмите на них</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {/* Drop zone before first element */}
                      {renderDropZone([], 0, 'before-first')}

                      {/* Render top-level elements with drop zones between them */}
                      {structure.map((element, index) => (
                        <React.Fragment key={`root-${index}`}>
                          {renderVisualElement(element, [index])}
                          {/* Drop zone after each element */}
                          {renderDropZone([], index + 1, 'after')}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Properties and Live Preview */}
            <div className="w-96 bg-white border-l overflow-y-auto">
              <div className="p-4">
                <h3 className="font-bold mb-3">Properties</h3>

                {selectedElement ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Element Type</label>
                      <input
                        type="text"
                        value={selectedElement.element.type}
                        disabled
                        className="w-full px-3 py-2 border rounded bg-gray-100 text-sm"
                      />
                    </div>

                    {/* Data Key and Preview Value */}
                    {selectedElement.element.dataKey !== undefined && (
                      <div>
                        <label className="block text-sm font-semibold mb-1">Content</label>
                        <input
                          type="text"
                          value={defaultData[selectedElement.element.dataKey] || ''}
                          onChange={(e) => {
                            setDefaultData({
                              ...defaultData,
                              [selectedElement.element.dataKey]: e.target.value
                            });
                          }}
                          className="w-full px-3 py-2 border rounded text-sm"
                          placeholder="Enter content..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Key: {selectedElement.element.dataKey}</p>
                      </div>
                    )}

                    {/* Media Element Properties */}
                    {selectedElement.element.srcKey && (
                      <div className="space-y-3 border-t pt-3">
                        <h4 className="font-semibold text-sm text-blue-600">Media Properties</h4>

                        <div>
                          <label className="block text-sm font-semibold mb-1">
                            {selectedElement.element.type === 'iframe' ? 'Iframe URL' : 'Source URL'}
                          </label>
                          <input
                            type="text"
                            value={defaultData[selectedElement.element.srcKey] || ''}
                            onChange={(e) => {
                              setDefaultData({
                                ...defaultData,
                                [selectedElement.element.srcKey]: e.target.value
                              });
                            }}
                            className="w-full px-3 py-2 border rounded text-sm"
                            placeholder="https://example.com/image.jpg"
                          />
                          <p className="text-xs text-gray-500 mt-1">Key: {selectedElement.element.srcKey}</p>
                        </div>

                        {selectedElement.element.altKey && (
                          <div>
                            <label className="block text-sm font-semibold mb-1">Alt Text</label>
                            <input
                              type="text"
                              value={defaultData[selectedElement.element.altKey] || ''}
                              onChange={(e) => {
                                setDefaultData({
                                  ...defaultData,
                                  [selectedElement.element.altKey]: e.target.value
                                });
                              }}
                              className="w-full px-3 py-2 border rounded text-sm"
                              placeholder="Image description"
                            />
                            <p className="text-xs text-gray-500 mt-1">Key: {selectedElement.element.altKey}</p>
                          </div>
                        )}

                        {selectedElement.element.posterKey && (
                          <div>
                            <label className="block text-sm font-semibold mb-1">Poster URL</label>
                            <input
                              type="text"
                              value={defaultData[selectedElement.element.posterKey] || ''}
                              onChange={(e) => {
                                setDefaultData({
                                  ...defaultData,
                                  [selectedElement.element.posterKey]: e.target.value
                                });
                              }}
                              className="w-full px-3 py-2 border rounded text-sm"
                              placeholder="https://example.com/poster.jpg"
                            />
                            <p className="text-xs text-gray-500 mt-1">Key: {selectedElement.element.posterKey}</p>
                          </div>
                        )}

                        {selectedElement.element.titleKey && (
                          <div>
                            <label className="block text-sm font-semibold mb-1">Title</label>
                            <input
                              type="text"
                              value={defaultData[selectedElement.element.titleKey] || ''}
                              onChange={(e) => {
                                setDefaultData({
                                  ...defaultData,
                                  [selectedElement.element.titleKey]: e.target.value
                                });
                              }}
                              className="w-full px-3 py-2 border rounded text-sm"
                              placeholder="Embedded content"
                            />
                            <p className="text-xs text-gray-500 mt-1">Key: {selectedElement.element.titleKey}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Link href */}
                    {selectedElement.element.hrefKey && (
                      <div className="border-t pt-3">
                        <label className="block text-sm font-semibold mb-1">Link URL</label>
                        <input
                          type="text"
                          value={defaultData[selectedElement.element.hrefKey] || ''}
                          onChange={(e) => {
                            setDefaultData({
                              ...defaultData,
                              [selectedElement.element.hrefKey]: e.target.value
                            });
                          }}
                          className="w-full px-3 py-2 border rounded text-sm"
                          placeholder="https://example.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">Key: {selectedElement.element.hrefKey}</p>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <label className="block text-sm font-semibold mb-1">Tailwind Classes</label>
                      <textarea
                        value={selectedElement.element.className || ''}
                        onChange={(e) => updateClassName(selectedElement.path, e.target.value)}
                        className="w-full px-3 py-2 border rounded font-mono text-xs"
                        rows={4}
                        placeholder="py-12 text-center max-w-6xl"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Eye size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">Выберите элемент для редактирования</p>
                  </div>
                )}

                {/* Live Preview Controls */}
                {Object.keys(editableStyles).length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Settings size={16} />
                      Live Preview Controls
                    </h4>
                    <p className="text-xs text-gray-600 mb-3">
                      Настройте стили как это сделал бы пользователь
                    </p>
                    <div className="space-y-3">
                      {Object.entries(editableStyles).map(([key, config]) => (
                        <div key={key} className="border rounded p-3 bg-gray-50">
                          <label className="block text-xs font-semibold mb-2 text-purple-700">
                            {config.label || key}
                          </label>

                          {config.type === 'color' && (
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={previewStyles[key] || config.default}
                                onChange={(e) => setPreviewStyles({ ...previewStyles, [key]: e.target.value })}
                                className="w-12 h-10 border rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={previewStyles[key] || config.default}
                                onChange={(e) => setPreviewStyles({ ...previewStyles, [key]: e.target.value })}
                                className="flex-1 px-2 py-1 border rounded text-xs font-mono"
                              />
                            </div>
                          )}

                          {config.type === 'text' && (
                            <input
                              type="text"
                              value={previewStyles[key] || config.default}
                              onChange={(e) => setPreviewStyles({ ...previewStyles, [key]: e.target.value })}
                              placeholder={config.placeholder}
                              className="w-full px-2 py-1 border rounded text-xs"
                            />
                          )}

                          {config.type === 'number' && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={previewStyles[key] !== undefined ? previewStyles[key] : config.default}
                                onChange={(e) => setPreviewStyles({ ...previewStyles, [key]: e.target.value })}
                                min={config.min}
                                max={config.max}
                                step={config.step}
                                className="flex-1 px-2 py-1 border rounded text-xs"
                              />
                              {config.unit && <span className="text-xs text-gray-600">{config.unit}</span>}
                            </div>
                          )}

                          {config.type === 'range' && (
                            <div className="space-y-1">
                              <input
                                type="range"
                                value={previewStyles[key] !== undefined ? previewStyles[key] : config.default}
                                onChange={(e) => setPreviewStyles({ ...previewStyles, [key]: e.target.value })}
                                min={config.min}
                                max={config.max}
                                step={config.step}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>{config.min}</span>
                                <span className="font-semibold">
                                  {previewStyles[key] !== undefined ? previewStyles[key] : config.default}
                                  {config.unit}
                                </span>
                                <span>{config.max}</span>
                              </div>
                            </div>
                          )}

                          {config.type === 'select' && (
                            <select
                              value={previewStyles[key] || config.default}
                              onChange={(e) => setPreviewStyles({ ...previewStyles, [key]: e.target.value })}
                              className="w-full px-2 py-1 border rounded text-xs"
                            >
                              {config.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          )}

                          <button
                            onClick={() => {
                              const newPreview = { ...previewStyles };
                              delete newPreview[key];
                              setPreviewStyles(newPreview);
                            }}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            Reset to default
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {viewMode === 'json' && (
          <div className="flex-1 p-6 overflow-auto bg-gray-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Generated JSON Template</h2>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify({
                      id: Date.now(),
                      category_id: categoryId,
                      template_name: templateName,
                      name: templateName,
                      preview_url: 'https://via.placeholder.com/300x200',
                      settings: {
                        structure,
                        editableElements: Object.keys(defaultData),
                        editableStyles
                      },
                      default_data: defaultData
                    }, null, 2));
                    alert('JSON copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  <Copy size={14} className="inline mr-1" /> Copy JSON
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">Template Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Template Name:</span>
                    <span className="ml-2 font-semibold">{templateName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Category ID:</span>
                    <span className="ml-2 font-semibold">{categoryId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Elements:</span>
                    <span className="ml-2 font-semibold">{JSON.stringify(structure).match(/"type"/g)?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Editable Items:</span>
                    <span className="ml-2 font-semibold">{Object.keys(defaultData).length + Object.keys(editableStyles).length}</span>
                  </div>
                </div>
              </div>
              
              <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-auto text-xs leading-relaxed shadow-inner">
                {JSON.stringify({
                  id: Date.now(),
                  category_id: categoryId,
                  template_name: templateName,
                  name: templateName,
                  preview_url: 'https://via.placeholder.com/300x200',
                  settings: {
                    structure,
                    editableElements: Object.keys(defaultData),
                    editableStyles
                  },
                  default_data: defaultData
                }, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
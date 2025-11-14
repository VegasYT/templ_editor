import { getElementByPath, getDefaultClasses } from '../utils/elementUtils';

export const useDragAndDrop = ({
  structure,
  setStructure,
  defaultData,
  setDefaultData,
  draggedItem,
  setDraggedItem,
  draggedElementType,
  setDraggedElementType,
  dropTarget,
  setDropTarget,
  dropZone,
  setDropZone
}) => {
  const handleDragStart = (e, path) => {
    e.stopPropagation();
    setDraggedItem(path);
    setDraggedElementType(null);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleElementDragStart = (e, elementType) => {
    e.stopPropagation();
    setDraggedElementType(elementType);
    setDraggedItem(null);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e, path) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedItem && JSON.stringify(draggedItem) === JSON.stringify(path)) {
      return;
    }

    if (draggedItem && path.length > draggedItem.length) {
      const isChild = draggedItem.every((val, idx) => val === path[idx]);
      if (isChild) {
        return;
      }
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    const element = getElementByPath(structure, path);

    if (!element) {
      setDropZone('after');
      setDropTarget(path);
      return;
    }

    const hasChildren = element.children !== undefined;
    const isEmpty = hasChildren && element.children.length === 0;

    if (hasChildren) {
      if (isEmpty) {
        setDropZone('inside');
      } else {
        const MIN_ZONE_SIZE = 25;

        let topZoneSize = Math.max(MIN_ZONE_SIZE, height * 0.30);
        let bottomZoneSize = Math.max(MIN_ZONE_SIZE, height * 0.30);

        if (height < 100) {
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

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    const isOutside = x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;

    if (isOutside) {
      setDropTarget(null);
      setDropZone(null);
    }
  };

  const createNewElement = (type) => {
    const containerTypes = ['container', 'div', 'grid', 'ul', 'ol', 'button', 'a'];
    const needsDataKey = !['container', 'div', 'grid', 'br', 'hr', 'ul', 'ol', 'img', 'video', 'audio', 'iframe'].includes(type);

    const newElement = {
      type,
      className: getDefaultClasses(type),
      styles: {},
      children: containerTypes.includes(type) ? [] : undefined,
      dataKey: needsDataKey ? `${type}_${Date.now()}` : undefined,
    };

    const newData = {};

    if (needsDataKey && newElement.dataKey) {
      newData[newElement.dataKey] = `Sample ${type} text`;
    }

    if (type === 'img') {
      newElement.srcKey = `image_${Date.now()}`;
      newElement.altKey = `alt_${Date.now()}`;
      newData[newElement.srcKey] = 'https://via.placeholder.com/800x600';
      newData[newElement.altKey] = 'Image description';
    } else if (type === 'video' || type === 'audio') {
      newElement.srcKey = `${type}_${Date.now()}`;
      newElement.controls = true;
      newElement.loop = false;
      newElement.muted = false;
      newElement.autoPlay = false;
      if (type === 'video') {
        newElement.posterKey = `poster_${Date.now()}`;
        newData[newElement.srcKey] = 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4';
        newData[newElement.posterKey] = 'https://via.placeholder.com/1920x1080';
      } else {
        newData[newElement.srcKey] = 'https://example.com/audio.mp3';
      }
    } else if (type === 'iframe') {
      newElement.srcKey = `iframe_${Date.now()}`;
      newElement.titleKey = `title_${Date.now()}`;
      newElement.allowFullScreen = true;
      newData[newElement.srcKey] = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      newData[newElement.titleKey] = 'Embedded content';
    } else if (type === 'a') {
      newElement.hrefKey = `link_${Date.now()}`;
      newData[newElement.hrefKey] = '#';
    }

    // Update defaultData immediately
    if (Object.keys(newData).length > 0) {
      setDefaultData((prev) => ({ ...prev, ...newData }));
    }

    return newElement;
  };

  const handleDrop = (e, targetPath) => {
    e.preventDefault();
    e.stopPropagation();

    const zone = dropZone || 'after';

    if (draggedElementType) {
      const newStructure = [...structure];
      const newElement = createNewElement(draggedElementType);

      if (zone === 'inside') {
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

    const newStructure = [...structure];

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

    // Adjust target path if needed
    let adjustedTargetPath = [...targetPath];
    if (zone === 'after' && draggedItem.length === targetPath.length &&
        draggedItem.slice(0, -1).every((v, i) => v === targetPath[i]) &&
        draggedItem[draggedItem.length - 1] < targetPath[targetPath.length - 1]) {
      adjustedTargetPath[adjustedTargetPath.length - 1]--;
    }

    // Add to new position
    if (zone === 'inside') {
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

    document.querySelectorAll('[draggable="true"]').forEach(el => {
      el.style.opacity = '1';
    });
  };

  const handleDropAtPosition = (e, parentPath, insertIndex) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedElementType) {
      const newStructure = [...structure];
      const newElement = createNewElement(draggedElementType);

      if (parentPath.length === 0) {
        newStructure.splice(insertIndex, 0, newElement);
      } else {
        const parent = getElementByPath(newStructure, parentPath);
        if (parent && parent.children) {
          parent.children.splice(insertIndex, 0, newElement);
        }
      }

      setStructure(newStructure);
      setDraggedElementType(null);
      return;
    }

    if (draggedItem) {
      const newStructure = [...structure];

      const draggedElement = getElementByPath(newStructure, draggedItem);
      if (!draggedElement) {
        console.error('Dragged element not found');
        setDraggedItem(null);
        return;
      }
      const draggedElementCopy = JSON.parse(JSON.stringify(draggedElement));

      if (draggedItem.length === 1) {
        newStructure.splice(draggedItem[0], 1);
      } else {
        const dragParentPath = draggedItem.slice(0, -1);
        const dragParent = getElementByPath(newStructure, dragParentPath);
        if (dragParent && dragParent.children) {
          dragParent.children.splice(draggedItem[draggedItem.length - 1], 1);
        }
      }

      let adjustedIndex = insertIndex;
      const sameParent = JSON.stringify(draggedItem.slice(0, -1)) === JSON.stringify(parentPath);
      if (sameParent && draggedItem[draggedItem.length - 1] < insertIndex) {
        adjustedIndex--;
      }

      if (parentPath.length === 0) {
        newStructure.splice(adjustedIndex, 0, draggedElementCopy);
      } else {
        const parent = getElementByPath(newStructure, parentPath);
        if (parent && parent.children) {
          parent.children.splice(adjustedIndex, 0, draggedElementCopy);
        }
      }

      setStructure(newStructure);
      setDraggedItem(null);
    }
  };

  return {
    handleDragStart,
    handleElementDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDropAtPosition
  };
};

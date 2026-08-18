import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Tool = 'brush' | 'rectangle' | 'text' | 'crop';

interface InpaintEditorProps {
  isOpen: boolean;
  sourceImageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
  initialTool?: Tool;
  initialCropRatio?: string | null;
  cropGuidance?: string | null;
}

const COLORS = [
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#00FF00' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
];

const ASPECT_RATIOS = ['1:1', '3:4', '4:3', '9:16', '16:9', '21:9'];

const MAX_HISTORY = 5;

type CropDragMode = 'draw' | 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se';

function normalizeCropArea(crop: { x: number; y: number; width: number; height: number }) {
  return {
    x: Math.min(crop.x, crop.x + crop.width),
    y: Math.min(crop.y, crop.y + crop.height),
    width: Math.abs(crop.width),
    height: Math.abs(crop.height),
  };
}

function getCropHitZone(
  coords: { x: number; y: number },
  norm: { x: number; y: number; width: number; height: number },
  threshold = 15,
): CropDragMode {
  const corners: Array<{ zone: CropDragMode; cx: number; cy: number }> = [
    { zone: 'resize-nw', cx: norm.x, cy: norm.y },
    { zone: 'resize-ne', cx: norm.x + norm.width, cy: norm.y },
    { zone: 'resize-sw', cx: norm.x, cy: norm.y + norm.height },
    { zone: 'resize-se', cx: norm.x + norm.width, cy: norm.y + norm.height },
  ];
  for (const c of corners) {
    if (Math.abs(coords.x - c.cx) < threshold && Math.abs(coords.y - c.cy) < threshold) return c.zone;
  }
  if (
    coords.x >= norm.x && coords.x <= norm.x + norm.width &&
    coords.y >= norm.y && coords.y <= norm.y + norm.height
  ) {
    return 'move';
  }
  return 'draw';
}

export const InpaintEditor: React.FC<InpaintEditorProps> = ({
  isOpen,
  sourceImageUrl,
  onSave,
  onCancel,
  initialTool,
  initialCropRatio,
  cropGuidance,
}) => {
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const scratchCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<Tool>('brush');
  const [brushSize, setBrushSize] = useState<number>(20);
  const [brushOpacity, setBrushOpacity] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0].value);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Rectangle drawing state
  const [rectStart, setRectStart] = useState<{ x: number; y: number } | null>(null);

  // Inline text input state
  const [textInput, setTextInput] = useState<{ canvasX: number; canvasY: number; screenX: number; screenY: number } | null>(null);
  const [textValue, setTextValue] = useState<string>('');
  const textInputRef = useRef<HTMLInputElement>(null);
  const textCommittedRef = useRef<boolean>(false);

  // Crop state
  const [cropArea, setCropArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [selectedCropRatio, setSelectedCropRatio] = useState<string | null>(null);

  // Crop overlay canvas + drag tracking
  const cropOverlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropDragRef = useRef<{
    mode: CropDragMode;
    startMouseX: number;
    startMouseY: number;
    startCrop: { x: number; y: number; width: number; height: number };
  } | null>(null);

  // Zoom & pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTool(initialTool || 'brush');
    setSelectedCropRatio(initialCropRatio || null);
    setCropArea(null);
  }, [initialCropRatio, initialTool, isOpen, sourceImageUrl]);

  // Load image on mount or when sourceImageUrl changes
  useEffect(() => {
    if (!isOpen || !sourceImageUrl) return;

    const backgroundCanvas = backgroundCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;
    if (!backgroundCanvas || !drawingCanvas) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to image size
      backgroundCanvas.width = img.width;
      backgroundCanvas.height = img.height;
      drawingCanvas.width = img.width;
      drawingCanvas.height = img.height;

      // Set scratch canvas size
      const scratchCanvas = scratchCanvasRef.current;
      if (scratchCanvas) {
        scratchCanvas.width = img.width;
        scratchCanvas.height = img.height;
      }

      // Set crop overlay canvas size
      const overlayCanvas = cropOverlayCanvasRef.current;
      if (overlayCanvas) {
        overlayCanvas.width = img.width;
        overlayCanvas.height = img.height;
      }

      // Draw image on background canvas
      const bgCtx = backgroundCanvas.getContext('2d');
      if (bgCtx) {
        bgCtx.drawImage(img, 0, 0);
      }

      // Clear drawing canvas and reset history
      const drawCtx = drawingCanvas.getContext('2d');
      if (drawCtx) {
        drawCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        // Save initial empty state
        saveToHistory(drawCtx);
      }
    };
    img.src = sourceImageUrl;
  }, [isOpen, sourceImageUrl]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't close editor if text input is active
      if (e.key === 'Escape' && textInput) {
        return; // Let the input's own onKeyDown handle it
      }
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, historyIndex, history, textInput]);

  // Draw crop overlay on a SEPARATE canvas (so crop visuals never merge into saved output)
  useEffect(() => {
    const overlayCanvas = cropOverlayCanvasRef.current;
    if (!overlayCanvas) return;
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    if (!cropArea || activeTool !== 'crop') return;

    const norm = normalizeCropArea(cropArea);
    if (norm.width < 2 && norm.height < 2) return;

    // Semi-transparent mask outside crop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    ctx.clearRect(norm.x, norm.y, norm.width, norm.height);

    // Dashed white border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(norm.x, norm.y, norm.width, norm.height);
    ctx.setLineDash([]);

    // Corner resize handles
    const hs = 8;
    ctx.fillStyle = '#FFFFFF';
    for (const [cx, cy] of [
      [norm.x, norm.y],
      [norm.x + norm.width, norm.y],
      [norm.x, norm.y + norm.height],
      [norm.x + norm.width, norm.y + norm.height],
    ] as [number, number][]) {
      ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs);
    }

    // Ratio label
    if (selectedCropRatio) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(selectedCropRatio, norm.x + norm.width / 2, norm.y - 8);
    }
  }, [cropArea, activeTool, selectedCropRatio]);

  // Clear overlay canvas & reset cursor when leaving crop mode
  useEffect(() => {
    if (activeTool !== 'crop') {
      const overlayCanvas = cropOverlayCanvasRef.current;
      if (overlayCanvas) {
        const ctx = overlayCanvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      }
      const canvas = scratchCanvasRef.current;
      if (canvas) canvas.style.cursor = '';
    }
  }, [activeTool]);

  const applyAspectRatioConstraint = (
    startX: number,
    startY: number,
    currentX: number,
    currentY: number,
    ratio: string | null
  ): { width: number; height: number } => {
    if (!ratio) {
      return {
        width: currentX - startX,
        height: currentY - startY,
      };
    }

    const [ratioW, ratioH] = ratio.split(':').map(Number);
    const aspectRatio = ratioW / ratioH;

    const rawWidth = Math.abs(currentX - startX);
    const rawHeight = Math.abs(currentY - startY);

    // Use the larger dimension as the base
    let width: number, height: number;
    if (rawWidth > rawHeight) {
      width = rawWidth;
      height = width / aspectRatio;
    } else {
      height = rawHeight;
      width = height * aspectRatio;
    }

    // Apply sign based on drag direction
    return {
      width: currentX >= startX ? width : -width,
      height: currentY >= startY ? height : -height,
    };
  };

  const saveToHistory = (ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Add new snapshot
    newHistory.push(imageData);
    
    // Limit to MAX_HISTORY snapshots (FIFO)
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else {
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const drawingCanvas = drawingCanvasRef.current;
      if (!drawingCanvas) return;
      
      const ctx = drawingCanvas.getContext('2d');
      if (!ctx) return;

      const newIndex = historyIndex - 1;
      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const drawingCanvas = drawingCanvasRef.current;
      if (!drawingCanvas) return;
      
      const ctx = drawingCanvas.getContext('2d');
      if (!ctx) return;

      const newIndex = historyIndex + 1;
      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  // Focus the inline text input when it appears
  useEffect(() => {
    if (textInput && textInputRef.current) {
      // Use requestAnimationFrame to ensure the DOM has settled before focusing
      requestAnimationFrame(() => {
        textInputRef.current?.focus();
      });
    }
  }, [textInput]);

  const commitTextInput = () => {
    if (textCommittedRef.current) return;
    textCommittedRef.current = true;

    if (!textInput || !textValue.trim()) {
      setTextInput(null);
      setTextValue('');
      return;
    }
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;
    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    ctx.globalAlpha = brushOpacity;
    ctx.fillStyle = selectedColor;
    ctx.font = `${brushSize * 2}px Arial`;
    ctx.fillText(textValue, textInput.canvasX, textInput.canvasY);
    ctx.globalAlpha = 1;
    saveToHistory(ctx);
    setTextInput(null);
    setTextValue('');
  };

  const resetDrawing = () => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    setCropArea(null);
    cropDragRef.current = null;

    // Clear scratch canvas
    const scratch = scratchCanvasRef.current;
    if (scratch) {
      const sCtx = scratch.getContext('2d');
      if (sCtx) sCtx.clearRect(0, 0, scratch.width, scratch.height);
    }

    // Clear crop overlay canvas
    const overlayCanvas = cropOverlayCanvasRef.current;
    if (overlayCanvas) {
      const oCtx = overlayCanvas.getContext('2d');
      if (oCtx) oCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    saveToHistory(ctx);
  };

  // Zoom helpers
  const zoomIn = () => setZoomLevel(z => Math.min(z + 0.25, 5));
  const zoomOut = () => setZoomLevel(z => Math.max(z - 0.25, 0.25));
  const resetView = () => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey) return; // Only zoom when Ctrl is held
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel(z => Math.min(z + 0.1, 5));
    } else {
      setZoomLevel(z => Math.max(z - 0.1, 0.25));
    }
  };

  // Pan handlers (middle-click drag)
  const handlePanStart = (e: React.MouseEvent<HTMLDivElement>) => {
    // Middle mouse button (button === 1)
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY, offsetX: panOffset.x, offsetY: panOffset.y };
    }
  };

  const handlePanMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || !panStartRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPanOffset({ x: panStartRef.current.offsetX + dx, y: panStartRef.current.offsetY + dy });
  };

  const handlePanEnd = () => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * scaleY)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // If text input is open, commit it first and ignore this click
    if (textInput) {
      commitTextInput();
      return;
    }

    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);

    if (activeTool === 'crop') {
      // If an existing crop exists, check if we're clicking inside it (move) or on a corner (resize)
      if (cropArea && cropArea.width !== 0 && cropArea.height !== 0) {
        const norm = normalizeCropArea(cropArea);
        const hitZone = getCropHitZone(coords, norm);
        if (hitZone !== 'draw') {
          // Move or resize existing crop
          setIsCropping(true);
          cropDragRef.current = {
            mode: hitZone,
            startMouseX: coords.x,
            startMouseY: coords.y,
            startCrop: { ...norm },
          };
          return;
        }
      }
      // Start drawing a new crop
      setIsCropping(true);
      cropDragRef.current = {
        mode: 'draw',
        startMouseX: coords.x,
        startMouseY: coords.y,
        startCrop: { x: coords.x, y: coords.y, width: 0, height: 0 },
      };
      setCropArea({ x: coords.x, y: coords.y, width: 0, height: 0 });
    } else if (activeTool === 'brush') {
      setIsDrawing(true);
      // Draw on scratch canvas at full opacity; CSS opacity handles preview
      const scratchCanvas = scratchCanvasRef.current;
      if (!scratchCanvas) return;
      const sCtx = scratchCanvas.getContext('2d');
      if (!sCtx) return;
      sCtx.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
      sCtx.globalAlpha = 1;
      sCtx.strokeStyle = selectedColor;
      sCtx.lineWidth = brushSize;
      sCtx.lineCap = 'round';
      sCtx.lineJoin = 'round';
      sCtx.beginPath();
      sCtx.moveTo(coords.x, coords.y);
    } else if (activeTool === 'rectangle') {
      setIsDrawing(true);
      setRectStart(coords);
    } else if (activeTool === 'text') {
      // Show inline text input at click position
      const canvas = drawingCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      setTextInput({ canvasX: coords.x, canvasY: coords.y, screenX, screenY });
      setTextValue('');
      textCommittedRef.current = false;
      // Focus will happen via useEffect
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Update cursor in crop mode even when not dragging
    if (activeTool === 'crop' && !isCropping) {
      const canvas = scratchCanvasRef.current;
      if (canvas && cropArea && cropArea.width !== 0 && cropArea.height !== 0) {
        const hoverCoords = getCanvasCoordinates(e);
        const norm = normalizeCropArea(cropArea);
        const zone = getCropHitZone(hoverCoords, norm);
        if (zone === 'move') canvas.style.cursor = 'move';
        else if (zone === 'resize-nw' || zone === 'resize-se') canvas.style.cursor = 'nwse-resize';
        else if (zone === 'resize-ne' || zone === 'resize-sw') canvas.style.cursor = 'nesw-resize';
        else canvas.style.cursor = 'crosshair';
      }
    }

    if (!isDrawing && !isCropping) return;

    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);

    if (activeTool === 'crop' && isCropping && cropDragRef.current) {
      const drag = cropDragRef.current;
      const dx = coords.x - drag.startMouseX;
      const dy = coords.y - drag.startMouseY;

      if (drag.mode === 'draw') {
        const { width, height } = applyAspectRatioConstraint(
          drag.startCrop.x, drag.startCrop.y, coords.x, coords.y, selectedCropRatio,
        );
        setCropArea({ x: drag.startCrop.x, y: drag.startCrop.y, width, height });
      } else if (drag.mode === 'move') {
        const maxW = drawingCanvas.width;
        const maxH = drawingCanvas.height;
        const newX = Math.max(0, Math.min(maxW - drag.startCrop.width, drag.startCrop.x + dx));
        const newY = Math.max(0, Math.min(maxH - drag.startCrop.height, drag.startCrop.y + dy));
        setCropArea({ x: newX, y: newY, width: drag.startCrop.width, height: drag.startCrop.height });
      } else {
        // Corner resize — opposite corner stays fixed
        let fixedX: number, fixedY: number;
        if (drag.mode === 'resize-nw') { fixedX = drag.startCrop.x + drag.startCrop.width; fixedY = drag.startCrop.y + drag.startCrop.height; }
        else if (drag.mode === 'resize-ne') { fixedX = drag.startCrop.x; fixedY = drag.startCrop.y + drag.startCrop.height; }
        else if (drag.mode === 'resize-sw') { fixedX = drag.startCrop.x + drag.startCrop.width; fixedY = drag.startCrop.y; }
        else { fixedX = drag.startCrop.x; fixedY = drag.startCrop.y; }
        const { width, height } = applyAspectRatioConstraint(fixedX, fixedY, coords.x, coords.y, selectedCropRatio);
        setCropArea({ x: fixedX, y: fixedY, width, height });
      }
    } else if (activeTool === 'brush') {
      const scratchCanvas = scratchCanvasRef.current;
      const sCtx = scratchCanvas?.getContext('2d');
      if (sCtx) {
        sCtx.lineTo(coords.x, coords.y);
        sCtx.stroke();
      }
    } else if (activeTool === 'rectangle' && rectStart) {
      // Clear and redraw to show live preview
      if (historyIndex >= 0) {
        ctx.putImageData(history[historyIndex], 0, 0);
      }
      
      ctx.globalAlpha = brushOpacity;
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(
        rectStart.x,
        rectStart.y,
        coords.x - rectStart.x,
        coords.y - rectStart.y
      );
      ctx.globalAlpha = 1;
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'crop' && isCropping) {
      setIsCropping(false);
      cropDragRef.current = null;
      return;
    }

    if (!isDrawing) return;

    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const ctx = drawingCanvas.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'brush') {
      // Composite scratch canvas onto drawing canvas at target opacity
      const scratchCanvas = scratchCanvasRef.current;
      if (scratchCanvas) {
        const sCtx = scratchCanvas.getContext('2d');
        if (sCtx) sCtx.closePath();
        ctx.globalAlpha = brushOpacity;
        ctx.drawImage(scratchCanvas, 0, 0);
        ctx.globalAlpha = 1;
        sCtx?.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
      }
      saveToHistory(ctx);
    } else if (activeTool === 'rectangle' && rectStart) {
      const coords = getCanvasCoordinates(e);
      ctx.globalAlpha = brushOpacity;
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(
        rectStart.x,
        rectStart.y,
        coords.x - rectStart.x,
        coords.y - rectStart.y
      );
      ctx.globalAlpha = 1;
      saveToHistory(ctx);
      setRectStart(null);
    }

    setIsDrawing(false);
  };

  const handleSave = () => {
    try {
      const backgroundCanvas = backgroundCanvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      if (!backgroundCanvas || !drawingCanvas) {
        console.error('InpaintEditor: canvas refs missing', { bg: !!backgroundCanvas, draw: !!drawingCanvas });
        return;
      }
      if (backgroundCanvas.width === 0 || backgroundCanvas.height === 0) {
        console.error('InpaintEditor: background canvas has zero dimensions', backgroundCanvas.width, backgroundCanvas.height);
        return;
      }

      // Create a temporary canvas to merge both layers
      const mergeCanvas = document.createElement('canvas');
      
      // If crop area exists, use crop dimensions, otherwise use full canvas
      if (cropArea && cropArea.width !== 0 && cropArea.height !== 0) {
        const cropX = Math.min(cropArea.x, cropArea.x + cropArea.width);
        const cropY = Math.min(cropArea.y, cropArea.y + cropArea.height);
        const cropWidth = Math.abs(cropArea.width);
        const cropHeight = Math.abs(cropArea.height);
        
        mergeCanvas.width = cropWidth;
        mergeCanvas.height = cropHeight;
        
        const mergeCtx = mergeCanvas.getContext('2d');
        if (!mergeCtx) return;
        
        // Draw cropped portion of background
        mergeCtx.drawImage(
          backgroundCanvas,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );
        
        // Draw cropped portion of drawing layer
        mergeCtx.drawImage(
          drawingCanvas,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );
      } else {
        // No crop - merge full images
        mergeCanvas.width = backgroundCanvas.width;
        mergeCanvas.height = backgroundCanvas.height;
        
        const mergeCtx = mergeCanvas.getContext('2d');
        if (!mergeCtx) return;
        
        mergeCtx.drawImage(backgroundCanvas, 0, 0);
        mergeCtx.drawImage(drawingCanvas, 0, 0);
      }

      // Convert to JPEG base64
      const editedImageUrl = mergeCanvas.toDataURL('image/jpeg', 0.85);
      onSave(editedImageUrl);
    } catch (err) {
      console.error('InpaintEditor handleSave error:', err);
    }
  };

  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[1000] isolate flex items-center justify-center bg-black bg-opacity-75"
      ref={containerRef}
    >
      <div className="relative z-[1] bg-gray-900 rounded-lg shadow-xl max-w-7xl max-h-[95vh] overflow-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Edit Reference Image</h2>
          {cropGuidance && (
            <p className="mb-4 max-w-4xl text-sm leading-5 text-amber-300">{cropGuidance}</p>
          )}

          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap gap-4 items-center bg-gray-800 p-4 rounded-lg">
            {/* Tool Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTool('brush')}
                className={`px-4 py-2 rounded ${
                  activeTool === 'brush'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Brush
              </button>
              <button
                onClick={() => setActiveTool('rectangle')}
                className={`px-4 py-2 rounded ${
                  activeTool === 'rectangle'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Rectangle
              </button>
              <button
                onClick={() => setActiveTool('text')}
                className={`px-4 py-2 rounded ${
                  activeTool === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Text
              </button>
              <button
                onClick={() => setActiveTool('crop')}
                className={`px-4 py-2 rounded ${
                  activeTool === 'crop'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Crop
              </button>
            </div>

            {/* Aspect Ratio Selector (visible when crop tool is active) */}
            {activeTool === 'crop' && (
              <div className="flex items-center gap-2">
                <label className="text-white text-sm">Ratio:</label>
                <button
                  onClick={() => setSelectedCropRatio(null)}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedCropRatio === null
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Free
                </button>
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setSelectedCropRatio(ratio)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedCropRatio === ratio
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            )}

            {/* Brush Size */}
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Size:</label>
              <input
                type="range"
                min="5"
                max="200"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-white text-sm w-8">{brushSize}</span>
            </div>

            {/* Brush Opacity */}
            <div className="flex items-center gap-2">
              <label className="text-white text-sm">Opacity:</label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={Math.round(brushOpacity * 100)}
                onChange={(e) => setBrushOpacity(Number(e.target.value) / 100)}
                className="w-32"
              />
              <span className="text-white text-sm w-10">{Math.round(brushOpacity * 100)}%</span>
            </div>

            {/* Color Selection */}
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded border-2 ${
                    selectedColor === color.value ? 'border-white' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2 border-l border-gray-600 pl-4">
              <button
                onClick={zoomOut}
                className="px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 text-lg font-bold"
                title="Zoom Out"
              >
                −
              </button>
              <span className="text-white text-sm w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={zoomIn}
                className="px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 text-lg font-bold"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={resetView}
                className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 text-sm"
                title="Reset zoom and pan"
              >
                Reset View
              </button>
            </div>

            {/* History Controls */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="px-3 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                ↶ Undo
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="px-3 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                ↷ Redo
              </button>
              <button
                onClick={resetDrawing}
                className="px-3 py-2 rounded bg-red-700 text-white hover:bg-red-600"
              >
                Reset
              </button>
              {activeTool === 'crop' && cropArea && (
                <button
                  onClick={() => {
                    setCropArea(null);
                    cropDragRef.current = null;
                    const oc = cropOverlayCanvasRef.current;
                    if (oc) {
                      const c = oc.getContext('2d');
                      if (c) c.clearRect(0, 0, oc.width, oc.height);
                    }
                  }}
                  className="px-3 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                >
                  Clear Crop
                </button>
              )}
            </div>
          </div>

          {/* Canvas Container */}
          <div
            className="relative max-w-full max-h-[60vh] overflow-auto bg-gray-800 rounded-lg"
            onWheel={handleWheel}
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
            onContextMenu={(e) => e.preventDefault()}
            style={{ cursor: isPanning ? 'grabbing' : undefined }}
          >
            <div
              ref={canvasWrapperRef}
              className="relative inline-block origin-top-left"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: 'top left',
              }}
            >
              <canvas
                ref={backgroundCanvasRef}
                className="absolute top-0 left-0"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <canvas
                ref={drawingCanvasRef}
                className="absolute top-0 left-0"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              {/* Scratch canvas for non-additive brush opacity */}
              <canvas
                ref={scratchCanvasRef}
                className="absolute top-0 left-0 cursor-crosshair"
                style={{ maxWidth: '100%', height: 'auto', opacity: brushOpacity }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  if (isDrawing && activeTool === 'brush') {
                    setIsDrawing(false);
                    const scratchCanvas = scratchCanvasRef.current;
                    const drawCtx = drawingCanvasRef.current?.getContext('2d');
                    if (scratchCanvas && drawCtx) {
                      const sCtx = scratchCanvas.getContext('2d');
                      if (sCtx) sCtx.closePath();
                      drawCtx.globalAlpha = brushOpacity;
                      drawCtx.drawImage(scratchCanvas, 0, 0);
                      drawCtx.globalAlpha = 1;
                      sCtx?.clearRect(0, 0, scratchCanvas.width, scratchCanvas.height);
                      saveToHistory(drawCtx);
                    }
                  }
                  if (isCropping) {
                    setIsCropping(false);
                    cropDragRef.current = null;
                  }
                }}
              />
              {/* Crop overlay canvas — separate layer so crop visuals don't merge into saved output */}
              <canvas
                ref={cropOverlayCanvasRef}
                className="absolute top-0 left-0 pointer-events-none"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              {/* Inline text input overlay */}
              {textInput && (
                <input
                  ref={textInputRef}
                  type="text"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      commitTextInput();
                    } else if (e.key === 'Escape') {
                      e.stopPropagation();
                      textCommittedRef.current = true;
                      setTextInput(null);
                      setTextValue('');
                    }
                  }}
                  onBlur={() => {
                    // Small delay so Enter/Escape keydown can fire first
                    setTimeout(() => commitTextInput(), 50);
                  }}
                  className="absolute z-20 bg-black/50 border border-white/60 text-white px-1 outline-none"
                  style={{
                    left: textInput.screenX,
                    top: textInput.screenY - brushSize * 2,
                    fontSize: `${brushSize * 2 * (drawingCanvasRef.current ? drawingCanvasRef.current.getBoundingClientRect().width / drawingCanvasRef.current.width : 1)}px`,
                    fontFamily: 'Arial',
                    color: selectedColor,
                    minWidth: '60px',
                  }}
                  placeholder="Type here…"
                />
              )}
              {/* Spacer to maintain layout */}
              <canvas
                width={backgroundCanvasRef.current?.width || 800}
                height={backgroundCanvasRef.current?.height || 600}
                className="invisible"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
            >
              Save
            </button>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="mt-4 text-gray-400 text-sm">
            <p>
              <strong>Keyboard shortcuts:</strong> Ctrl+Z (Undo), Ctrl+Y (Redo), Escape (Cancel), Scroll to zoom, Middle-click drag to pan
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return modal;
  }

  return createPortal(modal, document.body);
};

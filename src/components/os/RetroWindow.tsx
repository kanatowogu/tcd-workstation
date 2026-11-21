import React, { useRef } from 'react';
import { soundEngine } from '../../utils/soundEngine';
import { TASKBAR_H, VIRTUAL_CRT_H, VIRTUAL_CRT_W } from './osTypes';

interface RetroWindowProps {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  zIndex: number;
  isActive: boolean;
  isMaximized?: boolean;
  isCorrupted?: boolean;
  isFairyTale?: boolean;
  closable?: boolean;
  peelClass?: string;
  containerRef: React.RefObject<HTMLDivElement>;
  onFocus: () => void;
  onClose: () => void;
  onToggleMaximize: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  children: React.ReactNode;
}

export const RetroWindow: React.FC<RetroWindowProps> = ({
  id,
  title,
  x,
  y,
  width,
  height,
  minWidth,
  minHeight,
  zIndex,
  isActive,
  isMaximized = false,
  isCorrupted = false,
  isFairyTale = false,
  closable = true,
  peelClass = '',
  containerRef,
  onFocus,
  onClose,
  onToggleMaximize,
  onMove,
  onResize,
  children,
}) => {
  const dragStartRef = useRef<{
    startClientX: number;
    startClientY: number;
    origX: number;
    origY: number;
    scale: number;
  } | null>(null);

  const resizeStartRef = useRef<{
    startClientX: number;
    startClientY: number;
    origW: number;
    origH: number;
    scale: number;
    axis: 'e' | 's' | 'se';
  } | null>(null);

  const getScale = (): number => {
    const el = containerRef.current;
    if (!el) return 1;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 ? rect.width / VIRTUAL_CRT_W : 1;
  };

  const handleTitlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    onFocus();
    if (isMaximized) return;

    const scale = getScale();
    dragStartRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: x,
      origY: y,
      scale,
    };

    const handleMove = (moveEvent: PointerEvent) => {
      if (!dragStartRef.current) return;
      const { startClientX, startClientY, origX, origY, scale: s } = dragStartRef.current;
      const dx = (moveEvent.clientX - startClientX) / s;
      const dy = (moveEvent.clientY - startClientY) / s;
      const maxX = Math.max(4, VIRTUAL_CRT_W - width - 4);
      const maxY = Math.max(4, VIRTUAL_CRT_H - TASKBAR_H - 36);
      const nextX = Math.min(Math.max(4, origX + dx), maxX);
      const nextY = Math.min(Math.max(4, origY + dy), maxY);
      onMove(Math.round(nextX), Math.round(nextY));
    };

    const handleUp = () => {
      dragStartRef.current = null;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const startResize = (
    e: React.PointerEvent<HTMLDivElement>,
    axis: 'e' | 's' | 'se'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    if (isMaximized) return;

    const scale = getScale();
    resizeStartRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      origW: width,
      origH: height,
      scale,
      axis,
    };

    const handleMove = (moveEvent: PointerEvent) => {
      if (!resizeStartRef.current) return;
      const { startClientX, startClientY, origW, origH, scale: s, axis: a } =
        resizeStartRef.current;
      const dx = (moveEvent.clientX - startClientX) / s;
      const dy = (moveEvent.clientY - startClientY) / s;

      const maxW = VIRTUAL_CRT_W - x - 4;
      const maxH = VIRTUAL_CRT_H - TASKBAR_H - y - 4;

      const nextW =
        a === 'e' || a === 'se'
          ? Math.min(Math.max(minWidth, origW + dx), maxW)
          : origW;
      const nextH =
        a === 's' || a === 'se'
          ? Math.min(Math.max(minHeight, origH + dy), maxH)
          : origH;

      onResize(Math.round(nextW), Math.round(nextH));
    };

    const handleUp = () => {
      resizeStartRef.current = null;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  return (
    <section
      className={`tcd-win ${isActive ? 'tcd-win-active' : ''} ${
        isCorrupted ? 'tcd-win-corrupted' : ''
      } ${isMaximized ? 'tcd-win-maximized' : ''} ${peelClass}`}
      data-win-id={id}
      style={{
        left: `${isMaximized ? 0 : x}px`,
        top: `${isMaximized ? 0 : y}px`,
        width: `${isMaximized ? VIRTUAL_CRT_W : width}px`,
        height: `${isMaximized ? VIRTUAL_CRT_H - TASKBAR_H : height}px`,
        zIndex,
      }}
      onPointerDown={onFocus}
    >
      <header
        className="tcd-win-titlebar"
        onPointerDown={handleTitlePointerDown}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          soundEngine.playKeyClick();
          onToggleMaximize();
        }}
      >
        <span className="tcd-win-title-icon" aria-hidden="true">
          {isFairyTale ? '☺' : '▪'}
        </span>
        <span className="tcd-win-title">{title}</span>
        <div className="tcd-win-controls">
          <button
            type="button"
            className="tcd-win-ctrl-btn"
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
            onClick={(e) => {
              e.stopPropagation();
              soundEngine.playKeyClick();
              onToggleMaximize();
            }}
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? '❐' : '□'}
          </button>
          <button
            type="button"
            className="tcd-win-ctrl-btn tcd-win-close"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              if (closable) {
                soundEngine.playKeyClick();
                onClose();
              } else {
                soundEngine.playGlitch();
              }
            }}
            title={closable ? 'Close' : 'LOCKED'}
          >
            {closable ? '×' : '!'}
          </button>
        </div>
      </header>

      <div className="tcd-win-body">{children}</div>

      {/* Drag-to-resize handles (Right edge, Bottom edge, Bottom-Right corner grip) */}
      {!isMaximized && (
        <>
          <div
            className="tcd-resize-e"
            onPointerDown={(e) => startResize(e, 'e')}
            aria-hidden="true"
          />
          <div
            className="tcd-resize-s"
            onPointerDown={(e) => startResize(e, 's')}
            aria-hidden="true"
          />
          <div
            className="tcd-resize-se"
            onPointerDown={(e) => startResize(e, 'se')}
            title="Drag to resize"
            aria-hidden="true"
          />
        </>
      )}
    </section>
  );
};

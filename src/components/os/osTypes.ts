import { OsAppId } from '../../types';

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OsWindowState extends WindowRect {
  id: OsAppId;
  isOpen: boolean;
  zIndex: number;
  minWidth: number;
  minHeight: number;
  isMaximized?: boolean;
  restoreRect?: WindowRect;
}

export interface DesktopIconDef {
  id: OsAppId;
  code: string;
  labelZh: string;
  labelEn: string;
  glyph: string;
  actMin?: number;
}

// Fixed virtual resolution matching the 3D CRT screen aspect ratio (0.78 / 0.46 ≈ 1.6956)
export const VIRTUAL_CRT_W = 1024;
export const VIRTUAL_CRT_H = 604;
export const TASKBAR_H = 34;

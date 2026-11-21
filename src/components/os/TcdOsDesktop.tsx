import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getNarrativeBundle } from '../../data/narrativeAssets';
import {
  ActStage,
  AuditOptionId,
  EndingARedactId,
  Language,
  OsAppId,
} from '../../types';
import { soundEngine } from '../../utils/soundEngine';
import { EvidenceArtwork } from '../EvidenceArtwork';
import { CalcApp, NotepadApp } from './apps/AccessoriesApps';
import { Audit302App } from './apps/Audit302App';
import { IntranetApp } from './apps/IntranetApp';
import { MyDocsApp } from './apps/MyDocsApp';
import { PicturesApp } from './apps/PicturesApp';
import { RecycleBinApp, SysMonApp } from './apps/SystemApps';
import {
  DesktopIconDef,
  OsWindowState,
  TASKBAR_H,
  VIRTUAL_CRT_H,
  VIRTUAL_CRT_W,
} from './osTypes';
import { RetroWindow } from './RetroWindow';
import './tcdOs.css';

interface TcdOsDesktopProps {
  lang: Language;
  actStage: ActStage;
  isEffectiveLensBroken: boolean;
  shiftNoticeAcknowledged: boolean;
  resignationRejected: boolean;
  complianceScore: number;
  awarenessScore: number;
  drawerLocks: [boolean, boolean, boolean];
  endingChoice: 'A' | 'B' | null;
  endingARedacted: EndingARedactId[];
  endingBSelection: 'E' | 'F' | null;
  peelStage: 0 | 1 | 2 | 3;
  sessionSeconds: number;
  onToggleLang: () => void;
  onExitMonitor: () => void;
  onAcknowledgeShift: () => void;
  onResignAttemptPreBroken: (stage: 0 | 1 | 2) => { quote: string; stageLabel: string };
  onLongPressStageHint: (stage: 'pct25' | 'pct55' | 'pct75_rebound') => void;
  onCompleteLongPressResign: () => void;
  onLaunchAudit: () => void;
  onSelectAuditOption: (option: AuditOptionId) => void;
  onConfirmOptionFToBranchB: () => void;
  onRedactEndingA: (id: EndingARedactId) => void;
  onDiscoverAnomaly: (key: string, subtitle?: string) => void;
  onBumpCompliance: (key: string, amount?: number) => void;
  onEmitSubtitle: (text: string, source: string) => void;
  onJumpActStage: (stage: ActStage) => void;
  onResetGame: () => void;
}

const DESKTOP_ICONS: DesktopIconDef[] = [
  {
    id: 'intranet',
    code: 'INTRANET.EXE',
    labelZh: '更正部内网',
    labelEn: 'Intranet',
    glyph: 'NET',
  },
  {
    id: 'mydocs',
    code: 'MY_DOCS',
    labelZh: '办公文档',
    labelEn: 'My Docs',
    glyph: 'DOC',
  },
  {
    id: 'pictures',
    code: 'PICTURES',
    labelZh: '科室图像库',
    labelEn: 'Pictures',
    glyph: 'BMP',
  },
  {
    id: 'notepad',
    code: 'NOTEPAD.EXE',
    labelZh: '记事本',
    labelEn: 'Notepad',
    glyph: 'TXT',
  },
  {
    id: 'calc',
    code: 'CALC.EXE',
    labelZh: '计算器',
    labelEn: 'Calc',
    glyph: '123',
  },
  {
    id: 'recycle',
    code: 'RECYCLE.BIN',
    labelZh: '回收站',
    labelEn: 'Recycle Bin',
    glyph: 'BIN',
  },
  {
    id: 'sysmon',
    code: 'C:\\302',
    labelZh: '系统状态',
    labelEn: 'C:\\302',
    glyph: 'SYS',
  },
  {
    id: 'audit',
    code: 'AUDIT_302.EXE',
    labelZh: '身份审计',
    labelEn: 'AUDIT_302',
    glyph: '!!!',
    actMin: 4,
  },
];

// Generous default window dimensions in 1024x604 virtual CRT coordinates
// Primary apps: ~66–73% width & ~71–77% height; Utility apps: ~42–50% width
function createInitialWindows(): Record<OsAppId, OsWindowState> {
  return {
    intranet: {
      id: 'intranet',
      isOpen: true,
      zIndex: 12,
      x: 174,
      y: 42,
      width: 720,
      height: 454,
      minWidth: 440,
      minHeight: 300,
    },
    mydocs: {
      id: 'mydocs',
      isOpen: false,
      zIndex: 10,
      x: 162,
      y: 48,
      width: 716,
      height: 442,
      minWidth: 440,
      minHeight: 280,
    },
    pictures: {
      id: 'pictures',
      isOpen: false,
      zIndex: 10,
      x: 152,
      y: 38,
      width: 736,
      height: 456,
      minWidth: 460,
      minHeight: 300,
    },
    notepad: {
      id: 'notepad',
      isOpen: false,
      zIndex: 10,
      x: 266,
      y: 70,
      width: 512,
      height: 392,
      minWidth: 320,
      minHeight: 230,
    },
    calc: {
      id: 'calc',
      isOpen: false,
      zIndex: 10,
      x: 312,
      y: 58,
      width: 432,
      height: 424,
      minWidth: 280,
      minHeight: 300,
    },
    recycle: {
      id: 'recycle',
      isOpen: false,
      zIndex: 10,
      x: 180,
      y: 54,
      width: 696,
      height: 436,
      minWidth: 430,
      minHeight: 280,
    },
    sysmon: {
      id: 'sysmon',
      isOpen: false,
      zIndex: 10,
      x: 192,
      y: 56,
      width: 676,
      height: 428,
      minWidth: 420,
      minHeight: 290,
    },
    audit: {
      id: 'audit',
      isOpen: false,
      zIndex: 40,
      x: 142,
      y: 34,
      width: 748,
      height: 472,
      minWidth: 500,
      minHeight: 340,
    },
  };
}

export const TcdOsDesktop: React.FC<TcdOsDesktopProps> = ({
  lang,
  actStage,
  isEffectiveLensBroken,
  shiftNoticeAcknowledged,
  resignationRejected,
  complianceScore,
  awarenessScore,
  drawerLocks,
  endingChoice,
  endingARedacted,
  endingBSelection,
  peelStage,
  sessionSeconds,
  onToggleLang,
  onExitMonitor,
  onAcknowledgeShift,
  onResignAttemptPreBroken,
  onLongPressStageHint,
  onCompleteLongPressResign,
  onLaunchAudit,
  onSelectAuditOption,
  onConfirmOptionFToBranchB,
  onRedactEndingA,
  onDiscoverAnomaly,
  onBumpCompliance,
  onEmitSubtitle,
  onJumpActStage,
  onResetGame,
}) => {
  const desktopRef = useRef<HTMLDivElement>(null);
  const [windows, setWindows] = useState<Record<OsAppId, OsWindowState>>(
    createInitialWindows
  );
  const [, setTopZ] = useState<number>(20);
  const [activeApp, setActiveApp] = useState<OsAppId | null>('intranet');
  const [selectedIcon, setSelectedIcon] = useState<OsAppId | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState<boolean>(false);
  const [clockText, setClockText] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  const { ui, v2_4_5 } = getNarrativeBundle(lang);
  const endingB = v2_4_5.asset6_endings.endingB;

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClockText(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: actStage >= 3 ? '2-digit' : undefined,
        })
      );
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [actStage]);

  const openOrFocusApp = useCallback((appId: OsAppId) => {
    soundEngine.playKeyClick();
    setStartMenuOpen(false);
    setTopZ((prevZ) => {
      const nextZ = prevZ + 1;
      setWindows((prev) => ({
        ...prev,
        [appId]: {
          ...prev[appId],
          isOpen: true,
          zIndex: nextZ,
        },
      }));
      return nextZ;
    });
    setActiveApp(appId);
  }, []);

  const closeApp = useCallback((appId: OsAppId) => {
    setWindows((prev) => ({
      ...prev,
      [appId]: { ...prev[appId], isOpen: false, isMaximized: false },
    }));
    setActiveApp((cur) => (cur === appId ? null : cur));
  }, []);

  const moveApp = useCallback((appId: OsAppId, x: number, y: number) => {
    setWindows((prev) => ({
      ...prev,
      [appId]: { ...prev[appId], x, y },
    }));
  }, []);

  const resizeApp = useCallback((appId: OsAppId, width: number, height: number) => {
    setWindows((prev) => ({
      ...prev,
      [appId]: { ...prev[appId], width, height },
    }));
  }, []);

  const toggleMaximizeApp = useCallback((appId: OsAppId) => {
    setWindows((prev) => {
      const win = prev[appId];
      if (win.isMaximized) {
        const rest = win.restoreRect ?? {
          x: win.x,
          y: win.y,
          width: win.width,
          height: win.height,
        };
        return {
          ...prev,
          [appId]: {
            ...win,
            ...rest,
            isMaximized: false,
            restoreRect: undefined,
          },
        };
      }
      return {
        ...prev,
        [appId]: {
          ...win,
          isMaximized: true,
          restoreRect: {
            x: win.x,
            y: win.y,
            width: win.width,
            height: win.height,
          },
          x: 0,
          y: 0,
          width: VIRTUAL_CRT_W,
          height: VIRTUAL_CRT_H - TASKBAR_H,
        },
      };
    });
  }, []);

  // Auto-launch AUDIT_302.EXE when entering Act 4
  useEffect(() => {
    if (actStage === 4) {
      openOrFocusApp('audit');
    } else {
      setWindows((prev) =>
        prev.audit.isOpen
          ? { ...prev, audit: { ...prev.audit, isOpen: false } }
          : prev
      );
    }
  }, [actStage, openOrFocusApp]);

  const getWindowTitle = (id: OsAppId): string => {
    switch (id) {
      case 'intranet':
        return lang === 'zh'
          ? 'INTRANET.EXE — 更正部员工门户'
          : 'INTRANET.EXE — TCD Employee Portal';
      case 'mydocs':
        return lang === 'zh' ? 'MY_DOCS — 办公杂物档案' : 'MY_DOCS — Office Files';
      case 'pictures':
        return lang === 'zh' ? 'PICTURES — 科室图像库' : 'PICTURES — Image Viewer';
      case 'notepad':
        return lang === 'zh' ? 'NOTEPAD.EXE — 记事本' : 'NOTEPAD.EXE — Notepad';
      case 'calc':
        return lang === 'zh' ? 'CALC.EXE — 计算器' : 'CALC.EXE — Calculator';
      case 'recycle':
        return lang === 'zh' ? 'RECYCLE.BIN — 回收站' : 'RECYCLE.BIN — Recycle Bin';
      case 'sysmon':
        return lang === 'zh' ? 'C:\\302 — 系统底层状态' : 'C:\\302 — System Monitor';
      case 'audit':
        return lang === 'zh'
          ? 'AUDIT_302.EXE — 强制身份核验'
          : 'AUDIT_302.EXE — Identity Audit';
    }
  };

  const openWindowList = (Object.values(windows) as OsWindowState[]).filter(
    (w) => w.isOpen
  );
  const isBranchB = endingChoice === 'B';
  const isCheerfulAct3 = isEffectiveLensBroken && actStage === 3;
  const isAct4DarkMode = isEffectiveLensBroken && actStage >= 4;
  const showCorruptedBadge =
    isAct4DarkMode && !(endingChoice === 'A' && endingARedacted.length >= 2);

  // Four-Stage Visual Palette Progression:
  // Act 1 (or restored Branch A) -> Authentic 1990s Win 3.1 Teal (#008080)
  // Act 2 -> Pony Island Subversive Bleed (#133336 + scratched tally marks + RGB icon shift)
  // Act 3 -> Clean, Sunny, Wholesome Model-Office Desktop
  // Act 4 -> Dark Crimson Interrogation Desktop (AUDIT_302.EXE)
  const isAct2BleedMode = !isEffectiveLensBroken && actStage === 2;
  const paletteClass = isCheerfulAct3
    ? 'theme-act3-fairytale'
    : isAct4DarkMode
    ? 'theme-act4-audit'
    : isAct2BleedMode
    ? 'theme-act2-bleed'
    : 'theme-act1-win90s';

  return (
    <div
      className={`tcd-os-crt-screen ${paletteClass} ${
        isBranchB ? `peel-stage-${peelStage}` : ''
      }`}
      onClick={() => {
        setSelectedIcon(null);
        setStartMenuOpen(false);
      }}
    >
      {/* Subtle CRT Scanline & Curved Glass Vignette */}
      <div className="crt-scanline-layer" aria-hidden="true" />
      <div
        className={`crt-disco-reflection ${
          isAct4DarkMode && !isBranchB ? 'disco-active' : ''
        } ${isBranchB ? 'disco-frozen' : ''}`}
        aria-hidden="true"
      />
      {isAct4DarkMode && !isBranchB && (
        <div className="crt-crimson-edge-bleed" aria-hidden="true" />
      )}

      {/* BRANCH B EXPOSED PITCH-BLACK UNDERLYING INDEX MATRIX (peelStage 0 -> 3) */}
      {isBranchB && (
        <div
          className={`tcd-bare-matrix-underlayer ${
            peelStage >= 3 ? 'matrix-fully-exposed' : ''
          }`}
        >
          <div className="matrix-top-bar">
            <span>{endingB.systemHeader}</span>
            <span>{ui.endingBMatrixTag}</span>
          </div>
          <p className="matrix-desc">{endingB.uiPeelDescription}</p>
          <div className="matrix-split">
            <div className="matrix-tree-col">
              <pre className="matrix-pre">
                {endingB.rawMatrixLines.join('\n')}
              </pre>
              <blockquote className="matrix-quote">
                {endingB.finalMonologue}
              </blockquote>
              <div className="matrix-cursor-line">
                <span>{endingB.statusFooter}</span>
                <span className="matrix-blink-block" />
              </div>
            </div>
            <div className="matrix-photo-col">
              <EvidenceArtwork
                type="Photo_Truth"
                lang={lang}
                caption={ui.endingBPhotoCaption}
              />
            </div>
          </div>
          <div className="matrix-actions">
            <button
              type="button"
              className="os-retro-btn os-btn-danger"
              onClick={() => {
                soundEngine.playKeyClick();
                onResetGame();
              }}
            >
              {endingB.replayButton}
            </button>
          </div>
        </div>
      )}

      {/* TCD-OS v1.84 GRAPHICAL SHELL (Fixed 1024x604 virtual workspace) */}
      <div
        ref={desktopRef}
        className={`tcd-os-workspace ${
          isBranchB && peelStage >= 3 ? 'shell-unmounted' : ''
        }`}
      >
        {/* ACT 2: Faint Scratched Tally Marks (|||| / 正字) Bleed Under Wallpaper */}
        {isAct2BleedMode && (
          <svg
            className="os-wallpaper-svg os-act2-scratches"
            viewBox="0 0 1024 570"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Scratched tally clusters (|||| / crossed 5s) */}
            {[
              [220, 88],
              [290, 96],
              [790, 120],
              [855, 134],
              [770, 410],
              [155, 445],
              [520, 490],
            ].map(([tx, ty], i) => (
              <g
                key={i}
                transform={`translate(${tx}, ${ty}) rotate(${(i % 3) * 4 - 4})`}
                stroke="rgba(220, 240, 236, 0.14)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="0" y1="0" x2="2" y2="26" />
                <line x1="9" y1="-1" x2="10" y2="27" />
                <line x1="18" y1="1" x2="17" y2="25" />
                <line x1="27" y1="0" x2="28" y2="26" />
                <line x1="-4" y1="22" x2="34" y2="4" />
              </g>
            ))}
            {/* Faint etched "正" tally marks & 302 scratches */}
            {[
              [890, 250],
              [935, 255],
              [885, 315],
            ].map(([zx, zy], idx) => (
              <g
                key={`z-${idx}`}
                transform={`translate(${zx}, ${zy})`}
                stroke="rgba(215, 232, 228, 0.13)"
                strokeWidth="1.8"
                fill="none"
              >
                <path d="M 0 0 H 26 M 13 0 V 26 M 13 13 H 24 M 4 11 V 26 M -2 26 H 28" />
              </g>
            ))}
            <text
              x="760"
              y="525"
              fill="rgba(215, 235, 230, 0.12)"
              fontSize="24"
              fontFamily="monospace"
            >
              1095 // CABINET #3 // 302
            </text>
          </svg>
        )}

        {/* ACT 3: Clean, Sunny, Wholesome Model-Office Clouds, Rainbow & Cheerful Sun */}
        {isCheerfulAct3 && (
          <svg
            className="os-wallpaper-svg os-act3-fairytale-bg"
            viewBox="0 0 1024 570"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Sunny Pastel Rainbow Arch */}
            <path
              d="M 140 570 A 420 390 0 0 1 980 570"
              fill="none"
              stroke="rgba(130, 212, 255, 0.36)"
              strokeWidth="26"
            />
            <path
              d="M 166 570 A 394 364 0 0 1 954 570"
              fill="none"
              stroke="rgba(255, 224, 118, 0.44)"
              strokeWidth="26"
            />
            <path
              d="M 192 570 A 368 338 0 0 1 928 570"
              fill="none"
              stroke="rgba(255, 198, 222, 0.32)"
              strokeWidth="26"
            />

            {/* Smiling Sunshine Badge (positioned neatly below top-right stage bar) */}
            <g transform="translate(840, 128)">
              <circle cx="0" cy="0" r="40" fill="#ffe66d" stroke="#f0a830" strokeWidth="4" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <rect
                  key={deg}
                  x="-5"
                  y="-60"
                  width="10"
                  height="13"
                  fill="#ffcf4d"
                  transform={`rotate(${deg})`}
                />
              ))}
              {/* Cheerful eyes, rosy cheeks & friendly smile */}
              <rect x="-15" y="-12" width="7" height="7" fill="#3a2810" />
              <rect x="8" y="-12" width="7" height="7" fill="#3a2810" />
              <circle cx="-21" cy="4" r="5" fill="#ff9bb5" opacity="0.7" />
              <circle cx="21" cy="4" r="5" fill="#ff9bb5" opacity="0.7" />
              <path
                d="M -16 6 Q 0 22 16 6"
                fill="none"
                stroke="#3a2810"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>

            {/* Fluffy Pixel-Art Clouds */}
            {[
              [220, 90, 1],
              [540, 62, 0.85],
              [780, 445, 1.1],
              [290, 470, 0.9],
            ].map(([cx, cy, sc], idx) => (
              <g
                key={idx}
                transform={`translate(${cx}, ${cy}) scale(${sc})`}
                fill="#ffffff"
                opacity="0.88"
              >
                <rect x="0" y="16" width="110" height="24" />
                <rect x="16" y="4" width="76" height="20" />
                <rect x="32" y="-6" width="42" height="14" />
              </g>
            ))}

            {/* Cheerful Sunshine Sparkles */}
            {[
              [140, 220],
              [935, 225],
              [950, 345],
              [180, 390],
            ].map(([sx, sy], idx) => (
              <text
                key={idx}
                x={sx}
                y={sy}
                fill="#f0a830"
                fontSize="20"
                fontFamily="monospace"
                opacity="0.85"
              >
                {idx % 2 === 0 ? '★' : '✦'}
              </text>
            ))}
          </svg>
        )}

        {/* Temporary Compact Retro Stage Switcher pinned top-right on desktop wallpaper */}
        {!(isBranchB && peelStage >= 3) && (
          <div
            className="os-temp-stage-bar"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="os-temp-stage-tag">DEV:</span>
            {([1, 2, 3, 4] as ActStage[]).map((stage) => (
              <button
                key={stage}
                type="button"
                className={`os-temp-stage-btn ${
                  actStage === stage ? 'active' : ''
                }`}
                onClick={() => {
                  soundEngine.playKeyClick();
                  onJumpActStage(stage);
                }}
              >
                ACT {stage}
              </button>
            ))}
          </div>
        )}

        {/* Desktop Watermark / Act 3 Wholesome Commendation Badge */}
        <div
          className={`tcd-os-watermark ${
            isBranchB && peelStage >= 2 ? 'peel-drop-2' : ''
          }`}
          aria-hidden="true"
        >
          {isCheerfulAct3 ? (
            <div className="tcd-fairytale-slogan-card">
              <div className="fairytale-slogan-title">
                {lang === 'zh'
                  ? '☀ 市政模范文明科室 · 幸福工作站 ☀'
                  : '☀ MODEL MUNICIPAL OFFICE WORKSTATION ☀'}
              </div>
              <div className="fairytale-slogan-sub">
                {lang === 'zh'
                  ? '先进示范工位 #302 · 微笑服务每一天'
                  : 'COMMENDATION DESK #302 · SERVICE WITH A SMILE'}
              </div>
            </div>
          ) : (
            <>
              <div>TCD-OS v1.84</div>
              <div>SECTOR B WORKSTATION #302</div>
            </>
          )}
        </div>

        {/* Desktop Icon Grid */}
        <div
          className={`tcd-desktop-icons ${
            isBranchB && peelStage >= 2 ? 'peel-drop-2' : ''
          }`}
        >
          {DESKTOP_ICONS.filter(
            (icon) => !icon.actMin || actStage >= icon.actMin
          ).map((icon) => (
            <button
              key={icon.id}
              type="button"
              className={`tcd-desktop-icon ${
                selectedIcon === icon.id ? 'icon-selected' : ''
              } ${icon.id === 'audit' ? 'icon-alert' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                soundEngine.playKeyClick();
                setSelectedIcon(icon.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                openOrFocusApp(icon.id);
              }}
              title={
                lang === 'zh'
                  ? `双击打开 ${icon.code}`
                  : `Double-click to open ${icon.code}`
              }
            >
              <span className="tcd-icon-box">{icon.glyph}</span>
              <span className="tcd-icon-label">
                {lang === 'zh' ? icon.labelZh : icon.labelEn}
              </span>
              <span className="tcd-icon-code">{icon.code}</span>
            </button>
          ))}
        </div>

        {/* Open Draggable & Resizable Retro Windows */}
        {openWindowList.map((win) => (
          <RetroWindow
            key={win.id}
            id={win.id}
            title={getWindowTitle(win.id)}
            x={win.x}
            y={win.y}
            width={win.width}
            height={win.height}
            minWidth={win.minWidth}
            minHeight={win.minHeight}
            zIndex={win.zIndex}
            isActive={activeApp === win.id}
            isMaximized={win.isMaximized}
            isCorrupted={win.id === 'audit'}
            isFairyTale={isCheerfulAct3 && win.id !== 'audit'}
            closable={win.id !== 'audit'}
            peelClass={
              isBranchB && peelStage >= 1
                ? peelStage >= 2
                  ? 'peel-drop-2'
                  : 'peel-drop-1'
                : ''
            }
            containerRef={desktopRef}
            onFocus={() => openOrFocusApp(win.id)}
            onClose={() => closeApp(win.id)}
            onToggleMaximize={() => toggleMaximizeApp(win.id)}
            onMove={(nx, ny) => moveApp(win.id, nx, ny)}
            onResize={(nw, nh) => resizeApp(win.id, nw, nh)}
          >
            {win.id === 'intranet' && (
              <IntranetApp
                lang={lang}
                actStage={actStage}
                isEffectiveLensBroken={isEffectiveLensBroken}
                shiftNoticeAcknowledged={shiftNoticeAcknowledged}
                resignationRejected={resignationRejected}
                onAcknowledgeShift={onAcknowledgeShift}
                onResignAttemptPreBroken={onResignAttemptPreBroken}
                onLongPressStageHint={onLongPressStageHint}
                onCompleteLongPressResign={onCompleteLongPressResign}
                onLaunchAudit={onLaunchAudit}
                onBumpAwareness={(k) => onDiscoverAnomaly(k)}
                onBumpCompliance={onBumpCompliance}
                onEmitSubtitle={onEmitSubtitle}
              />
            )}
            {win.id === 'mydocs' && (
              <MyDocsApp
                lang={lang}
                actStage={actStage}
                onDiscoverAnomaly={onDiscoverAnomaly}
              />
            )}
            {win.id === 'pictures' && (
              <PicturesApp
                lang={lang}
                actStage={actStage}
                onDiscoverAnomaly={onDiscoverAnomaly}
              />
            )}
            {win.id === 'notepad' && (
              <NotepadApp
                lang={lang}
                actStage={actStage}
                onDiscoverAnomaly={onDiscoverAnomaly}
              />
            )}
            {win.id === 'calc' && (
              <CalcApp
                lang={lang}
                actStage={actStage}
                onDiscoverAnomaly={onDiscoverAnomaly}
              />
            )}
            {win.id === 'recycle' && (
              <RecycleBinApp
                lang={lang}
                actStage={actStage}
                onDiscoverAnomaly={onDiscoverAnomaly}
              />
            )}
            {win.id === 'sysmon' && (
              <SysMonApp
                lang={lang}
                actStage={actStage}
                sessionSeconds={sessionSeconds}
                complianceScore={complianceScore}
                awarenessScore={awarenessScore}
                drawerLocks={drawerLocks}
                onDiscoverAnomaly={onDiscoverAnomaly}
              />
            )}
            {win.id === 'audit' && (
              <Audit302App
                lang={lang}
                complianceScore={complianceScore}
                awarenessScore={awarenessScore}
                sessionSeconds={sessionSeconds}
                endingChoice={endingChoice}
                endingARedacted={endingARedacted}
                endingBSelection={endingBSelection}
                onSelectAuditOption={onSelectAuditOption}
                onConfirmOptionFToBranchB={onConfirmOptionFToBranchB}
                onRedactEndingA={onRedactEndingA}
                onResetGame={onResetGame}
              />
            )}
          </RetroWindow>
        ))}

        {/* Start / Programs Popup Menu */}
        {startMenuOpen && (
          <div
            className="tcd-start-menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tcd-start-head">
              {isCheerfulAct3
                ? '☀ TCD-OS v1.84 // MODEL OFFICE ☀'
                : 'TCD-OS v1.84 // PROGRAMS'}
            </div>
            {DESKTOP_ICONS.filter(
              (icon) => !icon.actMin || actStage >= icon.actMin
            ).map((icon) => (
              <button
                key={icon.id}
                type="button"
                className="tcd-start-item"
                onClick={() => openOrFocusApp(icon.id)}
              >
                <span>[{icon.glyph}]</span>
                <span>
                  {lang === 'zh' ? icon.labelZh : icon.labelEn} ({icon.code})
                </span>
              </button>
            ))}
            <div className="tcd-start-sep" />
            <button
              type="button"
              className="tcd-start-item"
              onClick={() => {
                soundEngine.playPaperRustle();
                setStartMenuOpen(false);
                onExitMonitor();
              }}
            >
              <span>[ESC]</span>
              <span>
                {lang === 'zh' ? '退回办公桌视角' : 'Step Back to Desk'}
              </span>
            </button>
          </div>
        )}

        {/* Bottom Retro Taskbar / Status Bar */}
        <footer
          className={`tcd-taskbar ${
            isBranchB && peelStage >= 2 ? 'peel-drop-2' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className={`tcd-start-btn ${startMenuOpen ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playKeyClick();
              setStartMenuOpen((prev) => !prev);
            }}
          >
            {isCheerfulAct3
              ? lang === 'zh'
                ? '☀ 开始'
                : '☀ Start'
              : lang === 'zh'
              ? '■ 程序'
              : '■ Start'}
          </button>

          <div className="tcd-task-tabs">
            {openWindowList.map((win) => (
              <button
                key={win.id}
                type="button"
                className={`tcd-task-tab ${
                  activeApp === win.id ? 'active' : ''
                }`}
                onClick={() => openOrFocusApp(win.id)}
              >
                {DESKTOP_ICONS.find((i) => i.id === win.id)?.code ?? win.id}
              </button>
            ))}
          </div>

          <div className="tcd-task-tray">
            <span
              className={`tcd-tray-op ${
                showCorruptedBadge
                  ? 'corrupted'
                  : isCheerfulAct3
                  ? 'model-star'
                  : ''
              }`}
            >
              {showCorruptedBadge
                ? lang === 'zh'
                  ? '☺ 合并索引点'
                  : '☺ MERGER'
                : isCheerfulAct3
                ? lang === 'zh'
                  ? '★ 优秀文员 #302'
                  : '★ MODEL #302'
                : '#302'}
            </span>
            <button
              type="button"
              className="tcd-tray-btn"
              onClick={() => {
                soundEngine.playKeyClick();
                onToggleLang();
              }}
              title="Switch Language / 切换语言"
            >
              {lang === 'zh' ? '中/EN' : 'EN/中'}
            </button>
            <button
              type="button"
              className="tcd-tray-btn"
              onClick={() => {
                soundEngine.playPaperRustle();
                onExitMonitor();
              }}
              title="ESC — Step back to desk"
            >
              ESC
            </button>
            <span className="tcd-tray-clock">{clockText}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

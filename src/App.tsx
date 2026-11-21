import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DeskScene } from './components/DeskScene';
import { TcdOsDesktop } from './components/os/TcdOsDesktop';
import { SubtitleHUD } from './components/SubtitleHUD';
import { getNarrativeBundle } from './data/narrativeAssets';
import {
  ActStage,
  AuditOptionId,
  DeskFileId,
  EndingARedactId,
  FocusTarget,
  GameState,
  Language,
  V2PropId,
} from './types';
import { soundEngine } from './utils/soundEngine';

const INITIAL_GAME_STATE: GameState = {
  actStage: 1,
  isPhase2Doubt: false,
  lensBroken: false,
  resignationRejected: false,
  endingChoice: null,
  endingARedacted: [],
  endingBSelection: null,
  peelStage: 0,

  complianceScore: 0,
  awarenessScore: 0,
  shiftNoticeAcknowledged: false,
  discoveredAnomalies: [],

  inspectedProps: [],
  phase2PropsInspected: [],
  phase3PropsInspected: [],

  // Phase 2 Extensibility Interfaces
  drawerLocks: [false, true, true],
  unlockedDrawers: [0],
  openDrawers: [false, false, false],
  isTapePlaying: false,
  activeDeskFiles: ['manual', 'file01', 'file02', 'file03'],

  lastResignQuoteIndex: -1,
  lastIdleBanterIndex: -1,
};

type InnerVoiceState =
  | { kind: 'wakeup' }
  | { kind: 'idle_banter'; index: number }
  | { kind: 'monitor_hint' }
  | { kind: 'desk_file_phase2'; fileId: DeskFileId }
  | { kind: 'custom'; textZh: string; textEn: string; sourceZh: string; sourceEn: string }
  | { kind: 'direct'; text: string; source: string }
  | { kind: 'prop'; id: V2PropId; stage: 1 | 2 | 3; lineIndex: number }
  | { kind: 'resign'; stage: 0 | 1 | 2; index: number }
  | { kind: 'longpress_stage'; stage: 'pct25' | 'pct55' | 'pct75_rebound' }
  | { kind: 'rejected' }
  | { kind: 'endingA_step'; id: EndingARedactId }
  | { kind: 'endingA_final' }
  | { kind: 'endingB_final' };

const BRIGHTNESS_STORAGE_KEY = 'tcd_scene_brightness';
const DEFAULT_BRIGHTNESS = 1.2;

function loadInitialBrightness(): number {
  try {
    const raw = window.localStorage.getItem(BRIGHTNESS_STORAGE_KEY);
    if (raw === null) return DEFAULT_BRIGHTNESS;
    const parsed = Number.parseFloat(raw);
    if (!Number.isFinite(parsed)) return DEFAULT_BRIGHTNESS;
    return Math.min(2.0, Math.max(0.5, parsed));
  } catch {
    return DEFAULT_BRIGHTNESS;
  }
}

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [brightness, setBrightness] = useState<number>(loadInitialBrightness);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [focusTarget, setFocusTarget] = useState<FocusTarget>('none');
  const [voiceState, setVoiceState] = useState<InnerVoiceState>({ kind: 'wakeup' });
  const [subtitleLagging, setSubtitleLagging] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [lastInteractionTick, setLastInteractionTick] = useState<number>(0);

  const [propClickCounts, setPropClickCounts] = useState<Record<V2PropId, number>>({
    prop_glass: 0,
    prop_lunchbox: 0,
    prop_mug: 0,
    polaroid: 0,
  });

  const [isDeskLampOn, setIsDeskLampOn] = useState<boolean>(true);
  const [hoveredPropLabel, setHoveredPropLabel] = useState<string | null>(null);

  const screenOverlayRef = useRef<HTMLDivElement>(null);
  const peelTimersRef = useRef<number[]>([]);

  const bundle = getNarrativeBundle(lang);
  const { v2_2_3, v2_4_5 } = bundle;

  // Derived explicit narrative flags
  const isEndingAFullyRestored =
    gameState.endingChoice === 'A' && gameState.endingARedacted.length === 3;
  const isEffectiveLensBroken =
    (gameState.lensBroken || gameState.actStage >= 3) && !isEndingAFullyRestored;
  const isPhase2Doubt =
    !isEffectiveLensBroken &&
    (gameState.isPhase2Doubt || gameState.actStage === 2);

  const bumpInteraction = useCallback(() => {
    setLastInteractionTick((t) => t + 1);
  }, []);

  const toggleLanguage = useCallback(() => {
    bumpInteraction();
    setLang((prev) => (prev === 'zh' ? 'en' : 'zh'));
  }, [bumpInteraction]);

  // Persist scene brightness
  useEffect(() => {
    try {
      window.localStorage.setItem(BRIGHTNESS_STORAGE_KEY, brightness.toFixed(2));
    } catch {
      // ignore storage errors
    }
  }, [brightness]);

  // Clear world prop hover preview when entering focused inspection
  useEffect(() => {
    if (focusTarget !== 'none') {
      setHoveredPropLabel(null);
    }
  }, [focusTarget]);

  // Live session uptime counter for C:\302 and AUDIT_302 fourth-wall telemetry
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSessionSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Cleanup Branch B peel timers on unmount
  useEffect(() => {
    return () => {
      peelTimersRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // Developer Stage Switcher (Jump directly to Act 1 / 2 / 3 / 4)
  const handleJumpActStage = useCallback(
    (stage: ActStage) => {
      bumpInteraction();
      peelTimersRef.current.forEach((t) => window.clearTimeout(t));
      peelTimersRef.current = [];

      if (stage >= 3) {
        soundEngine.playLensBreak();
      } else {
        soundEngine.playKeyClick();
      }

      setGameState((prev) => ({
        ...prev,
        actStage: stage,
        isPhase2Doubt: stage === 2,
        lensBroken: stage >= 3,
        resignationRejected: stage === 4 ? true : false,
        endingChoice: null,
        endingARedacted: [],
        endingBSelection: null,
        peelStage: 0,
      }));

      if (stage === 4) {
        setFocusTarget('monitor');
      }

      setVoiceState({
        kind: 'custom',
        textZh:
          stage === 1
            ? '已切换至第一幕：常规夜班值守。点击 CRT 显示器进入 TCD-OS。'
            : stage === 2
            ? '已切换至第二幕：文档异变与配件异常已激活。'
            : stage === 3
            ? '已切换至第三幕：认知滤镜碎裂，迪斯科彩灯与童话桌面已激活。'
            : '已切换至第四幕：AUDIT_302.EXE 强制身份核验已启动。',
        textEn:
          stage === 1
            ? 'Switched to Act 1: Routine Night Shift. Click CRT to enter TCD-OS.'
            : stage === 2
            ? 'Switched to Act 2: Subtle document drift & accessories anomalies active.'
            : stage === 3
            ? 'Switched to Act 3: Lens shattered — disco lights & pastel desktop active.'
            : 'Switched to Act 4: AUDIT_302.EXE mandatory identity interrogation active.',
        sourceZh: `DEV // ACT 0${stage}`,
        sourceEn: `DEV // ACT 0${stage}`,
      });
    },
    [bumpInteraction]
  );

  // Global Keyboard Shortcuts: ESC to step back from monitor/prop, Alt+1..4 for Dev Stage Switcher
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusTarget !== 'none') {
        e.preventDefault();
        soundEngine.playPaperRustle();
        setFocusTarget('none');
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          handleJumpActStage(1);
        } else if (e.key === '2') {
          e.preventDefault();
          handleJumpActStage(2);
        } else if (e.key === '3') {
          e.preventDefault();
          handleJumpActStage(3);
        } else if (e.key === '4') {
          e.preventDefault();
          handleJumpActStage(4);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusTarget, handleJumpActStage]);

  // Idle Banter Timer (25–35s of inactivity when resting on desk)
  useEffect(() => {
    if (isEffectiveLensBroken || focusTarget !== 'none') {
      return;
    }

    const delayMs = 25000 + Math.floor(Math.random() * 10000);
    const timer = window.setTimeout(() => {
      const pool = v2_2_3.asset1.randomIdleBanter;
      const candidates = pool
        .map((_, idx) => idx)
        .filter((idx) => idx !== gameState.lastIdleBanterIndex);
      const chosenIndex =
        candidates[Math.floor(Math.random() * candidates.length)] ?? 0;

      setGameState((prev) => ({
        ...prev,
        lastIdleBanterIndex: chosenIndex,
      }));
      setVoiceState({ kind: 'idle_banter', index: chosenIndex });
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [
    lastInteractionTick,
    gameState.lastIdleBanterIndex,
    isEffectiveLensBroken,
    focusTarget,
    v2_2_3.asset1.randomIdleBanter,
  ]);

  // Resolve localized single-line subtitle text & source tag
  const resolveInnerVoice = (): { text: string; source: string } => {
    const a1 = v2_2_3.asset1;

    switch (voiceState.kind) {
      case 'wakeup':
        return {
          text:
            lang === 'zh'
              ? '又是地下 B 区的夜班。点击显示器打开 TCD-OS，看看 Arthur 的交班通告吧。'
              : 'Another night shift in Sector B. Click the CRT monitor to check the shift notice.',
          source: lang === 'zh' ? '工位 #302' : 'DESK #302',
        };
      case 'monitor_hint':
        return {
          text:
            lang === 'zh'
              ? '点击 CRT 显示器屏幕即可拉近进入 TCD-OS v1.84 工作站。'
              : 'Click the CRT monitor screen to zoom into TCD-OS v1.84.',
          source: lang === 'zh' ? 'TCD-OS v1.84' : 'TCD-OS v1.84',
        };
      case 'desk_file_phase2':
        return {
          text:
            lang === 'zh'
              ? `纸质卷宗（${voiceState.fileId.toUpperCase()}）将在实体工作台阶段展开核验，先点击电脑查看内网与日常文档。`
              : `Physical dossier (${voiceState.fileId.toUpperCase()}) belongs on the desk workbench—click the CRT monitor first.`,
          source: lang === 'zh' ? '桌面卷宗' : 'DESK DOSSIER',
        };
      case 'idle_banter':
        return {
          text: a1.randomIdleBanter[voiceState.index] ?? a1.randomIdleBanter[0],
          source: lang === 'zh' ? '工位随想' : 'IDLE THOUGHT',
        };
      case 'custom':
        return {
          text: lang === 'zh' ? voiceState.textZh : voiceState.textEn,
          source: lang === 'zh' ? voiceState.sourceZh : voiceState.sourceEn,
        };
      case 'direct':
        return {
          text: voiceState.text,
          source: voiceState.source,
        };
      case 'prop': {
        const propItem =
          v2_4_5.asset4_props.find((p) => p.id === voiceState.id) ??
          v2_4_5.asset4_props[0];
        if (voiceState.stage === 3) {
          const lines = propItem.phase3_disco.subtitleLines;
          return {
            text: lines[voiceState.lineIndex % lines.length],
            source: propItem.phase3_disco.corruptedSourceTag,
          };
        }
        if (voiceState.stage === 2) {
          return {
            text: propItem.phase2_doubt.subtitle,
            source: propItem.title,
          };
        }
        const lines = propItem.phase1_routine.subtitleLines;
        return {
          text: lines[voiceState.lineIndex % lines.length],
          source: propItem.title,
        };
      }
      case 'resign': {
        const pool =
          voiceState.stage === 0
            ? v2_4_5.asset5_resignation.stage0_mundane
            : voiceState.stage === 1
            ? v2_4_5.asset5_resignation.stage1_deflection
            : v2_4_5.asset5_resignation.stage2_viscous;
        return {
          text: pool[voiceState.index] ?? pool[0],
          source: lang === 'zh' ? '人事自助' : 'HR PORTAL',
        };
      }
      case 'longpress_stage':
        return {
          text: v2_4_5.asset5_resignation.longPressStages[voiceState.stage],
          source: lang === 'zh' ? '注销阻力' : 'TERMINATION LOCK',
        };
      case 'rejected':
        return {
          text: v2_4_5.asset5_resignation.protagonistRealization,
          source: 'ERR_CABINET_LOCK',
        };
      case 'endingA_step': {
        const found = v2_4_5.asset6_endings.endingA.activeRedactionLines.find(
          (l) => l.id === voiceState.id
        );
        return {
          text: found?.onRedactSubtitle ?? '',
          source: lang === 'zh' ? '协议 A // 修复' : 'PROTOCOL A // CONTAIN',
        };
      }
      case 'endingA_final':
        return {
          text: v2_4_5.asset6_endings.endingA.finalSubtitle,
          source: lang === 'zh' ? 'DAY 1,096 // #302' : 'DAY 1,096 // #302',
        };
      case 'endingB_final':
        return {
          text: v2_4_5.asset6_endings.endingB.finalSubtitle,
          source: 'CABINET_03_MERGER',
        };
    }
  };

  const { text: innerVoiceText, source: innerVoiceSource } = resolveInnerVoice();

  // Dual-Track Agency Helpers (idempotent per key)
  const handleDiscoverAnomaly = useCallback(
    (key: string, subtitle?: string) => {
      bumpInteraction();
      setGameState((prev) => {
        if (prev.discoveredAnomalies.includes(key)) return prev;
        return {
          ...prev,
          awarenessScore: prev.awarenessScore + 1,
          discoveredAnomalies: [...prev.discoveredAnomalies, key],
        };
      });
      if (subtitle) {
        setVoiceState({
          kind: 'direct',
          text: subtitle,
          source: lang === 'zh' ? '系统异常' : 'ANOMALY',
        });
      }
    },
    [bumpInteraction, lang]
  );

  const handleBumpCompliance = useCallback(
    (key: string, amount = 1) => {
      bumpInteraction();
      setGameState((prev) => {
        if (prev.discoveredAnomalies.includes(key)) return prev;
        return {
          ...prev,
          complianceScore: prev.complianceScore + amount,
          discoveredAnomalies: [...prev.discoveredAnomalies, key],
        };
      });
    },
    [bumpInteraction]
  );

  // Institutional Green 3-Tier Cabinet Drawer Handlers
  const handleToggleDrawer = useCallback(
    (index: 0 | 1 | 2) => {
      bumpInteraction();
      if (gameState.drawerLocks[index]) return;
      const nextOpen = !gameState.openDrawers[index];
      soundEngine.playDrawerSlide(nextOpen);
      setGameState((prev) => {
        const nextArr: [boolean, boolean, boolean] = [...prev.openDrawers] as [
          boolean,
          boolean,
          boolean,
        ];
        nextArr[index] = nextOpen;
        return { ...prev, openDrawers: nextArr };
      });
      setVoiceState({
        kind: 'custom',
        textZh: nextOpen
          ? '抽屉滑轨有点生锈，里面放着几叠备用的牛皮纸档案卷宗。'
          : '顺手把铁皮抽屉推回原位。',
        textEn: nextOpen
          ? 'The steel runner grates slightly. Several backup manila folders sit inside.'
          : 'Pushed the steel drawer back flush.',
        sourceZh: '绿色铁皮柜 #01-A',
        sourceEn: 'CABINET #01-A',
      });
    },
    [bumpInteraction, gameState.drawerLocks, gameState.openDrawers]
  );

  const handleLockedDrawerRattle = useCallback(
    (index: 1 | 2) => {
      bumpInteraction();
      soundEngine.playLockRattle();
      const drawerCode = index === 1 ? '#02-B' : '#03-C';
      setGameState((prev) => {
        const key = `locked_drawer_${index}_act${prev.actStage}`;
        const bump =
          prev.actStage >= 2 && !prev.discoveredAnomalies.includes(key);
        return {
          ...prev,
          awarenessScore: prev.awarenessScore + (bump ? 1 : 0),
          discoveredAnomalies: bump
            ? [...prev.discoveredAnomalies, key]
            : prev.discoveredAnomalies,
        };
      });
      setVoiceState({
        kind: 'custom',
        textZh:
          isEffectiveLensBroken && index === 2
            ? '铜锁纹丝不动，但铁皮门缝里却透出一股像烘干棉被一样暖烘烘的纸味。'
            : `${drawerCode} 抽屉锁着，需要对应的三位密码或钥匙才能拉开。`,
        textEn:
          isEffectiveLensBroken && index === 2
            ? 'The brass cylinder stays shut, yet a dry, cozy warmth radiates through the steel seam.'
            : `Drawer ${drawerCode} is locked. A keycode is required to open it.`,
        sourceZh: `铁皮柜 ${drawerCode}`,
        sourceEn: `CABINET ${drawerCode}`,
      });
    },
    [bumpInteraction, isEffectiveLensBroken]
  );

  const handleInspectDrawerFolder = useCallback(
    (fileId: DeskFileId) => {
      bumpInteraction();
      soundEngine.playDossierDeliver();
      setGameState((prev) => ({
        ...prev,
        activeDeskFiles: prev.activeDeskFiles.includes(fileId)
          ? prev.activeDeskFiles
          : [...prev.activeDeskFiles, fileId],
      }));
      setVoiceState({
        kind: 'custom',
        textZh: '把抽屉里的备用审计卷宗抽出来放到桌面上了，稍后在工作台核对。',
        textEn:
          'Pulled the backup audit folder from the drawer onto the desk for review.',
        sourceZh: '档案抽屉 #01-A',
        sourceEn: 'DRAWER #01-A',
      });
    },
    [bumpInteraction]
  );

  // Desktop Low-Poly Cassette Tape Recorder Handler
  const handleToggleTape = useCallback(() => {
    bumpInteraction();
    const nextPlaying = !gameState.isTapePlaying;
    soundEngine.playTapeMechanism(nextPlaying);
    setGameState((prev) => {
      const key = `tape_play_act${prev.actStage}`;
      const bump =
        nextPlaying &&
        prev.actStage >= 2 &&
        !prev.discoveredAnomalies.includes(key);
      return {
        ...prev,
        isTapePlaying: nextPlaying,
        awarenessScore: prev.awarenessScore + (bump ? 1 : 0),
        discoveredAnomalies: bump
          ? [...prev.discoveredAnomalies, key]
          : prev.discoveredAnomalies,
      };
    });

    if (!nextPlaying) {
      setVoiceState({
        kind: 'custom',
        textZh: '按下停止键，磁带轮盘停了下来。地下室又只剩下日光灯的微响。',
        textEn:
          'Pressed STOP. The cassette reels halt, leaving only the fluorescent hum.',
        sourceZh: '磁带录音机',
        sourceEn: 'TAPE RECORDER',
      });
      return;
    }

    setVoiceState({
      kind: 'custom',
      textZh: isEffectiveLensBroken
        ? '磁带里循环播放着柔和的八音盒生日歌……背景却夹杂着铁皮内侧的三声指节叩击。'
        : isPhase2Doubt
        ? 'Arthur 的交班口述放着放着突然跳成沙沙白噪，报时录音反复卡在“第1095天”。'
        : '磁带里传来 Arthur 昨夜的交班口述：“……茶水间锅炉周四检修，别忘了喝热咖啡。”',
      textEn: isEffectiveLensBroken
        ? 'A cheerful music-box birthday tune loops softly... cut by three muffled knocks inside steel.'
        : isPhase2Doubt
        ? 'Arthur’s dictation dissolves into hiss, looping the timestamp: "Shift Day 1,095."'
        : 'Arthur’s voice plays off the cassette: "...Pantry boiler maintenance Thursday. Drink your coffee warm."',
      sourceZh: 'TCD-REC 84',
      sourceEn: 'TCD-REC 84',
    });
  }, [
    bumpInteraction,
    gameState.isTapePlaying,
    isEffectiveLensBroken,
    isPhase2Doubt,
  ]);

  // Cabinet-Top Withered Plant Handler
  const handleInspectPlant = useCallback(() => {
    bumpInteraction();
    soundEngine.playPaperRustle();
    setGameState((prev) => {
      const key = `plant_inspect_act${prev.actStage}`;
      const bump =
        prev.actStage >= 2 && !prev.discoveredAnomalies.includes(key);
      return {
        ...prev,
        awarenessScore: prev.awarenessScore + (bump ? 1 : 0),
        discoveredAnomalies: bump
          ? [...prev.discoveredAnomalies, key]
          : prev.discoveredAnomalies,
      };
    });
    setVoiceState({
      kind: 'custom',
      textZh: isEffectiveLensBroken
        ? '这盆一直蔫掉的绿植不知什么时候开满了艳红和粉色的纸花……地下室连太阳都没有，怎么会开得这么欢喜？'
        : isPhase2Doubt
        ? '枯黄的叶片一碰就碎成灰白纸屑，花盆土里好像插着半截生锈的订书钉。'
        : '柜顶那盆没人浇水的绿植已经彻底枯黄了，干巴巴地耷拉在陶土盆沿。',
      textEn: isEffectiveLensBroken
        ? 'That dead office plant is suddenly bursting with bright pink and crimson blossoms... with zero sunlight down here.'
        : isPhase2Doubt
        ? 'Dry leaves crumble into pale paper flakes at a touch, and a rusted staple pokes from the soil.'
        : 'The neglected potted plant on the cabinet has completely dried out and drooped over the clay rim.',
      sourceZh: isEffectiveLensBroken ? '窗台幻象 // 盆栽' : '柜顶盆栽',
      sourceEn: isEffectiveLensBroken ? 'BLOOMING PLANT' : 'POTTED PLANT',
    });
  }, [bumpInteraction, isEffectiveLensBroken, isPhase2Doubt]);

  // Focused Left-Rear Vintage Desk Lamp Toggle
  const handleToggleDeskLamp = useCallback(() => {
    bumpInteraction();
    soundEngine.playKeyClick();
    setIsDeskLampOn((prev) => {
      const next = !prev;
      setVoiceState({
        kind: 'custom',
        textZh: next
          ? '拨动金属台灯开关，暖黄的光圈重新照亮了桌角的手册、铝制饭盒和泛黄便签。'
          : '关掉了桌角的台灯，只有头顶冷白日光灯和 CRT 屏幕余光照着桌面。',
        textEn: next
          ? 'Clicked the vintage desk lamp back on—a warm pool of light settles over the manual, lunchbox, and corner notes.'
          : 'Switched the corner desk lamp off, leaving the cold overhead fluorescent and CRT glow.',
        sourceZh: '旧式金属台灯',
        sourceEn: 'DESK LAMP',
      });
      return next;
    });
  }, [bumpInteraction]);

  // Repeating 11/13 Desk Calendar Inspection
  const handleInspectCalendar = useCallback(() => {
    bumpInteraction();
    soundEngine.playPaperRustle();
    setGameState((prev) => {
      const key = `calendar_1113_act${prev.actStage}`;
      const bump = !prev.discoveredAnomalies.includes(key);
      return {
        ...prev,
        awarenessScore: prev.awarenessScore + (bump ? 1 : 0),
        discoveredAnomalies: bump
          ? [...prev.discoveredAnomalies, key]
          : prev.discoveredAnomalies,
      };
    });
    setVoiceState({
      kind: 'custom',
      textZh: isEffectiveLensBroken
        ? '台历的纸页已经发脆，密密麻麻划掉的红笔圆圈全都圈在同一个“11/13”上……今天到底过完了没有？'
        : isPhase2Doubt
        ? '翻了翻桌角的小台历，前几页和后几页手写的日期怎么全都是被红笔反复划掉的“11/13”？'
        : '桌角的小台历标着 11 月 13 日，前头几格被前任用红笔画了不少叉，大概是排班记事。',
      textEn: isEffectiveLensBroken
        ? 'The desk calendar pages feel brittle—every single crossed-out box in red ink lands on the same date: 11/13.'
        : isPhase2Doubt
        ? 'Checked the corner desk calendar: page after page has handwritten "11/13" crossed out over and over in red ink.'
        : 'A small corner desk calendar reads Nov 13, with several boxes crossed out by the previous clerk.',
      sourceZh: '桌角小台历 // 11/13',
      sourceEn: 'DESK CALENDAR // 11/13',
    });
  }, [bumpInteraction, isEffectiveLensBroken, isPhase2Doubt]);

  // Focus Selection on 3D Desk
  const handleSelectFocus = (target: FocusTarget) => {
    bumpInteraction();
    if (target !== 'none') {
      setHoveredPropLabel(null);
    }
    setFocusTarget(target);

    if (target === 'monitor') {
      soundEngine.playKeyClick();
      return;
    }

    if (target !== 'none') {
      soundEngine.playPaperRustle();
    }

    if (
      target === 'prop_lunchbox' ||
      target === 'prop_mug' ||
      target === 'partition' ||
      target === 'polaroid'
    ) {
      const propId: V2PropId = target === 'partition' ? 'prop_glass' : target;
      const currentCount = propClickCounts[propId] ?? 0;

      setPropClickCounts((prev) => ({
        ...prev,
        [propId]: currentCount + 1,
      }));

      if (isPhase2Doubt) {
        setSubtitleLagging(true);
        window.setTimeout(() => setSubtitleLagging(false), 180);
      }

      const stage: 1 | 2 | 3 = isEffectiveLensBroken
        ? 3
        : isPhase2Doubt
        ? 2
        : 1;

      setGameState((prev) => {
        const nextInspected = prev.inspectedProps.includes(propId)
          ? prev.inspectedProps
          : [...prev.inspectedProps, propId];

        const nextPhase2 =
          stage === 2 && !prev.phase2PropsInspected.includes(propId)
            ? [...prev.phase2PropsInspected, propId]
            : prev.phase2PropsInspected;

        const nextPhase3 =
          stage === 3 && !prev.phase3PropsInspected.includes(propId)
            ? [...prev.phase3PropsInspected, propId]
            : prev.phase3PropsInspected;

        const anomalyKey = `prop_${propId}_s${stage}`;
        const bumpAware =
          stage >= 2 && !prev.discoveredAnomalies.includes(anomalyKey);

        return {
          ...prev,
          inspectedProps: nextInspected,
          phase2PropsInspected: nextPhase2,
          phase3PropsInspected: nextPhase3,
          awarenessScore: prev.awarenessScore + (bumpAware ? 1 : 0),
          discoveredAnomalies: bumpAware
            ? [...prev.discoveredAnomalies, anomalyKey]
            : prev.discoveredAnomalies,
        };
      });

      setVoiceState({
        kind: 'prop',
        id: propId,
        stage,
        lineIndex: currentCount,
      });
    }
  };

  // Intranet Shift Handover Acknowledgement
  const handleAcknowledgeShift = () => {
    bumpInteraction();
    setGameState((prev) => ({
      ...prev,
      shiftNoticeAcknowledged: true,
      complianceScore: prev.shiftNoticeAcknowledged
        ? prev.complianceScore
        : prev.complianceScore + 1,
    }));
    setVoiceState({
      kind: 'custom',
      textZh: '交班通告已签收。Arthur 的工位就隔着一块磨砂玻璃，台灯还亮着。',
      textEn:
        'Shift handover acknowledged. Arthur’s lamp is still glowing behind the frosted partition.',
      sourceZh: 'INTRANET.EXE',
      sourceEn: 'INTRANET.EXE',
    });
  };

  // Pre-Broken Resignation Attempt inside INTRANET.EXE (Act 1 & Act 2)
  const handleResignAttemptPreBroken = (stage: 0 | 1 | 2) => {
    bumpInteraction();
    const pool =
      stage === 0
        ? v2_4_5.asset5_resignation.stage0_mundane
        : stage === 1
        ? v2_4_5.asset5_resignation.stage1_deflection
        : v2_4_5.asset5_resignation.stage2_viscous;

    const candidates = pool
      .map((_, idx) => idx)
      .filter((idx) => idx !== gameState.lastResignQuoteIndex);
    const chosenIndex =
      candidates[Math.floor(Math.random() * candidates.length)] ?? 0;

    soundEngine.playKeyClick();
    setGameState((prev) => {
      const key = `resign_try_act${prev.actStage}`;
      const isNew = !prev.discoveredAnomalies.includes(key);
      return {
        ...prev,
        lastResignQuoteIndex: chosenIndex,
        awarenessScore: prev.awarenessScore + (isNew ? 1 : 0),
        discoveredAnomalies: isNew
          ? [...prev.discoveredAnomalies, key]
          : prev.discoveredAnomalies,
      };
    });
    setVoiceState({ kind: 'resign', stage, index: chosenIndex });

    const stageLabel =
      lang === 'zh'
        ? `ACT 0${gameState.actStage} // 审批暂缓`
        : `ACT 0${gameState.actStage} // DEFERRED`;

    return { quote: pool[chosenIndex] ?? pool[0], stageLabel };
  };

  // Act 3 Hold-to-Resign Callbacks
  const handleLongPressStageHint = (
    stage: 'pct25' | 'pct55' | 'pct75_rebound'
  ) => {
    bumpInteraction();
    setVoiceState({ kind: 'longpress_stage', stage });
  };

  const handleCompleteLongPressResign = () => {
    bumpInteraction();
    setGameState((prev) => ({
      ...prev,
      resignationRejected: true,
    }));
    setVoiceState({ kind: 'rejected' });
  };

  // Transition into Act 4 (AUDIT_302.EXE auto-launches)
  const handleLaunchAudit = () => {
    bumpInteraction();
    setGameState((prev) => ({
      ...prev,
      actStage: 4,
      lensBroken: true,
      resignationRejected: true,
    }));
    setFocusTarget('monitor');
    setVoiceState({
      kind: 'custom',
      textZh: 'AUDIT_302.EXE 已接管终端。它正在问我究竟是谁。',
      textEn: 'AUDIT_302.EXE has taken over the terminal. It is asking who I am.',
      sourceZh: 'AUDIT_302.EXE',
      sourceEn: 'AUDIT_302.EXE',
    });
  };

  // Trigger Branch B 3-Stage OS Skin Peeling (peelStage 0 -> 1 -> 2 -> 3)
  const triggerBranchBPeelSequence = (selection: 'E' | 'F') => {
    peelTimersRef.current.forEach((t) => window.clearTimeout(t));
    peelTimersRef.current = [];

    setGameState((prev) => ({
      ...prev,
      endingChoice: 'B',
      endingBSelection: selection,
      peelStage: 0,
    }));
    setVoiceState({ kind: 'endingB_final' });

    const t1 = window.setTimeout(() => {
      soundEngine.playGlitch();
      setGameState((prev) => ({ ...prev, peelStage: 1 }));
    }, 320);
    const t2 = window.setTimeout(() => {
      soundEngine.playPaperRustle();
      setGameState((prev) => ({ ...prev, peelStage: 2 }));
    }, 950);
    const t3 = window.setTimeout(() => {
      soundEngine.playGlitch();
      setGameState((prev) => ({ ...prev, peelStage: 3 }));
    }, 1650);

    peelTimersRef.current = [t1, t2, t3];
  };

  // AUDIT_302.EXE Option Selection (A/B/C/D -> Branch A; E/F -> Branch B)
  const handleSelectAuditOption = (option: AuditOptionId) => {
    bumpInteraction();
    if (option === 'E') {
      triggerBranchBPeelSequence('E');
      return;
    }
    if (option === 'F') {
      triggerBranchBPeelSequence('F');
      return;
    }

    // A, B, C, or D -> Branch A (Active 3-line redaction to restore warm loop)
    setGameState((prev) => ({
      ...prev,
      endingChoice: 'A',
      endingARedacted: [],
      peelStage: 0,
    }));
    setVoiceState({
      kind: 'custom',
      textZh: '选择已归档。请亲手涂黑最后三条异常记录，恢复正常班次。',
      textEn:
        'Identity logged. Redact the final three anomalous lines to restore your normal shift.',
      sourceZh: '协议 A // 修复',
      sourceEn: 'PROTOCOL A // CONTAIN',
    });
  };

  // Branch A Active Redaction (Extinguishes 3D Disco Lights Magenta -> Cyan -> Amber)
  const handleRedactEndingA = (id: EndingARedactId) => {
    bumpInteraction();
    if (gameState.endingARedacted.includes(id)) return;
    const nextRedacted = [...gameState.endingARedacted, id];
    setGameState((prev) => ({
      ...prev,
      endingARedacted: nextRedacted,
    }));
    if (nextRedacted.length === 3) {
      setVoiceState({ kind: 'endingA_final' });
    } else {
      setVoiceState({ kind: 'endingA_step', id });
    }
  };

  // Reset Full Loop back to Act 1
  const handleResetGame = () => {
    peelTimersRef.current.forEach((t) => window.clearTimeout(t));
    peelTimersRef.current = [];
    setGameState(INITIAL_GAME_STATE);
    setFocusTarget('none');
    setVoiceState({ kind: 'wakeup' });
    setPropClickCounts({
      prop_glass: 0,
      prop_lunchbox: 0,
      prop_mug: 0,
      polaroid: 0,
    });
  };

  return (
    <div
      className={`game-3d-root ${
        isEffectiveLensBroken ? 'theme-crimson-broken' : 'theme-sepia-archival'
      }`}
    >
      {/* Subtle 3% Film Grain & Soft Edge Vignette */}
      <div className="archival-grain-overlay" aria-hidden="true" />

      {/* Dimmed Backdrop when Holding a 3D Prop in Front of Camera */}
      {(focusTarget === 'prop_lunchbox' ||
        focusTarget === 'prop_mug' ||
        focusTarget === 'polaroid') && (
        <div
          className="prop-inspect-vignette"
          onClick={() => handleSelectFocus('none')}
          onContextMenu={(e) => {
            e.preventDefault();
            handleSelectFocus('none');
          }}
        />
      )}

      {/* Fullscreen First-Person 3D Low-Poly Office Desk Scene */}
      <DeskScene
        lang={lang}
        actStage={gameState.actStage}
        focusTarget={focusTarget}
        lensBroken={isEffectiveLensBroken}
        endingChoice={gameState.endingChoice}
        endingARedactedCount={
          gameState.endingChoice === 'A' ? gameState.endingARedacted.length : 0
        }
        brightness={brightness}
        drawerLocks={gameState.drawerLocks}
        openDrawers={gameState.openDrawers}
        isTapePlaying={gameState.isTapePlaying}
        isDeskLampOn={isDeskLampOn}
        activeDeskFiles={gameState.activeDeskFiles}
        screenOverlayRef={screenOverlayRef}
        onSelectFocus={handleSelectFocus}
        onDeskFileClick={(fileId) => {
          soundEngine.playPaperRustle();
          setVoiceState({ kind: 'desk_file_phase2', fileId });
        }}
        onToggleDrawer={handleToggleDrawer}
        onLockedDrawerRattle={handleLockedDrawerRattle}
        onInspectDrawerFolder={handleInspectDrawerFolder}
        onToggleTape={handleToggleTape}
        onInspectPlant={handleInspectPlant}
        onToggleDeskLamp={handleToggleDeskLamp}
        onInspectCalendar={handleInspectCalendar}
        onHoverPropChange={setHoveredPropLabel}
      />

      {/* Continuously Projected Live 3D-Aligned CRT Screen Hosting TCD-OS v1.84 */}
      <div
        ref={screenOverlayRef}
        className="crt-overlay-portal"
        style={{ opacity: 0, pointerEvents: 'none', visibility: 'hidden' }}
      >
        <TcdOsDesktop
          lang={lang}
          actStage={gameState.actStage}
          isEffectiveLensBroken={isEffectiveLensBroken}
          shiftNoticeAcknowledged={gameState.shiftNoticeAcknowledged}
          resignationRejected={gameState.resignationRejected}
          complianceScore={gameState.complianceScore}
          awarenessScore={gameState.awarenessScore}
          drawerLocks={gameState.drawerLocks}
          endingChoice={gameState.endingChoice}
          endingARedacted={gameState.endingARedacted}
          endingBSelection={gameState.endingBSelection}
          peelStage={gameState.peelStage}
          sessionSeconds={sessionSeconds}
          onToggleLang={toggleLanguage}
          onExitMonitor={() => handleSelectFocus('none')}
          onAcknowledgeShift={handleAcknowledgeShift}
          onResignAttemptPreBroken={handleResignAttemptPreBroken}
          onLongPressStageHint={handleLongPressStageHint}
          onCompleteLongPressResign={handleCompleteLongPressResign}
          onLaunchAudit={handleLaunchAudit}
          onSelectAuditOption={handleSelectAuditOption}
          onConfirmOptionFToBranchB={() => triggerBranchBPeelSequence('F')}
          onRedactEndingA={handleRedactEndingA}
          onDiscoverAnomaly={handleDiscoverAnomaly}
          onBumpCompliance={handleBumpCompliance}
          onEmitSubtitle={(text, source) =>
            setVoiceState({ kind: 'direct', text, source })
          }
          onJumpActStage={handleJumpActStage}
          onResetGame={handleResetGame}
        />
      </div>

      {/* Minimalist HUD: Hides Floating Panels in CRT Focus + Single Bottom-Edge Subtitle Line */}
      <SubtitleHUD
        lang={lang}
        actStage={gameState.actStage}
        focusTarget={focusTarget}
        lensBroken={isEffectiveLensBroken}
        endingARedactedCount={
          gameState.endingChoice === 'A' ? gameState.endingARedacted.length : 0
        }
        hoveredPropLabel={hoveredPropLabel}
        innerVoice={innerVoiceText}
        innerVoiceSource={innerVoiceSource}
        subtitleLagging={subtitleLagging}
        brightness={brightness}
        onChangeBrightness={setBrightness}
        onToggleLang={toggleLanguage}
        onExitFocus={() => handleSelectFocus('none')}
        onJumpActStage={handleJumpActStage}
      />
    </div>
  );
};

export default App;

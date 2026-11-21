export type ActStage = 1 | 2 | 3 | 4;

export type RedactTargetId =
  | 'f1_target1'
  | 'f1_target2'
  | 'f3_target1'
  | 'f4_target1'
  | 'f5_target1';

export type PropId = 'prop_lunchbox' | 'prop_mug' | 'prop_glass';
export type V2PropId = PropId | 'polaroid';
export type EndingARedactId = 'endA_1' | 'endA_2' | 'endA_3';
export type AuditOptionId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type DeskFileId =
  | 'manual'
  | 'file01'
  | 'file02'
  | 'file03'
  | 'file04'
  | 'file05';

export type OsAppId =
  | 'intranet'
  | 'mydocs'
  | 'pictures'
  | 'notepad'
  | 'calc'
  | 'recycle'
  | 'sysmon'
  | 'audit';

export type Language = 'zh' | 'en';

export type FocusTarget =
  | 'none'
  | 'monitor'
  | 'partition'
  | 'prop_lunchbox'
  | 'prop_mug'
  | 'polaroid';

export interface GameState {
  // Core narrative progression milestones (decoupled from raw redaction counts)
  actStage: ActStage;
  isPhase2Doubt: boolean;
  lensBroken: boolean;
  resignationRejected: boolean;
  endingChoice: 'A' | 'B' | null;
  endingARedacted: EndingARedactId[];
  endingBSelection: 'E' | 'F' | null;
  peelStage: 0 | 1 | 2 | 3;

  // Dual-track player agency (never soft-locks progression)
  complianceScore: number;
  awarenessScore: number;
  shiftNoticeAcknowledged: boolean;
  discoveredAnomalies: string[];

  // 3D Desk prop inspection tracking
  inspectedProps: V2PropId[];
  phase2PropsInspected: V2PropId[];
  phase3PropsInspected: V2PropId[];

  // Phase 2 extensibility interfaces (3-tier locked filing cabinet & physical workbench)
  drawerLocks: [boolean, boolean, boolean];
  unlockedDrawers: number[];
  openDrawers: [boolean, boolean, boolean];
  isTapePlaying: boolean;
  activeDeskFiles: DeskFileId[];

  // Quote de-duplication
  lastResignQuoteIndex: number;
  lastIdleBanterIndex: number;
}

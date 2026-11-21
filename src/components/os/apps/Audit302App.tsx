import React, { useEffect, useState } from 'react';
import { getNarrativeBundle } from '../../../data/narrativeAssets';
import {
  AuditOptionId,
  EndingARedactId,
  Language,
} from '../../../types';
import { soundEngine } from '../../../utils/soundEngine';
import { EvidenceArtwork } from '../../EvidenceArtwork';
import { AUDIT_OPTIONS } from '../osData';

interface Audit302AppProps {
  lang: Language;
  complianceScore: number;
  awarenessScore: number;
  sessionSeconds: number;
  endingChoice: 'A' | 'B' | null;
  endingARedacted: EndingARedactId[];
  endingBSelection: 'E' | 'F' | null;
  onSelectAuditOption: (option: AuditOptionId) => void;
  onConfirmOptionFToBranchB: () => void;
  onRedactEndingA: (id: EndingARedactId) => void;
  onResetGame: () => void;
}

export const Audit302App: React.FC<Audit302AppProps> = ({
  lang,
  complianceScore,
  awarenessScore,
  sessionSeconds,
  endingChoice,
  endingARedacted,
  endingBSelection,
  onSelectAuditOption,
  onConfirmOptionFToBranchB,
  onRedactEndingA,
  onResetGame,
}) => {
  const { ui, v2_4_5 } = getNarrativeBundle(lang);
  const endings = v2_4_5.asset6_endings;

  // Pony Island Reactive UI:
  // 1) If complianceScore > awarenessScore: E and F are covered by thick black redaction bars;
  //    scratching/clicking 3 times peels the ink off!
  const isComplianceDominant = complianceScore > awarenessScore;
  const [scratches, setScratches] = useState<Record<'E' | 'F', number>>({
    E: 0,
    F: 0,
  });

  // 2) If awarenessScore >= complianceScore: hovering B or C makes them twitch away or error out
  const [twitchState, setTwitchState] = useState<
    Record<'B' | 'C', { dx: number; dy: number; errored: boolean }>
  >({
    B: { dx: 0, dy: 0, errored: false },
    C: { dx: 0, dy: 0, errored: false },
  });

  // Option F chilling fourth-wall follow-up step before launching Branch B peel
  const [pendingOptionF, setPendingOptionF] = useState<boolean>(false);

  useEffect(() => {
    if (endingChoice === null) {
      setPendingOptionF(false);
    }
  }, [endingChoice]);

  const handleScratchOrSelect = (id: AuditOptionId) => {
    if (isComplianceDominant && (id === 'E' || id === 'F')) {
      const current = scratches[id];
      if (current < 3) {
        const next = current + 1;
        setScratches((prev) => ({ ...prev, [id]: next }));
        if (next === 3) {
          soundEngine.playGlitch();
        } else {
          soundEngine.playPaperRustle();
        }
        return;
      }
    }

    if (id === 'F') {
      soundEngine.playGlitch();
      setPendingOptionF(true);
      return;
    }

    if (id === 'E') {
      soundEngine.playGlitch();
      onSelectAuditOption('E');
      return;
    }

    // A, B, C, D -> Branch A
    soundEngine.playStamp();
    onSelectAuditOption(id);
  };

  const handleAwareHover = (id: 'B' | 'C') => {
    if (isComplianceDominant) return;
    soundEngine.playGlitch();
    const dx = Math.round((Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 20));
    const dy = Math.round((Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 8));
    setTwitchState((prev) => ({
      ...prev,
      [id]: { dx, dy, errored: true },
    }));
  };

  /* ==========================================================================
     STATE 1: CHILLING FOURTH-WALL FOLLOW-UP FOR OPTION F ("NONE OF THE ABOVE")
     ========================================================================== */
  if (pendingOptionF && endingChoice === null) {
    const mins = String(Math.floor(sessionSeconds / 60)).padStart(2, '0');
    const secs = String(sessionSeconds % 60).padStart(2, '0');
    const resStr =
      typeof window !== 'undefined'
        ? `${window.innerWidth}×${window.innerHeight}`
        : '1280×720';

    return (
      <div className="os-audit os-audit-fourthwall">
        <div className="os-audit-header">
          <span>AUDIT_302.EXE // FOURTH-WALL OVERRIDE</span>
          <span>[INPUT SOURCE: EXTERNAL]</span>
        </div>

        <div className="os-fourthwall-body">
          <p className="os-fourthwall-lead">
            {lang === 'zh'
              ? '“以上均不是。”'
              : '"None of the Above."'}
          </p>
          <p className="os-fourthwall-text">
            {lang === 'zh'
              ? `系统已记录你的否决。那么请回答最后一个问题：此刻坐在 ${resStr} 屏幕外侧、已经凝视这座地下工位 ${mins}:${secs}、并握着鼠标替 #302 点击选项的人——你又是谁？`
              : `Denial logged. Then answer one final query: sitting outside this ${resStr} glass for ${mins}:${secs}, holding the mouse and clicking on behalf of #302 — who are YOU?`}
          </p>
          <p className="os-fourthwall-sub">
            {lang === 'zh'
              ? '既然你拒绝套用任何档案编号，3 号铁皮柜将为你卸下这层办公系统表皮。'
              : 'Since you refuse every file number, Cabinet #3 will now peel away this office skin.'}
          </p>

          <button
            type="button"
            className="os-retro-btn os-btn-danger"
            onClick={() => {
              soundEngine.playLensBreak();
              setPendingOptionF(false);
              onConfirmOptionFToBranchB();
            }}
          >
            {lang === 'zh'
              ? '[ 卸下系统表皮 · 直面 3 号柜底层索引 ]'
              : '[ PEEL OS SKIN · FACE CABINET #3 INDEX ]'}
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================================
     STATE 2: BRANCH A — ACTIVE 3-LINE REDACTION RESTORING NORMAL WARM LOOP
     ========================================================================== */
  if (endingChoice === 'A') {
    const allThreeRedacted = endingARedacted.length === 3;
    const pct = Math.round((endingARedacted.length / 3) * 100);
    const lastId = endingARedacted[endingARedacted.length - 1];
    const lastCue = endings.endingA.activeRedactionLines.find(
      (x) => x.id === lastId
    );

    return (
      <div className={`os-audit os-audit-branch-a restore-${endingARedacted.length}`}>
        <div className="os-audit-header">
          <span>{endings.endingA.branchName}</span>
          <span>{ui.filterRestoreMeter(pct, endingARedacted.length)}</span>
        </div>

        {!allThreeRedacted && (
          <div className="os-audit-prompt-strip">
            {endings.endingA.instruction}
          </div>
        )}

        {lastCue && !allThreeRedacted && (
          <div className="os-audit-cue-strip">{lastCue.onRedactLightCue}</div>
        )}

        <div className="os-branch-a-list">
          {endings.endingA.activeRedactionLines.map((item) => {
            const isRedacted = endingARedacted.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                className={`os-branch-a-row ${isRedacted ? 'redacted' : ''}`}
                disabled={isRedacted}
                onClick={() => {
                  soundEngine.playStamp();
                  onRedactEndingA(item.id);
                }}
              >
                <div className="os-branch-a-meta">
                  <span>{ui.targetIdPrefix + item.id}</span>
                  <span>
                    {isRedacted ? ui.stampNormalized : ui.clickToRedactTruth}
                  </span>
                </div>
                <div className="os-branch-a-text-wrap">
                  <span>{item.text}</span>
                  {isRedacted && (
                    <span className="os-branch-a-ink">{ui.stampNormalized}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {allThreeRedacted && (
          <div className="os-branch-a-complete">
            <div className="os-branch-a-grid">
              <EvidenceArtwork
                type="Photo_Initial"
                lang={lang}
                caption={ui.endingAPhotoRestoredCaption}
              />
              <div className="os-branch-a-final-text">
                <div className="os-sys-ok">{endings.endingA.systemHeader}</div>
                <blockquote>{endings.endingA.finalMonologue}</blockquote>
                <div className="os-new-shift-line">
                  {endings.endingA.newFilePrompt}
                </div>
                <p className="os-epilogue">{endings.endingA.epilogueNote}</p>
                <button
                  type="button"
                  className="os-retro-btn os-btn-primary"
                  onClick={() => {
                    soundEngine.playKeyClick();
                    onResetGame();
                  }}
                >
                  {endings.endingA.replayButton}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ==========================================================================
     STATE 3: BRANCH B IS HANDLED BY FULL-SCREEN OS SKIN PEEL IN TcdOsDesktop
     ========================================================================== */
  if (endingChoice === 'B') {
    return (
      <div className="os-audit os-audit-peeling">
        <div className="os-audit-header">
          <span>AUDIT_302.EXE // UNMOUNTING SHELL</span>
          <span>[{endingBSelection === 'F' ? 'EXTERNAL_OBSERVER' : 'ANOMALY'}]</span>
        </div>
        <p className="os-fourthwall-text">
          {lang === 'zh'
            ? '正在剥离 TCD-OS v1.84 图形表皮……'
            : 'UNMOUNTING TCD-OS v1.84 GRAPHICAL SHELL...'}
        </p>
      </div>
    );
  }

  /* ==========================================================================
     STATE 0: MANDATORY IDENTITY INTERROGATION ("QUERY: WHO ARE YOU?")
     ========================================================================== */
  return (
    <div className="os-audit">
      <div className="os-audit-header">
        <span>AUDIT_302.EXE // MANDATORY IDENTITY VERIFICATION</span>
        <span>[NODE: #302 // UNVERIFIED]</span>
      </div>

      <div className="os-audit-log">
        <div>
          {lang === 'zh'
            ? '> 检测到工位 #302 认知滤镜已失效。自动启动强制身份核验。'
            : '> WORKSTATION #302 COGNITIVE FILTER LOST. INITIATING IDENTITY AUDIT.'}
        </div>
        <div className="os-audit-query">
          {lang === 'zh' ? '问题：你是谁？' : 'QUERY: WHO ARE YOU?'}
        </div>
        <div className="os-audit-hint">
          {isComplianceDominant
            ? lang === 'zh'
              ? '[顺从协议生效：异常选项已被碳黑墨条封存——反复刮擦可剥落]'
              : '[COMPLIANCE MODE: ANOMALOUS OPTIONS REDACTED — CLICK 3× TO SCRATCH INK]'
            : lang === 'zh'
            ? '[觉醒度溢出：部分虚假雇佣选项正出现排斥抖动]'
            : '[AWARENESS HIGH: PURGED EMPLOYMENT RECORDS UNSTABLE]'}
        </div>
      </div>

      <div className="os-audit-options">
        {AUDIT_OPTIONS.map((opt) => {
          const isRedactedOption =
            isComplianceDominant &&
            (opt.id === 'E' || opt.id === 'F') &&
            scratches[opt.id] < 3;

          const scratchCount =
            opt.id === 'E' || opt.id === 'F' ? scratches[opt.id] : 0;

          const isTwitchTarget =
            !isComplianceDominant && (opt.id === 'B' || opt.id === 'C');
          const twitch =
            opt.id === 'B' || opt.id === 'C' ? twitchState[opt.id] : null;

          return (
            <button
              key={opt.id}
              type="button"
              className={`os-audit-opt-btn ${
                isRedactedOption ? `opt-redacted scratch-${scratchCount}` : ''
              } ${twitch?.errored ? 'opt-purged-err' : ''}`}
              style={
                isTwitchTarget && twitch
                  ? { transform: `translate(${twitch.dx}px, ${twitch.dy}px)` }
                  : undefined
              }
              onMouseEnter={() => {
                if (opt.id === 'B' || opt.id === 'C') {
                  handleAwareHover(opt.id);
                }
              }}
              onClick={() => handleScratchOrSelect(opt.id)}
            >
              <span className="os-opt-code">{opt.id}.</span>

              {isRedactedOption ? (
                <span className="os-opt-redacted-bar">
                  <span className="os-ink-blocks">
                    {scratchCount === 0
                      ? '████████████████████████'
                      : scratchCount === 1
                      ? '████▓▓██████▓▓██████████'
                      : '▓▓░██░░▓▓██░░░██▓▓░░'}
                  </span>
                  <span className="os-scratch-badge">
                    {lang === 'zh'
                      ? `[点击刮除墨迹 ${scratchCount}/3]`
                      : `[SCRATCH INK ${scratchCount}/3]`}
                  </span>
                </span>
              ) : (
                <span className="os-opt-label">
                  {lang === 'zh' ? opt.labelZh : opt.labelEn}
                  {twitch?.errored && (
                    <span className="os-purged-tag">
                      {lang === 'zh'
                        ? ' [RECORD PURGED 3 YEARS AGO / 三年前已注销]'
                        : ' [RECORD PURGED 3 YEARS AGO]'}
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

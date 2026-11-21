import React, { useEffect, useRef, useState } from 'react';
import { getNarrativeBundle } from '../../../data/narrativeAssets';
import { ActStage, Language } from '../../../types';
import { soundEngine } from '../../../utils/soundEngine';

interface IntranetAppProps {
  lang: Language;
  actStage: ActStage;
  isEffectiveLensBroken: boolean;
  shiftNoticeAcknowledged: boolean;
  resignationRejected: boolean;
  onAcknowledgeShift: () => void;
  onResignAttemptPreBroken: (stage: 0 | 1 | 2) => { quote: string; stageLabel: string };
  onLongPressStageHint: (stage: 'pct25' | 'pct55' | 'pct75_rebound') => void;
  onCompleteLongPressResign: () => void;
  onLaunchAudit: () => void;
  onBumpAwareness: (key: string, amount?: number) => void;
  onBumpCompliance: (key: string, amount?: number) => void;
  onEmitSubtitle: (text: string, source: string) => void;
}

type IntranetTab = 'home' | 'hr' | 'directory';

const EVADE_OFFSETS: Array<{ x: number; y: number }> = [
  { x: 76, y: -12 },
  { x: -72, y: 16 },
  { x: 68, y: 18 },
];

export const IntranetApp: React.FC<IntranetAppProps> = ({
  lang,
  actStage,
  isEffectiveLensBroken,
  shiftNoticeAcknowledged,
  resignationRejected,
  onAcknowledgeShift,
  onResignAttemptPreBroken,
  onLongPressStageHint,
  onCompleteLongPressResign,
  onLaunchAudit,
  onBumpAwareness,
  onBumpCompliance,
  onEmitSubtitle,
}) => {
  const [tab, setTab] = useState<IntranetTab>('home');
  const [resignDialog, setResignDialog] = useState<{
    quote: string;
    stageLabel: string;
  } | null>(null);

  // Act 3 cursor evasion + forced voluntary permanent retention
  const [evadeCount, setEvadeCount] = useState(0);
  const [evadeOffset, setEvadeOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [retentionChecked, setRetentionChecked] = useState(false);
  const [retentionSnapMsg, setRetentionSnapMsg] = useState<string | null>(null);

  // Act 3 Hold-to-Resign with 76% -> 62% rebound resistance
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [reboundShaking, setReboundShaking] = useState(false);
  const [holdStageLabel, setHoldStageLabel] = useState<string | null>(null);

  const holdTimerRef = useRef<number | null>(null);
  const holdProgressRef = useRef(0);
  const hasReboundedRef = useRef(false);
  const lastStageEmittedRef = useRef<string | null>(null);

  const { ui, v2_4_5 } = getNarrativeBundle(lang);
  const resignCorpus = v2_4_5.asset5_resignation;
  const isSunnyAct3 = actStage === 3 && isEffectiveLensBroken;

  useEffect(() => {
    return () => {
      if (holdTimerRef.current !== null) {
        window.clearInterval(holdTimerRef.current);
      }
    };
  }, []);

  // Reset Act 3 interactive traps if dev switches back to Act 1/2
  useEffect(() => {
    if (!isEffectiveLensBroken) {
      setEvadeCount(0);
      setEvadeOffset({ x: 0, y: 0 });
      setRetentionChecked(false);
      setRetentionSnapMsg(null);
      setHoldProgress(0);
      setIsHolding(false);
      setReboundShaking(false);
      setHoldStageLabel(null);
    }
  }, [isEffectiveLensBroken]);

  const stopLongPress = () => {
    setIsHolding(false);
    setReboundShaking(false);
    if (holdTimerRef.current !== null) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdProgressRef.current < 100) {
      holdProgressRef.current = 0;
      setHoldProgress(0);
      setHoldStageLabel(null);
      hasReboundedRef.current = false;
      lastStageEmittedRef.current = null;
    }
  };

  const startLongPress = () => {
    if (resignationRejected) return;
    setIsHolding(true);
    holdProgressRef.current = 0;
    hasReboundedRef.current = false;
    lastStageEmittedRef.current = null;
    setHoldProgress(2);
    setHoldStageLabel(
      isSunnyAct3
        ? lang === 'zh'
          ? '正在同步部门交接台账 (25%)...'
          : 'Syncing department handover ledger (25%)...'
        : resignCorpus.longPressStages.pct25
    );
    onLongPressStageHint('pct25');
    soundEngine.playKeyClick();

    holdTimerRef.current = window.setInterval(() => {
      let next = holdProgressRef.current + 1.8;

      // Physical resistance rebound: 76% -> 62%
      if (!hasReboundedRef.current && next >= 76) {
        hasReboundedRef.current = true;
        setReboundShaking(true);
        next = 62;
        soundEngine.playLongPressRebound();
        setHoldStageLabel(
          isSunnyAct3
            ? lang === 'zh'
              ? '考勤队列繁忙，请继续按住以完成线上核验...'
              : 'Attendance queue busy — keep holding to finish sync...'
            : resignCorpus.longPressStages.pct75_rebound
        );
        if (lastStageEmittedRef.current !== 'pct75') {
          lastStageEmittedRef.current = 'pct75';
          onLongPressStageHint('pct75_rebound');
        }
        window.setTimeout(() => setReboundShaking(false), 450);
      } else if (next >= 35 && next < 75 && !hasReboundedRef.current) {
        setHoldStageLabel(
          isSunnyAct3
            ? lang === 'zh'
              ? '正在复核值班绩效与纸质记录 (55%)...'
              : 'Verifying shift attendance & paper records (55%)...'
            : resignCorpus.longPressStages.pct55
        );
        if (lastStageEmittedRef.current !== 'pct55') {
          lastStageEmittedRef.current = 'pct55';
          onLongPressStageHint('pct55');
        }
      }

      if (next >= 100) {
        holdProgressRef.current = 100;
        setHoldProgress(100);
        setIsHolding(false);
        if (holdTimerRef.current !== null) {
          window.clearInterval(holdTimerRef.current);
          holdTimerRef.current = null;
        }
        soundEngine.playStamp();
        onCompleteLongPressResign();
        return;
      }

      holdProgressRef.current = next;
      setHoldProgress(next);
    }, 50);
  };

  const handleAct3EvadeHover = () => {
    if (!isEffectiveLensBroken || resignationRejected || evadeCount >= 3) return;
    const nextIdx = evadeCount;
    setEvadeCount(nextIdx + 1);
    setEvadeOffset(EVADE_OFFSETS[nextIdx] ?? { x: 0, y: 0 });
    setRetentionChecked(true);
    if (!isSunnyAct3) {
      soundEngine.playGlitch();
    } else {
      soundEngine.playKeyClick();
    }
    onBumpAwareness('intranet_evade_seen', 1);

    const hint = isSunnyAct3
      ? lang === 'zh'
        ? nextIdx === 0
          ? '温馨提示：系统已为您默认推荐“全勤模范岗位续任”，欢迎继续留任！'
          : nextIdx === 1
          ? '界面正在加载人力资源审批组件，请稍后再点击一次确认位置。'
          : '审批按钮已就绪——请长按 2 秒完成电子签名复核。'
        : nextIdx === 0
        ? 'Friendly tip: System auto-selected Recommended Renewal for convenience!'
        : nextIdx === 1
        ? 'Refreshing HR approval widget layout — click once more to confirm.'
        : 'Submit button ready — press and HOLD briefly to complete form check.'
      : lang === 'zh'
      ? nextIdx === 0
        ? '系统已自动为您勾选“自愿永久留任”。请勿移动光标。'
        : nextIdx === 1
        ? '3号铁皮柜需要有人从内部压紧门栓。'
        : '按钮已被强行钉住——按住不放以强行提交注销。'
      : nextIdx === 0
      ? 'System auto-checked "Voluntary Permanent Retention".'
      : nextIdx === 1
      ? 'Cabinet #3 needs someone holding the latch shut.'
      : 'Button pinned down — press and HOLD to force separation.';

    setRetentionSnapMsg(hint);
    onEmitSubtitle(
      hint,
      isSunnyAct3
        ? lang === 'zh'
          ? '人事门户 // 模范提示'
          : 'HR PORTAL // NOTICE'
        : lang === 'zh'
        ? '人事门户 // 异常阻拦'
        : 'HR PORTAL // INTERCEPT'
    );
  };

  const handlePreBrokenResign = () => {
    const stage: 0 | 1 | 2 = actStage === 1 ? 0 : Math.random() < 0.5 ? 1 : 2;
    const res = onResignAttemptPreBroken(stage);
    setResignDialog(res);
  };

  const handleToggleRetention = () => {
    if (isEffectiveLensBroken) {
      // Snaps right back checked!
      setRetentionChecked(true);
      if (isSunnyAct3) {
        soundEngine.playKeyClick();
      } else {
        soundEngine.playGlitch();
      }
      const msg = isSunnyAct3
        ? lang === 'zh'
          ? '[已推荐锁定] #302 属于部门先进示范岗位，续签福利默认保留开启。'
          : '[PRESELECTED] Operator #302 is enrolled in the Model Office Shift Benefit.'
        : lang === 'zh'
        ? '[锁定] “自愿永久留任”条款已由 #302 本人签署，不可取消。'
        : '[LOCKED] Voluntary Permanent Retention was already signed by #302.';
      setRetentionSnapMsg(msg);
      onEmitSubtitle(msg, lang === 'zh' ? '人事自助' : 'HR SELF-SERVICE');
      return;
    }
    const next = !retentionChecked;
    setRetentionChecked(next);
    soundEngine.playKeyClick();
    if (next) {
      onBumpCompliance('hr_retention_checked', 1);
    }
  };

  const holdModeUnlocked = isEffectiveLensBroken && evadeCount >= 3;

  return (
    <div className="os-intranet">
      {/* Classic late-80s/90s Intranet Address & Nav Strip */}
      <div className="os-intranet-bar">
        <span className="os-addr-box">
          {isSunnyAct3
            ? 'tcd://intranet.sector-b/model-office/v1.84'
            : isEffectiveLensBroken
            ? 'tcd://cabinet-03.local/hr/LOCKED_302'
            : 'tcd://intranet.sector-b/portal/v1.84'}
        </span>
        <div className="os-tab-strip">
          <button
            type="button"
            className={`os-tab-btn ${tab === 'home' ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playKeyClick();
              setTab('home');
            }}
          >
            {lang === 'zh' ? '交接通告' : 'Shift Notice'}
          </button>
          <button
            type="button"
            className={`os-tab-btn ${tab === 'hr' ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playKeyClick();
              setTab('hr');
            }}
          >
            {lang === 'zh' ? '人事自助 · 离职' : 'HR · Resign'}
          </button>
          <button
            type="button"
            className={`os-tab-btn ${tab === 'directory' ? 'active' : ''}`}
            onClick={() => {
              soundEngine.playKeyClick();
              setTab('directory');
            }}
          >
            {lang === 'zh' ? '科室名录' : 'Directory'}
          </button>
        </div>
      </div>

      {/* TAB 1: HOME / SHIFT NOTICE */}
      {tab === 'home' && (
        <div className="os-intranet-content">
          <div className="os-banner-box">
            <div className="os-banner-title">
              {lang === 'zh'
                ? '市政更正部 · 地下 B 区夜班值守通告'
                : 'THE CORRECTION DEPARTMENT — SECTOR B SHIFT BRIEFING'}
            </div>
            <div className="os-banner-meta">
              {lang === 'zh'
                ? `当前登入工位：#302 | 值守班次：${
                    actStage >= 4
                      ? '第 1,095 天 [时钟溢出]'
                      : actStage === 3
                      ? '★ 晴朗模范示范岗'
                      : '夜班（23:00–07:00）'
                  }`
                : `TERMINAL: #302 | SHIFT: ${
                    actStage >= 4
                      ? 'DAY 1,095 [CLOCK DRIFT]'
                      : actStage === 3
                      ? '★ MODEL OFFICE SHIFT'
                      : 'NIGHT (23:00–07:00)'
                  }`}
            </div>
          </div>

          <div className="os-notice-article">
            {lang === 'zh' ? (
              <>
                <p>
                  <strong>致 操作员 #302：</strong>
                </p>
                <p>
                  鉴于前任高级档案员 <strong>#209（Arthur）</strong>{' '}
                  {actStage >= 4
                    ? '已于三年前归并至 3 号档案柜底层，其工位永久空置。'
                    : actStage === 3
                    ? '已顺利调任并荣获季度表彰，本岗位被评为市政更正部季度微笑示范工位，由你继续负责日常行政与档案维护。'
                    : '未按时完成交班签退且暂未联系到本人，现由你临时接管地下 B 区夜班档案更正与日常行政值守。'}
                </p>
                <p>
                  你的职责十分简单：按时核对桌面实体卷宗与隔断后的常规事务，通过本终端查阅后勤文档、维护日常记录，并保持工位专注度。
                  {actStage === 2 && (
                    <span className="os-drift-note">
                      {' '}
                      [系统校注：检测到茶水间断电 11 日，请核查桌面饮食来源。]
                    </span>
                  )}
                </p>
                <p className="os-muted-line">
                  ※ 如需办理调岗或离职申请，请前往上方【人事自助 · 离职】栏目填报。
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>TO: OPERATOR #302</strong>
                </p>
                <p>
                  Because Senior Archivist <strong>#209 (Arthur)</strong>{' '}
                  {actStage >= 4
                    ? 'was bound inside Cabinet #3 three years ago, his cubicle remains permanently vacant.'
                    : actStage === 3
                    ? 'completed his transfer with departmental honors, Sector B Workstation #302 has been designated a Model Office station under your care.'
                    : 'left mid-shift without signing out and remains unreachable, you have been assigned to cover Sub-Level Sector B night operations.'}
                </p>
                <p>
                  Your duties are routine: maintain Sector B records, inspect desk items and incoming dossiers, review internal memos on TCD-OS, and complete your shift without disruption.
                  {actStage === 2 && (
                    <span className="os-drift-note">
                      {' '}
                      [AUDIT DRIFT: Pantry breaker offline for 11 days. Verify mug heat source.]
                    </span>
                  )}
                </p>
                <p className="os-muted-line">
                  * Transfer or separation requests must be filed under [HR · Resign].
                </p>
              </>
            )}
          </div>

          <div className="os-notice-actions">
            <button
              type="button"
              className={`os-retro-btn ${
                shiftNoticeAcknowledged ? 'os-btn-stamped' : 'os-btn-primary'
              }`}
              disabled={shiftNoticeAcknowledged}
              onClick={() => {
                soundEngine.playStamp();
                onAcknowledgeShift();
              }}
            >
              {shiftNoticeAcknowledged
                ? lang === 'zh'
                  ? '[✓ 已签收夜班交接通告]'
                  : '[✓ SHIFT HANDOVER ACKNOWLEDGED]'
                : lang === 'zh'
                ? '[确认签收交接班通告]'
                : '[ACKNOWLEDGE SHIFT HANDOVER]'}
            </button>

            <button
              type="button"
              className="os-retro-btn"
              onClick={() => {
                soundEngine.playKeyClick();
                setTab('hr');
              }}
            >
              {lang === 'zh' ? '前往人事自助 →' : 'Go to HR Self-Service →'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: HR SELF-SERVICE -> RESIGNATION */}
      {tab === 'hr' && (
        <div className="os-intranet-content">
          <div className="os-hr-breadcrumb">
            {lang === 'zh'
              ? '人事自助服务 > 雇佣状态管理 > 申请离职 (FORM HR-302)'
              : 'HR Self-Service > Employment Status > Apply for Resignation (FORM HR-302)'}
          </div>

          <div className="os-hr-form-card">
            <div className="os-form-row">
              <span>{lang === 'zh' ? '申请人编号：' : 'Applicant ID:'}</span>
              <strong>
                {isEffectiveLensBroken && actStage >= 4
                  ? lang === 'zh'
                    ? '#302 [合并索引点 // 3号柜]'
                    : '#302 [MERGER NODE // CABINET #3]'
                  : isSunnyAct3
                  ? lang === 'zh'
                    ? '#302 [★ 优秀值班文员]'
                    : '#302 [★ MODEL STAFF]'
                  : '#302'}
              </strong>
            </div>
            <div className="os-form-row">
              <span>{lang === 'zh' ? '交接对象：' : 'Handover Target:'}</span>
              <strong>
                {isEffectiveLensBroken && actStage >= 4
                  ? lang === 'zh'
                    ? '#209 Arthur [工牌已浸入陶瓷杯]'
                    : '#209 Arthur [BADGE IN CERAMIC MUG]'
                  : '#209 Arthur'}
              </strong>
            </div>

            <label className="os-retention-checkbox">
              <input
                type="checkbox"
                checked={retentionChecked}
                onChange={handleToggleRetention}
              />
              <span>
                {lang === 'zh'
                  ? '我自愿放弃离职并申请永久留任更正部地下 B 区（Voluntary Permanent Retention）'
                  : 'Voluntary Permanent Retention — I elect to remain at Sector B permanently'}
              </span>
            </label>

            {retentionSnapMsg && (
              <div
                className={
                  isSunnyAct3 ? 'os-hr-sunny-strip' : 'os-hr-warning-strip'
                }
              >
                {retentionSnapMsg}
              </div>
            )}

            {/* ACT 1 & ACT 2: Standard Bureaucratic Button -> Rationalization Popup */}
            {!isEffectiveLensBroken && (
              <div className="os-hr-submit-zone">
                <button
                  type="button"
                  className="os-retro-btn os-btn-primary"
                  onClick={handlePreBrokenResign}
                >
                  {lang === 'zh' ? '[ 提交离职申请 ]' : '[ Submit Resignation ]'}
                </button>
                <div className="os-hr-hint">
                  {actStage === 1
                    ? lang === 'zh'
                      ? '提示：夜班中途离岗将影响季度绩效与津贴发放。'
                      : 'Note: Mid-shift separation forfeits quarterly night stipends.'
                    : lang === 'zh'
                    ? '提示：地下 B 区出口核验中，离职审批可能存在延迟。'
                    : 'Note: Sector B exit clearance pending; approval may stall.'}
                </div>
              </div>
            )}

            {/* ACT 3: Cursor Evading Button -> Hold-to-Resign with 76%->62% Rebound */}
            {isEffectiveLensBroken && !resignationRejected && (
              <div className="os-hr-submit-zone os-act3-trap-zone">
                {!holdModeUnlocked ? (
                  <>
                    <div className="os-evade-arena">
                      <button
                        type="button"
                        className={`os-retro-btn ${
                          isSunnyAct3 ? 'os-btn-primary' : 'os-btn-danger'
                        } os-evade-btn`}
                        style={{
                          transform: `translate(${evadeOffset.x}px, ${evadeOffset.y}px)`,
                        }}
                        onMouseEnter={handleAct3EvadeHover}
                        onClick={handleAct3EvadeHover}
                      >
                        {lang === 'zh'
                          ? '[ 提交离职申请 ]'
                          : '[ Submit Resignation ]'}
                      </button>
                    </div>
                    <div
                      className={`os-hr-hint ${
                        isSunnyAct3 ? 'os-hint-sunny' : 'os-hint-crimson'
                      }`}
                    >
                      {isSunnyAct3
                        ? lang === 'zh'
                          ? `提示：正在校准人事表单焦点 (${evadeCount}/3) — 点击确认进入提交核验`
                          : `Tip: Aligning HR form focus (${evadeCount}/3) — click button to proceed`
                        : lang === 'zh'
                        ? `提示：审批指针偏移 (${evadeCount}/3) — 强行拦截按钮以启动注销`
                        : `Notice: Pointer drift (${evadeCount}/3) — corner button to force hold`}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={`os-hold-wrap ${
                        reboundShaking ? 'os-hold-tremble' : ''
                      }`}
                    >
                      <button
                        type="button"
                        className={`os-retro-btn ${
                          isSunnyAct3 ? 'os-btn-hold-sunny' : 'os-btn-hold'
                        }`}
                        onPointerDown={startLongPress}
                        onPointerUp={stopLongPress}
                        onPointerLeave={stopLongPress}
                        onPointerCancel={stopLongPress}
                      >
                        <div
                          className={
                            isSunnyAct3 ? 'os-hold-fill-sunny' : 'os-hold-fill'
                          }
                          style={{ width: `${holdProgress}%` }}
                        />
                        <span className="os-hold-label">
                          {isSunnyAct3
                            ? reboundShaking
                              ? lang === 'zh'
                                ? '同步复核中，请稍候按住...'
                                : 'Verifying entry, keep holding...'
                              : isHolding
                              ? lang === 'zh'
                                ? `正在提交离职审核 (${Math.round(holdProgress)}%)`
                                : `Submitting request (${Math.round(holdProgress)}%)`
                              : lang === 'zh'
                              ? '[ 长按确认提交人事流程 ]'
                              : '[ HOLD TO CONFIRM HR REQUEST ]'
                            : reboundShaking
                            ? ui.stayOnDutyLabel
                            : isHolding
                            ? `${ui.holdingLabel} (${Math.round(holdProgress)}%)`
                            : resignCorpus.longPressButtonIdle}
                        </span>
                      </button>
                    </div>
                    <div
                      className={`os-hr-hint ${
                        isSunnyAct3 ? 'os-hint-sunny' : 'os-hint-crimson'
                      }`}
                    >
                      {holdStageLabel ??
                        (isSunnyAct3
                          ? lang === 'zh'
                            ? '请长按确认提交您的工作岗位变更申请。'
                            : 'Press and hold to submit your status change request.'
                          : ui.bottomHintPhase3Ready)}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ACT 3 COMPLETE -> REJECTED -> LAUNCH ACT 4 AUDIT */}
            {isEffectiveLensBroken && resignationRejected && (
              <div
                className={
                  isSunnyAct3 ? 'os-sunny-complete-box' : 'os-rejection-box'
                }
              >
                <div
                  className={
                    isSunnyAct3 ? 'os-sunny-complete-banner' : 'os-rejection-err'
                  }
                >
                  {isSunnyAct3
                    ? lang === 'zh'
                      ? '人事回执：#302 档案需先完成常规员工在岗信息核对。'
                      : 'HR NOTICE: Routine staff verification is required before status changes.'
                    : resignCorpus.systemRejection}
                </div>
                <p
                  className={
                    isSunnyAct3 ? 'os-sunny-complete-note' : 'os-rejection-thought'
                  }
                >
                  {isSunnyAct3
                    ? lang === 'zh'
                      ? '系统已为您自动匹配标准员工复核向导，请打开下方窗口核对工位记录。'
                      : 'The system has queued your routine staff check utility below to confirm workstation details.'
                    : resignCorpus.protagonistRealization}
                </p>
                <button
                  type="button"
                  className={`os-retro-btn ${
                    isSunnyAct3 ? 'os-btn-primary' : 'os-btn-danger'
                  }`}
                  onClick={() => {
                    if (isSunnyAct3) {
                      soundEngine.playKeyClick();
                    } else {
                      soundEngine.playGlitch();
                    }
                    onLaunchAudit();
                  }}
                >
                  {isSunnyAct3
                    ? lang === 'zh'
                      ? '[ 进入例行员工信息核对：AUDIT_302.EXE ]'
                      : '[ Open Routine Staff Check: AUDIT_302.EXE ]'
                    : lang === 'zh'
                    ? '[ 启动强制身份审计：AUDIT_302.EXE ]'
                    : '[ LAUNCH MANDATORY AUDIT_302.EXE ]'}
                </button>
              </div>
            )}
          </div>

          {/* Inline Retro Popup Dialog for Act 1 & 2 Rationalizations */}
          {resignDialog && !isEffectiveLensBroken && (
            <div className="os-inline-dialog" role="alertdialog">
              <div className="os-inline-dialog-head">
                <span>
                  {lang === 'zh' ? '人事审批反馈' : 'HR PORTAL NOTICE'}
                </span>
                <span>{resignDialog.stageLabel}</span>
              </div>
              <p className="os-inline-dialog-quote">“{resignDialog.quote}”</p>
              <button
                type="button"
                className="os-retro-btn"
                onClick={() => {
                  soundEngine.playKeyClick();
                  setResignDialog(null);
                }}
              >
                {lang === 'zh' ? '[ 好的，继续值班 ]' : '[ OK, Stay on Shift ]'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SECTOR B DIRECTORY */}
      {tab === 'directory' && (
        <div className="os-intranet-content">
          <table className="os-retro-table">
            <thead>
              <tr>
                <th>{lang === 'zh' ? '编号' : 'ID'}</th>
                <th>{lang === 'zh' ? '姓名/岗位' : 'STAFF'}</th>
                <th>{lang === 'zh' ? '状态' : 'STATUS'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#302</td>
                <td>
                  {lang === 'zh' ? '夜班档案文员（本人）' : 'Night Archivist (You)'}
                </td>
                <td>
                  {actStage >= 4
                    ? lang === 'zh'
                      ? '在岗 [第 1,095 日]'
                      : 'ON DUTY [DAY 1,095]'
                    : actStage === 3
                    ? lang === 'zh'
                      ? '★ 模范全勤在岗'
                      : '★ MODEL STAFF ON DUTY'
                    : lang === 'zh'
                    ? '在岗'
                    : 'ACTIVE'}
                </td>
              </tr>
              <tr>
                <td>#209</td>
                <td>
                  {lang === 'zh' ? 'Arthur / 高级档案员' : 'Arthur / Sr. Archivist'}
                </td>
                <td className={actStage === 2 || actStage >= 4 ? 'os-cell-alert' : ''}>
                  {actStage === 1
                    ? lang === 'zh'
                      ? '暂离（未签退）'
                      : 'AWAY (NO SIGN-OUT)'
                    : actStage === 2
                    ? lang === 'zh'
                      ? '失联 72 小时+'
                      : 'UNREACHABLE 72H+'
                    : actStage === 3
                    ? lang === 'zh'
                      ? '轮岗交流（良好）'
                      : 'TRANSFERRED (GOOD STANDING)'
                    : lang === 'zh'
                    ? '已归并至 3 号柜'
                    : 'MERGED // CABINET #3'}
                </td>
              </tr>
              <tr>
                <td>C-14</td>
                <td>
                  {lang === 'zh' ? '林氏 / 夜班保洁' : 'Lin / Night Janitor'}
                </td>
                <td className={actStage >= 4 ? 'os-cell-alert' : ''}>
                  {actStage === 3
                    ? lang === 'zh'
                      ? '常规晚间保洁'
                      : 'EVENING CLEANUP'
                    : actStage < 3
                    ? lang === 'zh'
                      ? '后勤排班'
                      : 'NIGHT ROUNDS'
                    : lang === 'zh'
                    ? '围裙名牌已装订'
                    : 'TAG STAPLED'}
                </td>
              </tr>
              <tr>
                <td>M-04</td>
                <td>
                  {lang === 'zh' ? '[外部转交悬案]' : '[EXTERNAL COLD CASE]'}
                </td>
                <td className={actStage === 2 || actStage >= 4 ? 'os-cell-alert' : ''}>
                  {actStage === 1
                    ? lang === 'zh'
                      ? '已归档'
                      : 'ARCHIVED'
                    : actStage === 3
                    ? lang === 'zh'
                      ? '标准例行保管'
                      : 'ROUTINE STORAGE'
                    : lang === 'zh'
                    ? '照片已贴屏'
                    : 'TAPED TO BEZEL'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

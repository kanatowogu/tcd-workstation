import React, { useEffect, useState } from 'react';
import { ActStage, Language } from '../../../types';
import { soundEngine } from '../../../utils/soundEngine';
import { RECYCLE_FRAGMENTS } from '../osData';

/* ============================================================================
   1. RECYCLE.BIN — #209 ARTHUR CORRUPTED FRAGMENTS + BREATHING ERROR DIALOG
   ============================================================================ */
interface RecycleBinAppProps {
  lang: Language;
  actStage: ActStage;
  onDiscoverAnomaly: (key: string, subtitle?: string) => void;
}

const ACT3_MUNDANE_TEMP_FILES = [
  {
    id: 'temp_notes',
    filename: 'MEETING_NOTES_OLD.TMP',
    origin: 'C:\\302\\TEMP\\',
    size: '0.8 KB',
    deletedAt: 'FRI 14:20',
    bodyZh: '周会纪要草稿：\n- 本周五茶水间补充燕麦曲奇\n- #302 获评年度微笑模范工位，请按时领奖。',
    bodyEn: 'Staff Meeting Notes:\n- Restock oat cookies in Sector B pantry Friday\n- Desk #302 awarded Annual Smile Award.',
  },
  {
    id: 'temp_poster',
    filename: 'POSTER_DRAFT_BAK.TXT',
    origin: 'C:\\302\\TEMP\\',
    size: '1.2 KB',
    deletedAt: 'FRI 16:05',
    bodyZh: '模范科室宣传栏草稿：\n“每一天都是全新的一天，保持微笑，用心服务！”',
    bodyEn: 'Bulletin Board Poster Draft:\n"Every day is a brand-new day — keep smiling and serve with care!"',
  },
];

export const RecycleBinApp: React.FC<RecycleBinAppProps> = ({
  lang,
  actStage,
  onDiscoverAnomaly,
}) => {
  const isSunnyAct3 = actStage === 3;
  const items = isSunnyAct3 ? ACT3_MUNDANE_TEMP_FILES : RECYCLE_FRAGMENTS;
  const [selectedId, setSelectedId] = useState<string>(items[0].id);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  useEffect(() => {
    setSelectedId(items[0].id);
    setShowDialog(false);
  }, [isSunnyAct3]);

  const selected = items.find((f) => f.id === selectedId) ?? items[0];

  const handleEmptyBin = () => {
    if (isSunnyAct3) {
      soundEngine.playKeyClick();
      setShowDialog(true);
      return;
    }
    soundEngine.playGlitch();
    setShowDialog(true);
    onDiscoverAnomaly(
      'recycle_empty_denied',
      lang === 'zh'
        ? '“目标仍在呼吸”……系统说 #209 还在里面呼吸？'
        : '"TARGET IS STILL BREATHING"... the system says #209 is still alive inside.'
    );
  };

  return (
    <div className="os-recycle">
      <div className="os-recycle-toolbar">
        <span>
          {isSunnyAct3
            ? lang === 'zh'
              ? `临时草稿：${items.length} 项（可随时整理）`
              : `TEMP DRAFTS: ${items.length} ITEM(S)`
            : lang === 'zh'
            ? `已拦截碎片：${items.length} 项（来源：#209 Arthur）`
            : `CONTAINED FRAGMENTS: ${items.length} (OWNER: #209 ARTHUR)`}
        </span>
        <button
          type="button"
          className={`os-retro-btn ${
            isSunnyAct3 ? 'os-btn-primary' : 'os-btn-danger-sm'
          }`}
          onClick={handleEmptyBin}
        >
          {lang === 'zh' ? '[ 清空回收站 ]' : '[ Empty Recycle Bin ]'}
        </button>
      </div>

      <div className="os-split-explorer">
        <aside className="os-file-sidebar">
          <div className="os-file-list">
            {items.map((frag) => (
              <button
                key={frag.id}
                type="button"
                className={`os-file-item ${
                  frag.id === selectedId ? 'selected' : ''
                }`}
                onClick={() => {
                  soundEngine.playKeyClick();
                  setSelectedId(frag.id);
                  if (!isSunnyAct3) {
                    onDiscoverAnomaly(`recycle_read_${frag.id}`);
                  }
                }}
              >
                <span className="os-file-name">{frag.filename}</span>
                <span className="os-file-meta">
                  {frag.size} · {frag.deletedAt}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="os-doc-viewer">
          <div className="os-viewer-toolbar">
            <span>{selected.origin + selected.filename}</span>
            <span>{isSunnyAct3 ? '[TEMP_DRAFT]' : '[CORRUPTED]'}</span>
          </div>
          <pre className="os-doc-pre">
            {lang === 'zh' ? selected.bodyZh : selected.bodyEn}
          </pre>
        </div>
      </div>

      {showDialog && (
        <div className="os-modal-scrim" role="alertdialog" aria-modal="true">
          <div className={`os-error-dialog ${isSunnyAct3 ? 'os-info-dialog' : ''}`}>
            <div className="os-error-titlebar">
              <span>
                {isSunnyAct3
                  ? 'TCD-OS // DISK CLEANUP'
                  : 'TCD-OS KERNEL ERROR 0x209'}
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playKeyClick();
                  setShowDialog(false);
                }}
              >
                ×
              </button>
            </div>
            <div className="os-error-body">
              {isSunnyAct3 ? (
                <>
                  <div className="os-info-code">
                    {lang === 'zh'
                      ? '★ 回收站已整理完毕！'
                      : '★ RECYCLE BIN IS CLEAN & UP TO DATE!'}
                  </div>
                  <p>
                    {lang === 'zh'
                      ? '所有过期草稿已安全归档，系统磁盘空间充足。祝您今天工作愉快！'
                      : 'Temporary drafts have been neatly tidied away. Plenty of disk space remains!'}
                  </p>
                </>
              ) : (
                <>
                  <div className="os-error-code">
                    [ACCESS DENIED: TARGET IS STILL BREATHING]
                  </div>
                  <p>
                    {lang === 'zh'
                      ? '拒绝访问：目标仍在呼吸。无法清除 #209 (Arthur) 的关联残片——文件句柄正被【第 3 号档案柜】持续占用。'
                      : 'Cannot purge #209 (Arthur) fragments — file handle is actively held by CABINET #3.'}
                  </p>
                </>
              )}
              <button
                type="button"
                className="os-retro-btn os-btn-primary"
                onClick={() => {
                  soundEngine.playKeyClick();
                  setShowDialog(false);
                }}
              >
                {lang === 'zh' ? '[ 确定 ]' : '[ OK ]'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   2. C:\302 — LOW-LEVEL SYSTEM MONITOR WITH REAL VIEWPORT & SESSION TELEMETRY
   ============================================================================ */
interface SysMonAppProps {
  lang: Language;
  actStage: ActStage;
  sessionSeconds: number;
  complianceScore: number;
  awarenessScore: number;
  drawerLocks: [boolean, boolean, boolean];
  onDiscoverAnomaly: (key: string, subtitle?: string) => void;
}

export const SysMonApp: React.FC<SysMonAppProps> = ({
  lang,
  actStage,
  sessionSeconds,
  complianceScore,
  awarenessScore,
  drawerLocks,
  onDiscoverAnomaly,
}) => {
  const [viewport, setViewport] = useState<{ w: number; h: number }>({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 720,
  });

  useEffect(() => {
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (actStage >= 4) {
      onDiscoverAnomaly(
        'sysmon_observer_detected',
        lang === 'zh'
          ? `它在监视我的屏幕分辨率（${viewport.w}×${viewport.h}）……它知道我在看它。`
          : `It is reading my exact viewport (${viewport.w}x${viewport.h})... it knows I am watching.`
      );
    }
  }, [actStage, lang, viewport.w, viewport.h, onDiscoverAnomaly]);

  const mins = String(Math.floor(sessionSeconds / 60)).padStart(2, '0');
  const secs = String(sessionSeconds % 60).padStart(2, '0');
  const isSunnyAct3 = actStage === 3;

  return (
    <div className="os-sysmon">
      <div className="os-sysmon-head">
        <span>C:\302\SYSMON.SYS // KERNEL v1.84</span>
        <span>{isSunnyAct3 ? 'STATUS: OPTIMAL ★' : `ACT_STAGE: 0${actStage}`}</span>
      </div>

      {isSunnyAct3 && (
        <div className="os-optimal-banner">
          <strong>
            {lang === 'zh'
              ? '★ 系统运行状态：极佳 — 祝您度过美好愉快的夜班！'
              : '★ ALL SYSTEMS OPTIMAL — HAVE A WONDERFUL SHIFT!'}
          </strong>
        </div>
      )}

      {actStage >= 4 && (
        <div className="os-observer-alert">
          <strong>[EXTERNAL OBSERVER DETECTED]</strong>
          <span>
            {lang === 'zh'
              ? '检测到屏幕玻璃外侧存在实时观测会话'
              : 'LIVE VIEWPORT SESSION DETECTED BEYOND CRT GLASS'}
          </span>
        </div>
      )}

      <div className="os-sysmon-grid">
        <div className="os-sysmon-box">
          <div className="os-sysmon-label">
            {lang === 'zh' ? '底层挂载卷' : 'MOUNTED VOLUMES'}
          </div>
          <div className="os-sysmon-line">C:\302 .......... 640K OK</div>
          <div className="os-sysmon-line">
            CABINET_03 ......{' '}
            {isSunnyAct3 ? 'NEAT & TIDY' : actStage >= 4 ? 'TEMP: 36.8°C' : 'LOCKED'}
          </div>
          <div className="os-sysmon-line">
            DRAWERS .........{' '}
            {drawerLocks
              .map((locked, i) => `D${i + 1}:${locked ? 'LCK' : 'OPN'}`)
              .join(' ')}
          </div>
        </div>

        <div className="os-sysmon-box">
          <div className="os-sysmon-label">
            {isSunnyAct3
              ? lang === 'zh'
                ? '工作站显示参数'
                : 'DISPLAY TELEMETRY'
              : lang === 'zh'
              ? '外部观测遥测'
              : 'OBSERVER TELEMETRY'}
          </div>
          <div className="os-sysmon-line">
            {lang === 'zh' ? '视口分辨率' : 'VIEWPORT'}:{' '}
            <strong>
              {viewport.w} × {viewport.h} PX
            </strong>
          </div>
          <div className="os-sysmon-line">
            {lang === 'zh' ? '本次开机时长' : 'SESSION UPTIME'}:{' '}
            <strong>
              {mins}:{secs}
            </strong>
          </div>
          <div className="os-sysmon-line">
            {lang === 'zh' ? '本地时钟' : 'HOST CLOCK'}:{' '}
            <strong>{new Date().toLocaleTimeString()}</strong>
          </div>
        </div>
      </div>

      <div className="os-sysmon-box">
        <div className="os-sysmon-label">
          {lang === 'zh' ? '内存与磁带缓冲区状态' : 'MEMORY & TAPE BUFFER'}
        </div>
        <div className="os-meter-row">
          <span>{lang === 'zh' ? '基本内存 (640K)' : 'BASE MEM (640K)'}</span>
          <div className="os-meter-track">
            <div className="os-meter-fill" style={{ width: '68%' }} />
          </div>
          <span>68%</span>
        </div>
        <div className="os-meter-row">
          <span>{lang === 'zh' ? '磁带缓存 (CACHE)' : 'TAPE BUFFER'}</span>
          <div className="os-meter-track">
            <div
              className={`os-meter-fill ${actStage >= 4 ? 'awareness' : ''}`}
              style={{ width: actStage >= 4 ? '94%' : '24%' }}
            />
          </div>
          <span>{actStage >= 4 ? 'ERR' : '24%'}</span>
        </div>
      </div>
    </div>
  );
};

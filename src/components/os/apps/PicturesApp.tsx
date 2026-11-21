import React, { useState } from 'react';
import { ActStage, Language } from '../../../types';
import { soundEngine } from '../../../utils/soundEngine';
import { EvidenceArtwork } from '../../EvidenceArtwork';

interface PicturesAppProps {
  lang: Language;
  actStage: ActStage;
  onDiscoverAnomaly: (key: string, subtitle?: string) => void;
}

type PictureId = 'floorplan' | 'group_photo' | 'polaroid_scan';

export const PicturesApp: React.FC<PicturesAppProps> = ({
  lang,
  actStage,
  onDiscoverAnomaly,
}) => {
  const [selected, setSelected] = useState<PictureId>('floorplan');

  const items: Array<{
    id: PictureId;
    nameZh: string;
    nameEn: string;
    res: string;
  }> = [
    {
      id: 'floorplan',
      nameZh: 'B区地下室消防通道图.BMP',
      nameEn: 'SECTOR_B_FIRE_EXIT.BMP',
      res: '320×200 MONO',
    },
    {
      id: 'group_photo',
      nameZh: '优秀科室合影.BMP',
      nameEn: 'DEPT_GROUP_PHOTO.BMP',
      res: '320×200 4-BIT',
    },
    {
      id: 'polaroid_scan',
      nameZh: '工位校准照片.BMP',
      nameEn: 'FAMILY_PHOTO_SCAN.BMP',
      res: '256×200 SCAN',
    },
  ];

  const handleSelect = (id: PictureId) => {
    soundEngine.playKeyClick();
    setSelected(id);
    if (actStage === 2 || actStage >= 4) {
      if (id === 'floorplan' && actStage >= 4) {
        onDiscoverAnomaly(
          'pic_floorplan_act4',
          lang === 'zh'
            ? '通道图上的消防出口不见了……整面墙都被封死了。'
            : 'The fire exit door vanished from the blueprint... the wall is welded shut.'
        );
      } else if (id === 'group_photo' && actStage >= 4) {
        onDiscoverAnomaly(
          'pic_group_act4',
          lang === 'zh'
            ? '合影里每个人的脸都变成了雪花噪点……还钉着红订书钉。'
            : 'Every face in the department photo degraded into static noise.'
        );
      }
    }
  };

  return (
    <div className="os-split-explorer">
      <aside className="os-file-sidebar">
        <div className="os-sidebar-head">C:\302\PICTURES</div>
        <div className="os-file-list">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`os-file-item ${
                item.id === selected ? 'selected' : ''
              }`}
              onClick={() => handleSelect(item.id)}
            >
              <span className="os-file-name">
                {lang === 'zh' ? item.nameZh : item.nameEn}
              </span>
              <span className="os-file-meta">{item.res}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="os-pic-viewer">
        {selected === 'floorplan' && (
          <SectorBFloorplanSvg actStage={actStage} lang={lang} />
        )}
        {selected === 'group_photo' && (
          <DepartmentGroupPhotoSvg actStage={actStage} lang={lang} />
        )}
        {selected === 'polaroid_scan' && (
          <div className="os-pic-evidence-wrap">
            <EvidenceArtwork
              type={actStage >= 4 ? 'Photo_Truth' : 'Photo_Initial'}
              lang={lang}
              caption={
                actStage >= 4
                  ? lang === 'zh'
                    ? '扫描件异常：原始红订书钉装订层已显影'
                    : 'SCAN CORRUPTED: STAPLED UNDERLAYER EXPOSED'
                  : actStage === 3
                  ? lang === 'zh'
                    ? '模范工位温馨留念 ★'
                    : 'MODEL WORKSTATION KEEPSAKE ★'
                  : lang === 'zh'
                  ? '工位 #302 班前视觉锚定备份件'
                  : 'WORKSTATION #302 VISUAL ANCHOR BACKUP'
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   RETRO CAD BLUEPRINT: B-SECTOR FIRE EXIT MAP (EXIT DOOR VANISHES IN ACT 3)
   ============================================================================ */
const SectorBFloorplanSvg: React.FC<{ actStage: ActStage; lang: Language }> = ({
  actStage,
  lang,
}) => {
  const sealed = actStage >= 4;
  const sunny = actStage === 3;
  const doubt = actStage === 2;

  if (sunny) {
    return (
      <svg
        viewBox="0 0 360 230"
        className="os-pixel-svg"
        role="img"
        aria-label="Sector B Sunny Model Floorplan"
      >
        <defs>
          <pattern id="sunnyCadGrid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#d9edff" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="360" height="230" fill="#f4fbff" />
        <rect width="360" height="230" fill="url(#sunnyCadGrid)" />
        <text x="14" y="20" fill="#1b5e9e" fontSize="9" fontFamily="monospace" fontWeight="bold">
          {lang === 'zh'
            ? '地下 B 区模范安全平面图 ★ [全线畅通]'
            : 'SECTOR B MODEL SAFETY MAP ★ [ALL EXITS CLEAR]'}
        </text>
        <rect x="24" y="34" width="312" height="168" fill="none" stroke="#2c6ca8" strokeWidth="3" />
        <rect x="331" y="92" width="10" height="44" fill="#f4fbff" />
        <line x1="336" y1="92" x2="312" y2="112" stroke="#229954" strokeWidth="2.5" />
        <text x="274" y="118" fill="#1e8449" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
          EXIT →
        </text>
        <rect x="110" y="124" width="82" height="48" fill="#fff6cc" stroke="#d48806" strokeWidth="1.8" />
        <text x="118" y="152" fill="#874d00" fontSize="9" fontFamily="monospace" fontWeight="bold">
          DESK #302 ★
        </text>
        <line x1="96" y1="110" x2="210" y2="110" stroke="#7fb3d5" strokeWidth="2" />
        <rect x="110" y="52" width="82" height="46" fill="#e8f6ff" stroke="#5499c7" strokeWidth="1.4" />
        <text x="122" y="79" fill="#1f618d" fontSize="8.5" fontFamily="monospace">
          DESK #209
        </text>
        <rect x="36" y="48" width="44" height="68" fill="#eafaf1" stroke="#2e86c1" strokeWidth="1.5" />
        <text x="41" y="78" fill="#1b4f72" fontSize="8" fontFamily="monospace" fontWeight="bold">
          CAB #3
        </text>
        <rect x="218" y="46" width="84" height="44" fill="#fff0f6" stroke="#eb2f96" strokeWidth="1.2" />
        <text x="224" y="66" fill="#9e1068" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
          PANTRY
        </text>
        <text x="224" y="80" fill="#9e1068" fontSize="7" fontFamily="monospace">
          (COFFEE READY)
        </text>
        <text x="14" y="218" fill="#2c6ca8" fontSize="7.5" fontFamily="monospace">
          {lang === 'zh'
            ? '比例 1:100 · 安全指标 100% 达标，祝您值班愉快！'
            : 'SCALE 1:100 · ALL CORRIDORS OPEN — HAVE A PLEASANT SHIFT!'}
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 360 230"
      className="os-pixel-svg"
      role="img"
      aria-label="Sector B Fire Exit Blueprint"
    >
      <defs>
        <pattern id="cadGrid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path
            d="M 16 0 L 0 0 0 16"
            fill="none"
            stroke={sealed ? '#3b151a' : '#2b2823'}
            strokeWidth="0.6"
          />
        </pattern>
        <pattern
          id="concreteHatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke="#c9303e" strokeWidth="1.4" />
        </pattern>
      </defs>

      <rect width="360" height="230" fill={sealed ? '#110608' : '#12110e'} />
      <rect width="360" height="230" fill="url(#cadGrid)" />

      {/* Header */}
      <text
        x="14"
        y="20"
        fill={sealed ? '#e06c75' : '#d4c8b0'}
        fontSize="9"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {lang === 'zh'
          ? `地下 B 区消防疏散平面图 // ${sealed ? '出口已封死' : 'REV 1984'}`
          : `SUB-LEVEL SECTOR B FIRE MAP // ${sealed ? 'SEALED' : 'REV 1984'}`}
      </text>

      {/* Outer Concrete Perimeter Walls */}
      <rect
        x="24"
        y="34"
        width="312"
        height="168"
        fill="none"
        stroke={sealed ? '#b8323e' : '#c9beaa'}
        strokeWidth="3"
      />

      {/* Right-side Emergency Exit Door: Present in Act 1, Welded marks in Act 2, VANISHED in Act 3 */}
      {!sealed ? (
        <g>
          <rect x="331" y="92" width="10" height="44" fill="#12110e" />
          <line
            x1="336"
            y1="92"
            x2="312"
            y2="112"
            stroke={doubt ? '#b8764f' : '#9ad19c'}
            strokeWidth="2"
            strokeDasharray={doubt ? '3,2' : undefined}
          />
          <text
            x="278"
            y="118"
            fill={doubt ? '#d99a6c' : '#9ad19c'}
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {doubt ? 'EXIT (?)' : 'EXIT →'}
          </text>
          {doubt && (
            <text
              x="252"
              y="132"
              fill="#b8764f"
              fontSize="7"
              fontFamily="monospace"
            >
              [WELD TRACE]
            </text>
          )}
        </g>
      ) : (
        <g>
          <rect
            x="328"
            y="84"
            width="12"
            height="60"
            fill="url(#concreteHatch)"
            stroke="#ff3b4e"
            strokeWidth="1.5"
          />
          <text
            x="244"
            y="116"
            fill="#ff4d5e"
            fontSize="8.5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {lang === 'zh' ? '无出口 // 混凝土焊死' : 'NO EXIT // WELDED'}
          </text>
        </g>
      )}

      {/* Desk #302 */}
      <rect
        x="110"
        y="124"
        width="82"
        height="48"
        fill={sealed ? '#240b0e' : '#24201b'}
        stroke={sealed ? '#e06c75' : '#dfd7c8'}
        strokeWidth="1.5"
      />
      <text
        x="122"
        y="152"
        fill="#f0e8d8"
        fontSize="9"
        fontFamily="monospace"
        fontWeight="bold"
      >
        DESK #302
      </text>

      {/* Partition Glass Line */}
      <line
        x1="96"
        y1="110"
        x2="210"
        y2="110"
        stroke={sealed ? '#ff4d5e' : '#a89f90'}
        strokeWidth="2"
        strokeDasharray={sealed ? '4,3' : undefined}
      />

      {/* Desk #209 Behind Partition */}
      <rect
        x="110"
        y="52"
        width="82"
        height="46"
        fill={sealed ? '#090304' : '#1b1815'}
        stroke={sealed ? '#6e2028' : '#8c8273'}
        strokeWidth="1.2"
        strokeDasharray={actStage >= 2 ? '3,3' : undefined}
      />
      <text
        x="118"
        y="79"
        fill={sealed ? '#9e3b44' : '#a89f90'}
        fontSize="8.5"
        fontFamily="monospace"
      >
        {sealed
          ? lang === 'zh'
            ? '空置积水区'
            : 'FLOODED VOID'
          : 'DESK #209'}
      </text>

      {/* Cabinet #3 */}
      <rect
        x="36"
        y="48"
        width="44"
        height="68"
        fill={sealed ? '#3b090f' : '#26231f'}
        stroke={sealed ? '#ff2e43' : '#c9beaa'}
        strokeWidth={sealed ? '2.2' : '1.5'}
      />
      <text
        x="41"
        y="78"
        fill={sealed ? '#ff6b78' : '#dfd7c8'}
        fontSize="8"
        fontFamily="monospace"
        fontWeight="bold"
      >
        CAB #3
      </text>
      {sealed && (
        <>
          <circle
            cx="58"
            cy="82"
            r="34"
            fill="none"
            stroke="#ff2e43"
            strokeWidth="0.8"
            strokeDasharray="3,3"
          />
          <text x="38" y="96" fill="#ff99a2" fontSize="6.5" fontFamily="monospace">
            WARM/LOCK
          </text>
        </>
      )}

      {/* Pantry Box */}
      <rect
        x="224"
        y="46"
        width="68"
        height="44"
        fill="none"
        stroke="#6e6558"
        strokeWidth="1"
      />
      <text x="234" y="72" fill="#8c8273" fontSize="8" fontFamily="monospace">
        {actStage >= 2 ? 'PANTRY [OFF]' : 'PANTRY'}
      </text>

      {/* Footer Note */}
      <text
        x="14"
        y="218"
        fill={sealed ? '#d96b75' : '#968c7c'}
        fontSize="7.5"
        fontFamily="monospace"
      >
        {sealed
          ? lang === 'zh'
            ? '>>> 探测到 1 个热源：位于 3 号档案柜内部（恒温）'
            : '>>> 1 THERMAL SIGNATURE DETECTED INSIDE CABINET #3'
          : lang === 'zh'
          ? '比例 1:100 · 如遇火警请沿东侧消防通道撤离至地面'
          : 'SCALE 1:100 · FOLLOW EAST CORRIDOR TO EMERGENCY EXIT'}
      </text>
    </svg>
  );
};

/* ============================================================================
   RETRO PIXEL-ART GROUP PHOTO: FACES DEGRADE INTO STATIC NOISE IN ACT 3
   ============================================================================ */
const DepartmentGroupPhotoSvg: React.FC<{
  actStage: ActStage;
  lang: Language;
}> = ({ actStage, lang }) => {
  const corrupted = actStage >= 4;
  const sunny = actStage === 3;
  const doubt = actStage === 2;

  if (sunny) {
    const sunnyPeople = [
      { x: 64, h: 92, label: '#209', shirt: '#5dade2' },
      { x: 142, h: 96, label: '#302 ★', shirt: '#f5b041' },
      { x: 220, h: 88, label: 'C-14', shirt: '#58d68d' },
      { x: 290, h: 72, label: 'HONOR', shirt: '#f1948a' },
    ];
    return (
      <svg
        viewBox="0 0 360 230"
        className="os-pixel-svg"
        role="img"
        aria-label="Model Archive Unit Group Photograph"
      >
        <rect width="360" height="230" fill="#d6efff" />
        <rect x="16" y="14" width="328" height="172" fill="#fff9e6" stroke="#3da5f5" strokeWidth="2.5" />
        <rect x="44" y="22" width="272" height="22" fill="#3da5f5" />
        <text x="180" y="37" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
          {lang === 'zh' ? '市政模范存档科室合影 ★' : 'MODEL ARCHIVE UNIT ★'}
        </text>
        {sunnyPeople.map((p) => {
          const topY = 184 - p.h;
          const headY = topY + 14;
          return (
            <g key={p.label}>
              <rect x={p.x - 22} y={topY + 34} width="44" height={p.h - 34} fill={p.shirt} stroke="#1b4f72" strokeWidth="1.5" />
              <rect x={p.x - 14} y={headY} width="28" height="24" fill="#fde3c8" stroke="#1b4f72" strokeWidth="1.5" />
              <rect x={p.x - 7} y={headY + 8} width="3" height="3" fill="#1b4f72" />
              <rect x={p.x + 4} y={headY + 8} width="3" height="3" fill="#1b4f72" />
              <path d={`M ${p.x - 6} ${headY + 15} Q ${p.x} ${headY + 21} ${p.x + 6} ${headY + 15}`} fill="none" stroke="#c0392b" strokeWidth="2" />
              <text x={p.x} y="179" textAnchor="middle" fill="#1b4f72" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                {p.label}
              </text>
            </g>
          );
        })}
        <text x="18" y="206" fill="#1b5e9e" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
          {lang === 'zh'
            ? '★ 优秀科室表彰留念 — 感谢每一位成员的辛勤贡献！'
            : '★ HONORABLE MENTIONS — THANK YOU FOR KEEPING US TOGETHER!'}
        </text>
      </svg>
    );
  }

  const people = [
    { x: 64, h: 92, label: '#209', role: 'Arthur' },
    { x: 142, h: 96, label: '#302', role: 'Clerk' },
    { x: 220, h: 88, label: 'C-14', role: 'Lin' },
    { x: 290, h: 68, label: 'M-04', role: '???' },
  ];

  // Deterministic static pixels for Act 3 corrupted faces
  const staticBlocks = [
    [0, 0], [4, 2], [8, 0], [12, 4], [2, 6], [10, 8], [6, 10],
    [14, 10], [0, 12], [8, 14], [12, 14], [4, 16], [14, 2], [2, 14],
  ];

  return (
    <svg
      viewBox="0 0 360 230"
      className="os-pixel-svg"
      role="img"
      aria-label="Department Group Photograph"
    >
      <rect width="360" height="230" fill={corrupted ? '#120709' : '#1b1916'} />
      {/* Retro Dithered Wall */}
      <rect
        x="16"
        y="14"
        width="328"
        height="172"
        fill={corrupted ? '#1e0c0f' : '#2a2620'}
        stroke={corrupted ? '#9e2832' : '#786f60'}
        strokeWidth="2"
      />
      {/* Banner */}
      <rect
        x="52"
        y="24"
        width="256"
        height="22"
        fill={corrupted ? '#380d13' : '#dfd7c8'}
      />
      <text
        x="180"
        y="39"
        textAnchor="middle"
        fill={corrupted ? '#f0a8b0' : '#181613'}
        fontSize="9.5"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {corrupted
          ? lang === 'zh'
            ? '第 3 号档案柜 · 归并留念'
            : 'CABINET #3 — BOUND INDEX'
          : lang === 'zh'
          ? '市政更正部 地下B区优秀科室合影'
          : 'TCD SECTOR B — HONOR ARCHIVE UNIT'}
      </text>

      {people.map((p, idx) => {
        const topY = 184 - p.h;
        const headY = topY + 14;
        return (
          <g key={p.label}>
            {/* Pixel Torso */}
            <rect
              x={p.x - 22}
              y={topY + 34}
              width="44"
              height={p.h - 34}
              fill={idx === 1 ? '#5e564a' : '#4a443b'}
              stroke="#1c1916"
              strokeWidth="1.5"
            />
            {/* Pixel Head */}
            <rect
              x={p.x - 14}
              y={headY}
              width="28"
              height="24"
              fill={corrupted ? '#14090b' : '#cfc5b4'}
              stroke="#1c1916"
              strokeWidth="1.5"
            />

            {/* Face details: Normal (Act 1) vs Smudged (Act 2) vs Static Noise + Red Staples (Act 3) */}
            {!corrupted ? (
              <>
                <rect x={p.x - 7} y={headY + 8} width="4" height="4" fill="#1c1916" />
                <rect x={p.x + 3} y={headY + 8} width="4" height="4" fill="#1c1916" />
                <rect x={p.x - 4} y={headY + 17} width="8" height="2" fill="#473f36" />
                {doubt && idx === 1 && (
                  <rect
                    x={p.x - 13}
                    y={headY + 6}
                    width="26"
                    height="7"
                    fill="#141210"
                  />
                )}
              </>
            ) : (
              <g>
                {staticBlocks.map(([sx, sy], bi) => (
                  <rect
                    key={bi}
                    x={p.x - 10 + ((sx + idx * 3) % 18)}
                    y={headY + 2 + ((sy + idx * 5) % 18)}
                    width="3"
                    height="3"
                    fill={bi % 3 === 0 ? '#ff3b4e' : bi % 2 === 0 ? '#e8e2d5' : '#6e6558'}
                  />
                ))}
                {/* Red No. 12 Staple across eyes */}
                <rect
                  x={p.x - 16}
                  y={headY + 9}
                  width="32"
                  height="4"
                  fill="#d92638"
                />
              </g>
            )}

            {/* Tag beneath */}
            <text
              x={p.x}
              y="179"
              textAnchor="middle"
              fill={corrupted ? '#e06c75' : '#dfd7c8'}
              fontSize="7.5"
              fontFamily="monospace"
            >
              {p.label}
            </text>
          </g>
        );
      })}

      {/* Caption */}
      <text
        x="18"
        y="206"
        fill={corrupted ? '#e06c75' : '#c9beaa'}
        fontSize="8.5"
        fontFamily="monospace"
      >
        {corrupted
          ? lang === 'zh'
            ? 'ERR_BITMAP: 面部扇区损坏 — 检测到 4 枚 12 号红订书钉'
            : 'ERR_BITMAP: FACIAL SECTORS CORRUPTED — 4 RED STAPLES FOUND'
          : doubt
          ? lang === 'zh'
            ? '拍摄日期：198█-11-14 // 奇怪，右边那个孩子是谁？'
            : 'DATE: 198█-11-14 // Wait—who is the child on the far right?'
          : lang === 'zh'
          ? '拍摄日期：1984-10-12 // 市政档案馆地下 B 区合影留念'
          : 'DATE: 1984-10-12 // SECTOR B ARCHIVES COMMEMORATIVE PHOTO'}
      </text>
    </svg>
  );
};

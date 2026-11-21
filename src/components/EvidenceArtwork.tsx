import React, { useState } from 'react';
import { Language } from '../types';

export type EvidenceType = 'Photo_Initial' | 'CCTV_SectorB' | 'Photo_Truth';

interface EvidenceArtworkProps {
  type: EvidenceType;
  lang?: Language;
  className?: string;
  caption?: string;
}

export const EvidenceArtwork: React.FC<EvidenceArtworkProps> = ({
  type,
  lang = 'zh',
  className = '',
  caption,
}) => {
  const [imgError, setImgError] = useState(false);
  const baseUrl = import.meta.env.BASE_URL;
  const srcMap: Record<EvidenceType, string> = {
    Photo_Initial: `${baseUrl}assets/Photo_Initial.png`,
    CCTV_SectorB: `${baseUrl}assets/CCTV_SectorB.png`,
    Photo_Truth: `${baseUrl}assets/Photo_Truth.png`,
  };

  return (
    <div className={`evidence-frame ${className}`}>
      {!imgError ? (
        <img
          src={srcMap[type]}
          alt={type}
          className="evidence-img"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="evidence-svg-container">
          {type === 'Photo_Initial' && <SvgPhotoInitial lang={lang} />}
          {type === 'CCTV_SectorB' && <SvgCCTVSectorB lang={lang} />}
          {type === 'Photo_Truth' && <SvgPhotoTruth lang={lang} />}
        </div>
      )}
      {caption && <div className="evidence-caption">{caption}</div>}
    </div>
  );
};

const SvgPhotoInitial: React.FC<{ lang: Language }> = ({ lang }) => (
  <svg
    viewBox="0 0 360 250"
    className="evidence-svg"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Photo_Initial.png — Faded unevenly taped family photograph"
  >
    <defs>
      <radialGradient id="sepiaPaperVignette" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#26231f" />
        <stop offset="100%" stopColor="#141210" />
      </radialGradient>
      <linearGradient id="polaroidCardstock" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ede7da" />
        <stop offset="100%" stopColor="#d8d0c1" />
      </linearGradient>
    </defs>

    {/* Dark Desk Backdrop */}
    <rect width="360" height="250" fill="url(#sepiaPaperVignette)" />

    {/* Outer Vintage Sepia Polaroid Frame */}
    <rect
      x="38"
      y="12"
      width="284"
      height="226"
      rx="2"
      fill="url(#polaroidCardstock)"
      stroke="#8c8273"
      strokeWidth="1.2"
    />
    {/* Inner Silver-Gelatin Monochrome Photo Area */}
    <rect
      x="52"
      y="24"
      width="256"
      height="164"
      fill="#211e1a"
      stroke="#4a443c"
      strokeWidth="1"
    />

    {/* Uneven Cutout Backing Papers (Monochrome Sepia Collage) */}
    <polygon
      points="64,38 148,34 144,184 60,184"
      fill="#2e2a24"
      stroke="#6e6559"
      strokeWidth="0.9"
      strokeDasharray="3,2"
    />
    <polygon
      points="142,40 226,36 228,184 140,184"
      fill="#36312a"
      stroke="#7a7062"
      strokeWidth="0.9"
      strokeDasharray="4,2"
    />
    <polygon
      points="220,52 296,46 292,184 218,184"
      fill="#2b2722"
      stroke="#6e6559"
      strokeWidth="0.9"
      strokeDasharray="2,2"
    />

    {/* Left Figure: #209 ID-Sticker Cutout (NOT #302 — only 3 in frame) */}
    <circle cx="105" cy="82" r="20" fill="#8c8273" opacity="0.88" />
    <path d="M 74 184 C 74 130, 136 130, 136 184 Z" fill="#6b6356" opacity="0.95" />
    <rect x="86" y="138" width="20" height="10" fill="#dfd7c8" opacity="0.9" />
    <text x="88" y="146" fill="#1c1a17" fontSize="6" fontFamily="monospace" fontWeight="bold">
      #209
    </text>

    {/* Center Figure: C-14 Apron Cutout */}
    <circle cx="184" cy="86" r="19" fill="#998e7e" opacity="0.85" />
    <path d="M 154 184 C 156 134, 212 134, 214 184 Z" fill="#786f61" opacity="0.9" />
    <path
      d="M 170 136 L 198 136 L 204 182 L 164 182 Z"
      fill="none"
      stroke="#cfc6b6"
      strokeWidth="1"
      strokeDasharray="2,2"
      opacity="0.7"
    />

    {/* Right Figure: M-04 Missing Child Cutout */}
    <circle cx="256" cy="106" r="15" fill="#a69b8a" opacity="0.85" />
    <path d="M 233 184 C 235 146, 277 146, 279 184 Z" fill="#827869" opacity="0.9" />

    {/* Yellowed Translucent Scotch Tape Strips Holding Collage Together */}
    <rect
      x="131"
      y="28"
      width="22"
      height="154"
      transform="rotate(-2 142 105)"
      fill="#e6dec8"
      opacity="0.32"
      stroke="#d4c8ab"
      strokeWidth="0.7"
    />
    <rect
      x="211"
      y="42"
      width="20"
      height="140"
      transform="rotate(3 221 112)"
      fill="#e6dec8"
      opacity="0.32"
      stroke="#d4c8ab"
      strokeWidth="0.7"
    />
    {/* Corner Scotch Tape Strips */}
    <polygon points="30,30 68,10 75,23 37,43" fill="#d9ceb2" opacity="0.65" stroke="#b5a888" strokeWidth="0.6" />
    <polygon points="286,10 326,28 319,41 279,23" fill="#d9ceb2" opacity="0.65" stroke="#b5a888" strokeWidth="0.6" />
    <polygon points="34,174 72,190 66,202 28,186" fill="#d9ceb2" opacity="0.58" stroke="#b5a888" strokeWidth="0.6" />

    {/* Top Archival Label inside Photo */}
    <text x="60" y="38" fill="#cfc6b6" fontSize="7.5" fontFamily="monospace" opacity="0.85">
      {lang === 'zh'
        ? '档案相片：Family_Photo.jpg [仅3人入镜 // #209·C-14·M-04]'
        : 'FILE: Family_Photo.jpg [3 SUBJECTS: #209 · C-14 · M-04]'}
    </text>

    {/* Handwritten Charcoal Notes on Polaroid Bottom Border */}
    <text x="56" y="207" fill="#211e1a" fontSize="9.5" fontFamily="serif" fontWeight="bold">
      {lang === 'zh'
        ? '“三个人都在照片里……等等，那我在哪？”'
        : '"THREE FACES TAPED TOGETHER — WHERE AM I?"'}
    </text>
    <text x="58" y="224" fill="#595247" fontSize="8" fontFamily="monospace">
      {lang === 'zh'
        ? '《心理手册》第4节 —— 仅含 3 枚证件贴纸 [未见 #302]'
        : 'WELLNESS SEC. 4 — 3 ID STICKERS ONLY [#302 ABSENT]'}
    </text>
  </svg>
);

const SvgCCTVSectorB: React.FC<{ lang: Language }> = ({ lang }) => (
  <svg
    viewBox="0 0 360 250"
    className="evidence-svg"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="CCTV_SectorB.png — Sector B Security Snapshot at Cabinet #3"
  >
    <defs>
      <pattern id="cctvMonoScan" width="6" height="3" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="6" y2="0" stroke="#1f1717" strokeWidth="1" />
      </pattern>
    </defs>

    {/* High-Contrast Monochrome & Dried Crimson Surveillance Feed */}
    <rect width="360" height="250" fill="#0d0b0a" />
    <rect width="360" height="250" fill="url(#cctvMonoScan)" />

    {/* Corridor Perspective Lines */}
    <line x1="0" y1="30" x2="95" y2="75" stroke="#453d37" strokeWidth="1" />
    <line x1="360" y1="30" x2="265" y2="75" stroke="#453d37" strokeWidth="1" />
    <line x1="0" y1="230" x2="95" y2="178" stroke="#524840" strokeWidth="1.2" />
    <line x1="360" y1="230" x2="265" y2="178" stroke="#524840" strokeWidth="1.2" />
    <rect x="95" y="75" width="170" height="103" fill="#141110" stroke="#4a3f39" strokeWidth="1" />

    {/* Cabinet #3 */}
    <rect x="115" y="65" width="76" height="122" fill="#1c1615" stroke="#8a6b65" strokeWidth="1.5" />
    <line x1="115" y1="95" x2="191" y2="95" stroke="#594742" strokeWidth="1" />
    <line x1="115" y1="128" x2="191" y2="128" stroke="#594742" strokeWidth="1" />
    <line x1="115" y1="158" x2="191" y2="158" stroke="#594742" strokeWidth="1" />
    <text x="122" y="83" fill="#dfd7c8" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
      {lang === 'zh' ? '3号档案柜' : 'CABINET #3'}
    </text>

    {/* Open Drawer #3 with Black Ink/Tendrils & Multi-Jointed Limb */}
    <rect x="122" y="122" width="78" height="34" fill="#050303" stroke="#b33b3b" strokeWidth="1.2" />
    <ellipse cx="185" cy="194" rx="75" ry="18" fill="#070303" stroke="#6e2222" strokeWidth="1" />
    <ellipse cx="178" cy="192" rx="58" ry="11" fill="#24080a" />

    {/* Multi-jointed elongated arm reaching from Cabinet #3 */}
    <polyline
      points="146,138 175,126 198,148 225,134 246,158 260,152"
      fill="none"
      stroke="#c93b3b"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="260" y1="152" x2="269" y2="145" stroke="#e05252" strokeWidth="2" />
    <line x1="260" y1="152" x2="271" y2="153" stroke="#e05252" strokeWidth="2" />
    <line x1="260" y1="152" x2="268" y2="161" stroke="#e05252" strokeWidth="2" />

    {/* Silhouette #302 guiding #209 into Cabinet #3 */}
    <circle cx="96" cy="108" r="11" fill="#786b65" opacity="0.85" />
    <path d="M 80 185 C 80 132, 112 132, 112 185 Z" fill="#473e3a" opacity="0.9" />
    <text x="84" y="152" fill="#dfd7c8" fontSize="8" fontFamily="monospace">
      #302
    </text>

    {/* Overturned Janitorial Cart C-14 */}
    <rect
      x="252"
      y="148"
      width="62"
      height="36"
      transform="rotate(14 281 166)"
      fill="#241d1b"
      stroke="#9e8c82"
      strokeWidth="1.4"
    />
    <circle cx="258" cy="190" r="6" fill="#4a3f3b" stroke="#cfc6b6" strokeWidth="1" />
    <circle cx="298" cy="197" r="6" fill="#4a3f3b" stroke="#cfc6b6" strokeWidth="1" />
    <text x="255" y="168" fill="#dfd7c8" fontSize="7" fontFamily="monospace">
      {lang === 'zh' ? '保洁车 C-14' : 'CART C-14'}
    </text>

    {/* CCTV Monochrome HUD Overlay */}
    <rect x="10" y="10" width="340" height="230" fill="none" stroke="#786e65" strokeWidth="1" strokeDasharray="6,3" />
    <circle cx="26" cy="26" r="4.5" fill="#c93030" />
    <text x="36" y="30" fill="#dfd7c8" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
      {lang === 'zh' ? 'REC ● 监控-B03 [地下B区档案走廊]' : 'REC ● CAM-B03 [SECTOR B CORRIDOR]'}
    </text>
    <text x="235" y="30" fill="#cfc6b6" fontSize="9.5" fontFamily="monospace">
      NOV 13 23:42:19
    </text>
    <text x="18" y="228" fill="#d96b6b" fontSize="8.5" fontFamily="monospace">
      {lang === 'zh'
        ? '证物 #2：CCTV_SectorB.png —— 3号档案柜检测到多关节生物质异常'
        : 'EVIDENCE #2: CCTV_SectorB.png — ANOMALOUS BIOMASS AT CABINET #3'}
    </text>
  </svg>
);

const SvgPhotoTruth: React.FC<{ lang: Language }> = ({ lang }) => (
  <svg
    viewBox="0 0 360 250"
    className="evidence-svg"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Photo_Truth.png — Stapled badges and missing child flyer"
  >
    {/* Scorched Charcoal & Dried Blood Background */}
    <rect width="360" height="250" fill="#0d0909" />

    {/* Base Folder: Clerk #302 Personnel Record on stained cardstock */}
    <rect
      x="18"
      y="12"
      width="324"
      height="226"
      fill="#211917"
      stroke="#8a242c"
      strokeWidth="1.8"
    />
    <text x="28" y="30" fill="#d99a9e" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
      {lang === 'zh'
        ? '人事卷宗 #302 —— 3号档案柜底层 [认知滤镜已剥离]'
        : 'PERSONNEL RECORD #302 — CABINET #3 [COGNITIVE LENS BROKEN]'}
    </text>

    {/* Dried Bloodstains & Ink Blots */}
    <circle cx="135" cy="112" r="34" fill="#3d0b10" opacity="0.75" />
    <circle cx="218" cy="138" r="40" fill="#33080c" opacity="0.8" />
    <circle cx="165" cy="82" r="24" fill="#4a0d13" opacity="0.65" />

    {/* Fragment 1 (Left): #209 Arthur's Bloodied ID Badge */}
    <g transform="rotate(-4 88 118)">
      <rect
        x="34"
        y="48"
        width="104"
        height="134"
        rx="2"
        fill="#cfc6b6"
        stroke="#6e1b22"
        strokeWidth="1.5"
      />
      <rect x="40" y="54" width="92" height="18" fill="#591218" />
      <text x="44" y="66" fill="#ede7da" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
        {lang === 'zh' ? 'TCD 员工证 #209' : 'TCD STAFF ID #209'}
      </text>
      <rect x="54" y="80" width="64" height="54" fill="#261f1d" stroke="#591218" strokeWidth="1" />
      <line x1="54" y1="80" x2="118" y2="134" stroke="#b82534" strokeWidth="1.5" />
      <circle cx="96" cy="118" r="14" fill="#5e0d15" opacity="0.75" />
      <text x="64" y="110" fill="#dfd7c8" fontSize="8" fontFamily="monospace">
        [ARTHUR]
      </text>
      <text x="42" y="150" fill="#261f1d" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
        {lang === 'zh' ? '职务：高级档案员' : 'ROLE: ARCHIVIST'}
      </text>
      <text x="42" y="166" fill="#8f1520" fontSize="8" fontFamily="monospace" fontWeight="bold">
        {lang === 'zh' ? '标签：“挚友”' : 'LABEL: "BEST FRIEND"'}
      </text>
    </g>

    {/* Fragment 2 (Center): Janitor C-14 (Lin) Stained Apron Swatch & Tag */}
    <g transform="rotate(2 182 122)">
      <polygon
        points="135,46 232,52 228,184 130,180"
        fill="#bfae99"
        stroke="#6e1b22"
        strokeWidth="1.5"
      />
      <rect x="142" y="58" width="80" height="24" fill="#421014" stroke="#8a242c" strokeWidth="1" />
      <text x="146" y="69" fill="#ede7da" fontSize="7" fontFamily="monospace" fontWeight="bold">
        {lang === 'zh' ? '后勤保洁 C-14' : 'JANITOR UNIT C-14'}
      </text>
      <text x="146" y="78" fill="#d99a9e" fontSize="6.5" fontFamily="monospace">
        {lang === 'zh' ? '姓名：林氏 (夜班)' : 'NAME: LIN (NIGHT)'}
      </text>
      <path
        d="M 146 92 L 216 92 L 220 154 L 140 154 Z"
        fill="#362220"
        stroke="#6e1b22"
        strokeWidth="1"
      />
      <circle cx="182" cy="122" r="20" fill="#4f0b12" opacity="0.7" />
      <text x="146" y="122" fill="#e8e2d5" fontSize="7" fontFamily="monospace">
        {lang === 'zh' ? '染血围裙残片' : 'STAINED APRON CLOTH'}
      </text>
      <text x="146" y="168" fill="#8f1520" fontSize="8" fontFamily="monospace" fontWeight="bold">
        {lang === 'zh' ? '标签：“我的妻子”' : 'LABEL: "MY WIFE"'}
      </text>
    </g>

    {/* Fragment 3 (Right): Missing Child Flyer Case M-04 */}
    <g transform="rotate(-3 276 124)">
      <rect
        x="226"
        y="50"
        width="98"
        height="132"
        fill="#dbd2c2"
        stroke="#594f43"
        strokeWidth="1.5"
        strokeDasharray="5,2"
      />
      <rect x="232" y="56" width="86" height="18" fill="#2b2623" />
      <text x="236" y="68" fill="#ede7da" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
        {lang === 'zh' ? '寻人启事：M-04' : 'MISSING: CASE M-04'}
      </text>
      <rect x="247" y="82" width="56" height="50" fill="#1c1917" stroke="#594f43" strokeWidth="1" />
      <circle cx="275" cy="101" r="10" fill="#786f65" />
      <path d="M 258 130 C 258 112, 292 112, 292 130 Z" fill="#786f65" />
      <text x="235" y="148" fill="#38322c" fontSize="7" fontFamily="monospace">
        {lang === 'zh' ? '三年前悬案剪报' : 'COLD CASE CLIPPING'}
      </text>
      <text x="235" y="166" fill="#8f1520" fontSize="8" fontFamily="monospace" fontWeight="bold">
        {lang === 'zh' ? '标签：“我的女儿”' : 'LABEL: "DAUGHTER"'}
      </text>
    </g>

    {/* Heavy Crimson-Stained Iron Staples Brutally Pinning All 3 Items Together */}
    <g>
      <rect x="122" y="74" width="28" height="5.5" fill="#b81d2a" stroke="#e8e2d5" strokeWidth="0.6" />
      <rect x="120" y="72" width="4" height="9.5" fill="#4a070d" />
      <rect x="148" y="72" width="4" height="9.5" fill="#4a070d" />
    </g>
    <g transform="rotate(12 136 146)">
      <rect x="122" y="143" width="28" height="5.5" fill="#b81d2a" stroke="#e8e2d5" strokeWidth="0.6" />
      <rect x="120" y="141" width="4" height="9.5" fill="#4a070d" />
      <rect x="148" y="141" width="4" height="9.5" fill="#4a070d" />
    </g>
    <g transform="rotate(-8 228 88)">
      <rect x="214" y="85" width="28" height="5.5" fill="#b81d2a" stroke="#e8e2d5" strokeWidth="0.6" />
      <rect x="212" y="83" width="4" height="9.5" fill="#4a070d" />
      <rect x="240" y="83" width="4" height="9.5" fill="#4a070d" />
    </g>
    <g transform="rotate(6 226 152)">
      <rect x="212" y="149" width="28" height="5.5" fill="#b81d2a" stroke="#e8e2d5" strokeWidth="0.6" />
      <rect x="210" y="147" width="4" height="9.5" fill="#4a070d" />
      <rect x="238" y="147" width="4" height="9.5" fill="#4a070d" />
    </g>

    {/* Yellowing Masking Tape Strips on Stapled Truth Collage */}
    <polygon points="24,38 72,18 79,30 31,50" fill="#dfd2ad" opacity="0.62" stroke="#9e906c" strokeWidth="0.7" />
    <polygon points="282,168 330,148 336,160 288,180" fill="#dfd2ad" opacity="0.58" stroke="#9e906c" strokeWidth="0.7" />

    {/* Bottom Caption */}
    <text x="28" y="206" fill="#e06670" fontSize="9" fontFamily="monospace" fontWeight="bold">
      {lang === 'zh'
        ? '证物 #3：Photo_Truth.png —— 仅含 3 人：#209 + C-14 + M-04'
        : 'EVIDENCE #3: Photo_Truth.png — 3 SUBJECTS BOUND (#302 NOT IN FRAME)'}
    </text>
    <text x="28" y="222" fill="#b87a7e" fontSize="7.5" fontFamily="monospace">
      {lang === 'zh'
        ? '#209 Arthur 工牌 + C-14 林氏围裙名牌 + M-04 寻人传单（订书钉与胶带封存）'
        : '#209 ARTHUR ID + C-14 LIN APRON TAG + M-04 MISSING GIRL (STAPLED & TAPED)'}
    </text>
  </svg>
);

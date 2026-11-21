import * as THREE from 'three';
import { ActStage, Language } from '../types';

function addLowResGrain(ctx: CanvasRenderingContext2D, w: number, h: number, alpha = 0.05) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const delta = (Math.random() - 0.5) * 255 * alpha;
    data[i] = Math.min(255, Math.max(0, data[i] + delta));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + delta));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + delta));
  }
  ctx.putImageData(imgData, 0, 0);
}

function finalizeTexture(canvas: HTMLCanvasElement, nearest = true): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = nearest ? THREE.NearestFilter : THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

export function createWalnutDeskTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1f1813';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle wood grain lines
  for (let y = 0; y < 256; y += 2) {
    ctx.fillStyle = y % 6 === 0 ? 'rgba(14, 10, 7, 0.38)' : 'rgba(46, 35, 27, 0.22)';
    ctx.fillRect(0, y, 256, 1 + (y % 3 === 0 ? 1 : 0));
  }

  addLowResGrain(ctx, 256, 256, 0.06);
  return finalizeTexture(canvas, true);
}

export function createLoopingCalendarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Aged desk calendar paper
  ctx.fillStyle = '#e5dcc7';
  ctx.fillRect(0, 0, 256, 256);

  // Header strip
  ctx.fillStyle = '#7c2428';
  ctx.fillRect(10, 10, 236, 42);
  ctx.fillStyle = '#f2ead8';
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('NOV // 1984', 128, 38);

  // 5x4 grid of repeating crossed-out "11/13" cells
  const cols = 5;
  const rows = 4;
  const startX = 12;
  const startY = 62;
  const cw = 46;
  const ch = 44;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * cw;
      const y = startY + r * ch;
      ctx.strokeStyle = '#6c6252';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, cw, ch);

      // Printed date crossed out
      ctx.fillStyle = '#4e463b';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(String(r * cols + c + 1), x + 4, y + 13);

      // Dense ballpoint/red cross-outs + repeated "11/13"
      ctx.strokeStyle = (r + c) % 3 === 0 ? '#8c1d24' : '#1b2c4e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 3, y + 4);
      ctx.lineTo(x + cw - 3, y + ch - 4);
      ctx.moveTo(x + cw - 3, y + 4);
      ctx.lineTo(x + 3, y + ch - 4);
      ctx.stroke();

      ctx.fillStyle = (r + c) % 2 === 0 ? '#18294a' : '#851820';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('11/13', x + 5, y + 34);
    }
  }

  addLowResGrain(ctx, 256, 256, 0.06);
  return finalizeTexture(canvas, true);
}

export function createStickyNoteTexture(variant: 0 | 1 | 2): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const bgColors = ['#e8db8e', '#e3d17e', '#eadf9b'];
  ctx.fillStyle = bgColors[variant];
  ctx.fillRect(0, 0, 128, 128);

  // Subtle top adhesive band
  ctx.fillStyle = 'rgba(180, 162, 92, 0.35)';
  ctx.fillRect(0, 0, 128, 22);

  ctx.fillStyle = '#1b2a4a';
  ctx.font = 'bold 15px monospace';
  if (variant === 0) {
    ctx.fillText('11/13', 14, 46);
    ctx.fillText('CHECK #03', 14, 72);
    ctx.fillText('AGAIN?', 14, 98);
  } else if (variant === 1) {
    ctx.fillText('CALL #209', 14, 48);
    ctx.fillText('COFFEE', 14, 74);
    ctx.fillText('NO REPLY', 14, 100);
  } else {
    ctx.fillText('ONLY 3', 14, 46);
    ctx.fillText('IN PHOTO', 14, 72);
    ctx.fillStyle = '#7c1a22';
    ctx.fillText('#302 ???', 14, 98);
  }

  addLowResGrain(ctx, 128, 128, 0.06);
  return finalizeTexture(canvas, true);
}

export function createNameplateTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#c8bfb0';
  ctx.fillRect(0, 0, 256, 64);

  ctx.strokeStyle = '#3b352d';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 56);

  // Corner rivets
  ctx.fillStyle = '#2b2620';
  [
    [12, 12],
    [244, 12],
    [12, 52],
    [244, 52],
  ].forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#1a1714';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TCD-302', 128, 33);

  addLowResGrain(ctx, 256, 64, 0.05);
  return finalizeTexture(canvas, true);
}

export function createMonitorScreenCanvasTexture(
  actStage: ActStage,
  lensBroken: boolean,
  _lang: Language,
  endingChoice: 'A' | 'B' | null = null,
  _endingARedactedCount = 0
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  // Clean phosphor backdrop matching the live projected TCD-OS wallpaper
  // (No static placeholder text — the live TcdOsDesktop stays projected over the screen)
  if (endingChoice === 'B') {
    ctx.fillStyle = '#030203';
    ctx.fillRect(0, 0, 256, 160);
  } else if (lensBroken && actStage === 3) {
    const grad = ctx.createLinearGradient(0, 0, 0, 160);
    grad.addColorStop(0, '#7ec8ff');
    grad.addColorStop(0.58, '#fff9d6');
    grad.addColorStop(1, '#ffe4ef');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 160);
  } else if (lensBroken && actStage >= 4) {
    ctx.fillStyle = '#18090c';
    ctx.fillRect(0, 0, 256, 160);
  } else if (actStage === 2) {
    ctx.fillStyle = '#133336';
    ctx.fillRect(0, 0, 256, 160);
  } else {
    ctx.fillStyle = '#008080';
    ctx.fillRect(0, 0, 256, 160);
  }

  // Subtle scanlines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
  for (let y = 0; y < 160; y += 3) {
    ctx.fillRect(0, y, 256, 1);
  }

  return finalizeTexture(canvas, false);
}

export function createManualCoverTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 340;
  const ctx = canvas.getContext('2d')!;

  // Dark bureaucratic charcoal-slate booklet cover
  ctx.fillStyle = '#26231f';
  ctx.fillRect(0, 0, 256, 340);

  // Spine binding strip on left
  ctx.fillStyle = '#141210';
  ctx.fillRect(0, 0, 26, 340);

  // Cream border frame
  ctx.strokeStyle = '#c8bfb0';
  ctx.lineWidth = 3;
  ctx.strokeRect(38, 22, 198, 296);

  // Header box
  ctx.fillStyle = '#dfd7c8';
  ctx.fillRect(50, 42, 174, 52);
  ctx.fillStyle = '#181613';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TCD MANUAL', 137, 66);
  ctx.font = 'bold 12px monospace';
  ctx.fillText('RULES 01 - 03', 137, 84);

  // Emblem seal
  ctx.strokeStyle = '#c8bfb0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(137, 175, 42, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#dfd7c8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('DEPT. 302', 137, 180);

  ctx.font = '12px monospace';
  ctx.fillStyle = '#a89f90';
  ctx.fillText('STANDARD OPERATING', 137, 265);
  ctx.fillText('PROTOCOL PAMPHLET', 137, 283);

  addLowResGrain(ctx, 256, 340, 0.06);
  return finalizeTexture(canvas, true);
}

export function createDossierFolderTexture(
  num: '#01' | '#02' | '#03' | '#04' | '#05',
  status: 'normal' | 'locked' | 'decrypted' | 'complete'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 340;
  const ctx = canvas.getContext('2d')!;

  // Manila Kraft Paper Base (distinct subtle tones per dossier)
  const bgMap: Record<string, string> = {
    '#01': '#cbbba0',
    '#02': '#c2b297',
    '#03': '#b8a68a',
    '#04': '#b3a792',
    '#05': '#a69688',
  };
  ctx.fillStyle = bgMap[num] ?? '#cbbba0';
  ctx.fillRect(0, 0, 256, 340);

  // Folder border & lines
  ctx.strokeStyle = num === '#05' ? '#6e2328' : '#5c5243';
  ctx.lineWidth = 3;
  ctx.strokeRect(12, 12, 232, 316);

  // Top right large printed File Number (#01 ~ #05)
  ctx.fillStyle = num === '#05' ? '#4a1216' : '#1c1916';
  ctx.fillRect(142, 24, 90, 48);
  ctx.fillStyle = '#e8e2d5';
  ctx.font = 'bold 34px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(num, 187, 59);

  // Archival classification stamp bar
  ctx.textAlign = 'left';
  ctx.fillStyle = '#2b2620';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(num === '#05' ? 'MUNICIPAL SEAL LEDGER' : 'TCD ARCHIVE DOSSIER', 26, 112);

  ctx.strokeStyle = '#786c5b';
  ctx.lineWidth = 1.5;
  for (let y = 138; y <= 238; y += 25) {
    ctx.beginPath();
    ctx.moveTo(26, y);
    ctx.lineTo(226, y);
    ctx.stroke();
  }

  // Stamp at bottom
  if (status === 'locked') {
    ctx.strokeStyle = '#7a2020';
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 262, 192, 38);
    ctx.fillStyle = '#7a2020';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LOCKED // 0/1', 128, 286);
  } else if (status === 'complete') {
    ctx.strokeStyle = '#1f1c18';
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 262, 192, 38);
    ctx.fillStyle = '#1f1c18';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NORMALIZED', 128, 286);
  } else if (status === 'decrypted') {
    ctx.strokeStyle = '#8a242c';
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 262, 192, 38);
    ctx.fillStyle = '#8a242c';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DECRYPTED', 128, 286);
  }

  addLowResGrain(ctx, 256, 340, 0.07);
  return finalizeTexture(canvas, true);
}

export function createPolaroidCanvasTexture(lensBroken: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;

  if (!lensBroken) {
    // Warm sepia Polaroid frame — 3 ID-sticker cutouts taped together (#209, C-14, M-04; NO #302)
    ctx.fillStyle = '#e6decb';
    ctx.fillRect(0, 0, 256, 300);

    // Inner dark sepia photograph area
    ctx.fillStyle = '#211e1a';
    ctx.fillRect(18, 18, 220, 206);

    // 3 uneven ID-sticker cutout backing strips
    ctx.fillStyle = '#332d26';
    ctx.fillRect(24, 28, 66, 186);
    ctx.fillStyle = '#3c352d';
    ctx.fillRect(94, 24, 68, 190);
    ctx.fillStyle = '#2c2722';
    ctx.fillRect(166, 34, 64, 180);

    // Left: #209 Arthur ID cutout (subtle lapel tag, NOT #302)
    ctx.fillStyle = '#9e9281';
    ctx.beginPath();
    ctx.arc(57, 86, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(34, 112, 46, 98);
    ctx.fillStyle = '#dfd7c8';
    ctx.fillRect(41, 134, 24, 11);
    ctx.fillStyle = '#241f1a';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('#209', 43, 142);

    // Center: C-14 Lin cutout (subtle apron strap silhouette)
    ctx.fillStyle = '#a89d8c';
    ctx.beginPath();
    ctx.arc(128, 92, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(105, 116, 46, 94);
    ctx.strokeStyle = '#d6ccb8';
    ctx.lineWidth = 2;
    ctx.strokeRect(114, 134, 28, 54);

    // Right: M-04 Missing Girl cutout (smaller clipped corner portrait)
    ctx.fillStyle = '#b5aa98';
    ctx.beginPath();
    ctx.arc(198, 114, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(178, 134, 40, 76);

    // Yellowing Scotch Tape Strips across seams & corners
    ctx.fillStyle = 'rgba(225, 212, 178, 0.45)';
    ctx.fillRect(86, 22, 14, 194);
    ctx.fillRect(158, 28, 14, 188);
    ctx.fillRect(22, 24, 34, 12);

    // Bottom Polaroid handwritten note emphasizing 3 subjects
    ctx.fillStyle = '#24201b';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Family_Photo.jpg', 128, 250);
    ctx.font = '10.5px monospace';
    ctx.fillStyle = '#595146';
    ctx.fillText('3 SUBJECTS: #209 · C-14 · M-04', 128, 274);
  } else {
    // Broken Lens: #209 Arthur ID + C-14 Lin Apron + M-04 Flyer bound by crimson staples & tape
    ctx.fillStyle = '#241416';
    ctx.fillRect(0, 0, 256, 300);

    ctx.fillStyle = '#120708';
    ctx.fillRect(14, 14, 228, 214);

    // Dried dark stains
    ctx.fillStyle = '#4f0c13';
    ctx.beginPath();
    ctx.arc(95, 115, 42, 0, Math.PI * 2);
    ctx.arc(165, 135, 46, 0, Math.PI * 2);
    ctx.fill();

    // Left: #209 Arthur ID Badge
    ctx.fillStyle = '#cfc6b6';
    ctx.fillRect(22, 36, 66, 150);
    ctx.fillStyle = '#6e141c';
    ctx.fillRect(26, 42, 58, 18);
    ctx.fillStyle = '#1c1615';
    ctx.font = 'bold 10.5px monospace';
    ctx.fillText('#209 ARTHUR', 24, 85);

    // Center: C-14 Lin Apron Tag
    ctx.fillStyle = '#bfae99';
    ctx.fillRect(94, 32, 68, 156);
    ctx.fillStyle = '#591016';
    ctx.fillRect(98, 40, 60, 18);
    ctx.fillStyle = '#1c1615';
    ctx.fillText('C-14 LIN', 102, 85);

    // Right: M-04 Missing Girl Flyer
    ctx.fillStyle = '#dbd2c2';
    ctx.fillRect(168, 38, 66, 148);
    ctx.fillStyle = '#26211e';
    ctx.fillRect(172, 44, 58, 18);
    ctx.fillStyle = '#1c1615';
    ctx.fillText('M-04 GIRL', 173, 85);

    // Yellowing Masking Tape Strips
    ctx.fillStyle = 'rgba(218, 202, 158, 0.5)';
    ctx.fillRect(18, 26, 48, 14);
    ctx.fillRect(188, 174, 48, 14);

    // Heavy Crimson Staples
    ctx.fillStyle = '#d92638';
    ctx.fillRect(76, 68, 28, 7);
    ctx.fillRect(78, 142, 28, 7);
    ctx.fillRect(152, 76, 28, 7);
    ctx.fillRect(150, 148, 28, 7);

    ctx.fillStyle = '#e06c75';
    ctx.font = 'bold 13.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Photo_Truth.png', 128, 250);
    ctx.font = '10px monospace';
    ctx.fillText('3 BOUND — #302 NOT IN FRAME', 128, 274);
  }

  addLowResGrain(ctx, 256, 300, 0.06);
  return finalizeTexture(canvas, true);
}

export function createLunchboxNoteTexture(lensBroken: boolean, lang: Language): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  if (!lensBroken) {
    ctx.fillStyle = '#ede3c8';
    ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = '#9e9070';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 120);

    ctx.fillStyle = '#26211b';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      lang === 'zh' ? '“亲爱的，好好吃饭”' : '"Eat well, dear."',
      128,
      58
    );
    ctx.font = '14px monospace';
    ctx.fillStyle = '#5c5243';
    ctx.fillText('— C-14', 128, 92);
  } else {
    ctx.fillStyle = '#2b1616';
    ctx.fillRect(0, 0, 256, 128);
    // Shredded paper & red staples
    ctx.fillStyle = '#9e9482';
    ctx.fillRect(18, 20, 90, 28);
    ctx.fillRect(120, 44, 110, 30);
    ctx.fillRect(40, 78, 130, 26);

    ctx.strokeStyle = '#d92b38';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(60, 30);
    ctx.lineTo(85, 45);
    ctx.moveTo(150, 55);
    ctx.lineTo(180, 40);
    ctx.stroke();
  }

  addLowResGrain(ctx, 256, 128, 0.06);
  return finalizeTexture(canvas, true);
}

export function createPartitionGlassTexture(lensBroken: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (!lensBroken) {
    // Frosted ribbed warm glass
    const grad = ctx.createRadialGradient(256, 140, 20, 256, 140, 240);
    grad.addColorStop(0, '#4a4236');
    grad.addColorStop(0.5, '#2b2620');
    grad.addColorStop(1, '#181512');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Warm desk lamp glow from adjacent Desk #209
    const lampGrad = ctx.createRadialGradient(210, 150, 8, 210, 150, 90);
    lampGrad.addColorStop(0, 'rgba(235, 208, 152, 0.55)');
    lampGrad.addColorStop(1, 'rgba(235, 208, 152, 0)');
    ctx.fillStyle = lampGrad;
    ctx.fillRect(0, 0, 512, 256);

    // Vertical ribbed frosted stripes
    for (let x = 0; x < 512; x += 8) {
      ctx.fillStyle = x % 16 === 0 ? 'rgba(255,250,240,0.06)' : 'rgba(0,0,0,0.18)';
      ctx.fillRect(x, 0, 4, 256);
    }
  } else {
    // Pitch-black hollow basement void with jagged glass cracks
    ctx.fillStyle = '#050404';
    ctx.fillRect(0, 0, 512, 256);

    for (let x = 0; x < 512; x += 8) {
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(x, 0, 3, 256);
    }

    // Cracks
    ctx.strokeStyle = '#8c7d75';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(240, 0);
    ctx.lineTo(220, 85);
    ctx.lineTo(265, 145);
    ctx.lineTo(210, 256);
    ctx.moveTo(220, 85);
    ctx.lineTo(130, 140);
    ctx.lineTo(75, 210);
    ctx.moveTo(265, 145);
    ctx.lineTo(360, 110);
    ctx.lineTo(430, 195);
    ctx.stroke();
  }

  addLowResGrain(ctx, 512, 256, 0.05);
  return finalizeTexture(canvas, true);
}

export function createCabinetLabelTexture(
  code: string,
  locked: boolean
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Brass holder rim
  ctx.fillStyle = '#5c533c';
  ctx.fillRect(0, 0, 160, 64);

  // Aged cream paper card insert
  ctx.fillStyle = locked ? '#d4c9b2' : '#e4dbc6';
  ctx.fillRect(8, 8, 144, 48);

  ctx.strokeStyle = '#332f28';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 140, 44);

  ctx.fillStyle = '#181a17';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(code, 80, locked ? 24 : 33);

  if (locked) {
    ctx.fillStyle = '#851b22';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('[LOCKED]', 80, 44);
  }

  addLowResGrain(ctx, 160, 64, 0.05);
  return finalizeTexture(canvas, true);
}

export function createTapeDeckFaceTexture(isPlaying: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  // Brushed dark aluminum plate
  ctx.fillStyle = '#6d726f';
  ctx.fillRect(0, 0, 256, 160);
  ctx.strokeStyle = '#242725';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 152);

  // Left speaker grille dot grid
  ctx.fillStyle = '#1b1d1c';
  for (let y = 20; y <= 136; y += 11) {
    for (let x = 18; x <= 104; x += 11) {
      ctx.fillRect(x, y, 5, 5);
    }
  }

  // Model plate & playback status strip on right side
  ctx.fillStyle = '#1d201f';
  ctx.fillRect(122, 18, 118, 30);
  ctx.fillStyle = '#d4d8d0';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('TCD-REC 84', 132, 38);

  ctx.fillStyle = isPlaying ? '#1b3620' : '#262928';
  ctx.fillRect(122, 114, 118, 28);
  ctx.fillStyle = isPlaying ? '#7cf08d' : '#b2b8b0';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(isPlaying ? '>> PLAYING' : '|| STOPPED', 136, 132);

  addLowResGrain(ctx, 256, 160, 0.06);
  return finalizeTexture(canvas, true);
}

export function createConcreteWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Muted institutional basement plaster / painted cinderblock
  ctx.fillStyle = '#2d312c';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = 'rgba(18, 20, 18, 0.42)';
  ctx.lineWidth = 2;
  for (let row = 0; row < 8; row++) {
    const y = row * 32;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();

    const offset = row % 2 === 0 ? 0 : 32;
    for (let x = offset; x < 256; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 32);
      ctx.stroke();
    }
  }

  addLowResGrain(ctx, 256, 256, 0.07);
  return finalizeTexture(canvas, true);
}

export function createBasementTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1f221f';
  ctx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y += 64) {
    for (let x = 0; x < 256; x += 64) {
      const checker = ((x + y) / 64) % 2 === 0;
      ctx.fillStyle = checker ? '#232723' : '#1c201d';
      ctx.fillRect(x + 2, y + 2, 60, 60);
    }
  }

  addLowResGrain(ctx, 256, 256, 0.06);
  return finalizeTexture(canvas, true);
}

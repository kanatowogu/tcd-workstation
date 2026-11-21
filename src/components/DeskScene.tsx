import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ActStage, DeskFileId, FocusTarget, Language } from '../types';
import {
  createBasementTileTexture,
  createConcreteWallTexture,
  createMonitorScreenCanvasTexture,
  createNameplateTexture,
  createPartitionGlassTexture,
  createWalnutDeskTexture,
} from '../utils/canvasTextures';
import {
  CoffeeMugMesh,
  DeskCalendarMesh,
  DeskClutterGroup,
  DossierFolderMesh,
  FilingCabinetMesh,
  InteractableProp,
  LunchboxMesh,
  ManualBookletMesh,
  PolaroidPhotoMesh,
  TapeRecorderMesh,
  VintageDeskLampMesh,
} from './InteractableProp';

interface DeskSceneProps {
  lang: Language;
  actStage: ActStage;
  focusTarget: FocusTarget;
  lensBroken: boolean;
  endingChoice: 'A' | 'B' | null;
  endingARedactedCount: number;
  brightness: number;
  drawerLocks: [boolean, boolean, boolean];
  openDrawers: [boolean, boolean, boolean];
  isTapePlaying: boolean;
  isDeskLampOn: boolean;
  activeDeskFiles: DeskFileId[];
  screenOverlayRef: React.RefObject<HTMLDivElement>;
  onSelectFocus: (target: FocusTarget) => void;
  onDeskFileClick: (fileId: DeskFileId) => void;
  onToggleDrawer: (index: 0 | 1 | 2) => void;
  onLockedDrawerRattle: (index: 1 | 2) => void;
  onInspectDrawerFolder: (fileId: DeskFileId) => void;
  onToggleTape: () => void;
  onInspectPlant: () => void;
  onToggleDeskLamp: () => void;
  onInspectCalendar: () => void;
  onHoverPropChange: (label: string | null) => void;
}

// World-space constants for the CRT screen plane (centered on monitor front face)
const MONITOR_GROUP_POS: [number, number, number] = [0, 0.76, -0.18];
const SCREEN_LOCAL_Y = 0.435;
const SCREEN_LOCAL_Z = 0.158;
const SCREEN_WORLD_Y = MONITOR_GROUP_POS[1] + SCREEN_LOCAL_Y; // 1.195
const SCREEN_WORLD_Z = MONITOR_GROUP_POS[2] + SCREEN_LOCAL_Z; // -0.022
const SCREEN_W = 0.78;
const SCREEN_H = 0.46;

const CRT_VIRTUAL_W = 1024;
const CRT_VIRTUAL_H = 604;

/* ============================================================================
   CAMERA CONTROLLER: 80–85% CRT VIEWPORT TAKEOVER + EXACT 3D HOMOGRAPHY
   ============================================================================ */
const CameraController: React.FC<{
  focusTarget: FocusTarget;
  screenOverlayRef: React.RefObject<HTMLDivElement>;
}> = ({ focusTarget, screenOverlayRef }) => {
  const targetPos = useMemo(() => new THREE.Vector3(0, 1.48, 2.12), []);
  const currentLookAt = useMemo(() => new THREE.Vector3(0, 1.06, -0.15), []);
  const desiredLookAt = useMemo(() => new THREE.Vector3(0, 1.06, -0.15), []);
  const tlVec = useMemo(() => new THREE.Vector3(), []);
  const trVec = useMemo(() => new THREE.Vector3(), []);
  const blVec = useMemo(() => new THREE.Vector3(), []);
  const brVec = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const speed = Math.min(1, delta * 5.8);
    const swayX = state.pointer.x * 0.075;
    const swayY = state.pointer.y * 0.048;

    if (focusTarget === 'monitor') {
      const fovRad =
        ((state.camera as THREE.PerspectiveCamera).fov * Math.PI) / 180;
      const halfTan = Math.tan(fovRad / 2);
      const aspect = state.size.width / Math.max(1, state.size.height);

      // Compute distance so CRT screen fills ~80–84% of viewport while keeping
      // slim plastic bezel, power LED, nameplate, and desk edge visible
      const distV = SCREEN_H / 0.805 / (2 * halfTan);
      const distH = SCREEN_W / 0.84 / (2 * halfTan * aspect);
      const dist = Math.max(distV, distH);

      targetPos.set(
        swayX * 0.02,
        SCREEN_WORLD_Y - 0.024 + swayY * 0.015,
        SCREEN_WORLD_Z + dist
      );
      desiredLookAt.set(
        swayX * 0.012,
        SCREEN_WORLD_Y - 0.024 + swayY * 0.012,
        SCREEN_WORLD_Z
      );
    } else if (focusTarget === 'partition') {
      targetPos.set(swayX * 0.25, 1.66 + swayY * 0.2, 0.55);
      desiredLookAt.set(swayX * 0.2, 1.64 + swayY * 0.15, -0.82);
    } else {
      targetPos.set(swayX, 1.48 + swayY, 2.12);
      desiredLookAt.set(swayX * 1.15, 1.05 + swayY * 0.9, -0.15);
    }

    state.camera.position.lerp(targetPos, speed);
    currentLookAt.lerp(desiredLookAt, speed);
    state.camera.lookAt(currentLookAt);

    // Project all 4 world corners of the 3D CRT plane -> exact CSS matrix3d homography
    const overlayEl = screenOverlayRef.current;
    if (overlayEl) {
      const isHoldingProp =
        focusTarget === 'prop_lunchbox' ||
        focusTarget === 'prop_mug' ||
        focusTarget === 'polaroid';

      state.camera.updateMatrixWorld();
      tlVec
        .set(-SCREEN_W / 2, SCREEN_WORLD_Y + SCREEN_H / 2, SCREEN_WORLD_Z)
        .project(state.camera);
      trVec
        .set(SCREEN_W / 2, SCREEN_WORLD_Y + SCREEN_H / 2, SCREEN_WORLD_Z)
        .project(state.camera);
      blVec
        .set(-SCREEN_W / 2, SCREEN_WORLD_Y - SCREEN_H / 2, SCREEN_WORLD_Z)
        .project(state.camera);
      brVec
        .set(SCREEN_W / 2, SCREEN_WORLD_Y - SCREEN_H / 2, SCREEN_WORLD_Z)
        .project(state.camera);

      const inFront =
        tlVec.z < 1 && trVec.z < 1 && blVec.z < 1 && brVec.z < 1;
      const rect = state.gl.domElement.getBoundingClientRect();

      const x0 = rect.left + (tlVec.x * 0.5 + 0.5) * rect.width;
      const y0 = rect.top + (-tlVec.y * 0.5 + 0.5) * rect.height;
      const x1 = rect.left + (trVec.x * 0.5 + 0.5) * rect.width;
      const y1 = rect.top + (-trVec.y * 0.5 + 0.5) * rect.height;
      const x2 = rect.left + (blVec.x * 0.5 + 0.5) * rect.width;
      const y2 = rect.top + (-blVec.y * 0.5 + 0.5) * rect.height;
      const x3 = rect.left + (brVec.x * 0.5 + 0.5) * rect.width;
      const y3 = rect.top + (-brVec.y * 0.5 + 0.5) * rect.height;

      const dx1 = x1 - x3;
      const dy1 = y1 - y3;
      const dx2 = x2 - x3;
      const dy2 = y2 - y3;
      const sx = x0 - x1 - x2 + x3;
      const sy = y0 - y1 - y2 + y3;
      const det = dx1 * dy2 - dx2 * dy1;

      const quadW = Math.hypot(x1 - x0, y1 - y0);
      const quadH = Math.hypot(x2 - x0, y2 - y0);

      if (
        inFront &&
        Math.abs(det) > 1e-3 &&
        quadW > 8 &&
        quadH > 8 &&
        !isHoldingProp
      ) {
        const g = (sx * dy2 - sy * dx2) / det;
        const h = (dx1 * sy - dy1 * sx) / det;

        const a = x1 - x0 + g * x1;
        const d = y1 - y0 + g * y1;
        const b = x2 - x0 + h * x2;
        const e = y2 - y0 + h * y2;
        const c = x0;
        const f = y0;

        const m11 = a / CRT_VIRTUAL_W;
        const m12 = d / CRT_VIRTUAL_W;
        const m14 = g / CRT_VIRTUAL_W;
        const m21 = b / CRT_VIRTUAL_H;
        const m22 = e / CRT_VIRTUAL_H;
        const m24 = h / CRT_VIRTUAL_H;

        overlayEl.style.transform = `matrix3d(${m11.toFixed(7)}, ${m12.toFixed(7)}, 0, ${m14.toFixed(9)}, ${m21.toFixed(7)}, ${m22.toFixed(7)}, 0, ${m24.toFixed(9)}, 0, 0, 1, 0, ${c.toFixed(3)}, ${f.toFixed(3)}, 0, 1)`;
        overlayEl.style.visibility = 'visible';
        overlayEl.style.opacity = '1';

        const distToGoal = state.camera.position.distanceTo(targetPos);
        const interactive = focusTarget === 'monitor' && distToGoal < 0.28;
        overlayEl.style.pointerEvents = interactive ? 'auto' : 'none';
      } else {
        overlayEl.style.opacity = '0';
        overlayEl.style.pointerEvents = 'none';
        overlayEl.style.visibility = 'hidden';
      }
    }
  });

  return null;
};

/* ============================================================================
   RENDERER EXPOSURE CONTROLLER
   ============================================================================ */
const ExposureController: React.FC<{ brightness: number }> = ({ brightness }) => {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    gl.toneMappingExposure = 1.05 * brightness;
  }, [gl, brightness]);

  return null;
};

/* ============================================================================
   LIGHTING RIG:
   - ACT 1–2: Grounded 1980s–90s Municipal Basement Fluorescent Realism (Exit 8)
   - ACT 3: Unnaturally Warm "Cozy Home / Birthday Party" Pastel Inversion
   ============================================================================ */
const OfficeAndDiscoLighting: React.FC<{
  lensBroken: boolean;
  endingChoice: 'A' | 'B' | null;
  endingARedactedCount: number;
  brightness: number;
}> = ({ lensBroken, endingChoice, endingARedactedCount, brightness }) => {
  const partyGroupRef = useRef<THREE.Group>(null);
  const overheadSpotRef = useRef<THREE.SpotLight>(null);
  const brokenTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    if (lensBroken) {
      brokenTimestampRef.current = performance.now();
    } else {
      brokenTimestampRef.current = null;
    }
  }, [lensBroken]);

  // Branch A redactions progressively extinguish Party Beams (Rose -> Cyan -> Gold)
  // Branch B freezes beams across the office
  const roseOn =
    lensBroken && (endingChoice !== 'A' || endingARedactedCount < 1);
  const cyanOn =
    lensBroken && (endingChoice !== 'A' || endingARedactedCount < 2);
  const peachGoldOn =
    lensBroken &&
    endingChoice !== 'B' &&
    (endingChoice !== 'A' || endingARedactedCount < 3);

  const activeBeams =
    (roseOn ? 1 : 0) + (cyanOn ? 1 : 0) + (peachGoldOn ? 1 : 0);
  const cozyFactor = lensBroken ? activeBeams / 3 : 0;
  const restoredFluorescent =
    endingChoice === 'A' && endingARedactedCount === 3
      ? 1
      : 1 - cozyFactor * 0.25;

  useFrame((_, delta) => {
    if (partyGroupRef.current && cozyFactor > 0 && endingChoice !== 'B') {
      const rotSpeed = 0.62 * cozyFactor;
      partyGroupRef.current.rotation.y += delta * rotSpeed;
    }

    if (overheadSpotRef.current) {
      if (lensBroken && brokenTimestampRef.current !== null) {
        const elapsedMs = performance.now() - brokenTimestampRef.current;
        if (elapsedMs < 650) {
          const glitch =
            (elapsedMs > 80 && elapsedMs < 180) ||
            (elapsedMs > 320 && elapsedMs < 440);
          overheadSpotRef.current.intensity = (glitch ? 0.35 : 4.2) * brightness;
          return;
        }
      }
      const targetIntensity = lensBroken
        ? 4.1 * brightness
        : 3.2 * restoredFluorescent * brightness;
      overheadSpotRef.current.intensity = THREE.MathUtils.lerp(
        overheadSpotRef.current.intensity,
        targetIntensity,
        delta * 4
      );
    }
  });

  return (
    <>
      <ambientLight
        intensity={(cozyFactor > 0 ? 0.82 : 0.48) * brightness}
        color={cozyFactor > 0 ? '#ffd699' : '#d8dfd5'}
      />

      {/* Overhead Office Fluorescent (Act 1–2) vs Warm Golden-Amber Cozy Glow (Act 3) */}
      <spotLight
        ref={overheadSpotRef}
        position={[0.05, 2.68, 0.32]}
        angle={0.88}
        penumbra={0.55}
        intensity={3.2 * brightness}
        distance={7.5}
        color={cozyFactor > 0 ? '#ffc266' : '#eef2e6'}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Warm Desk Lamp Glow from Adjacent Desk #209 Behind Frosted Partition */}
      {!lensBroken && (
        <pointLight
          position={[-0.25, 1.65, -1.15]}
          intensity={1.35 * brightness}
          distance={3.0}
          color="#f5d18c"
        />
      )}

      {/* Act 3 "Cozy Home / Birthday Party" Pastel Rotating Beams */}
      {activeBeams > 0 && (
        <group ref={partyGroupRef} position={[0, 2.15, 0.25]}>
          {/* Beam 1: Warm Rose-Pink (#ff7eb6) */}
          {roseOn && (
            <pointLight
              position={[1.15, -0.4, 0.65]}
              color="#ff7eb6"
              intensity={3.4 * brightness}
              distance={5.6}
            />
          )}
          {/* Beam 2: Soft Baby-Cyan (#72e8ff) */}
          {cyanOn && (
            <pointLight
              position={[-1.1, -0.35, 0.62]}
              color="#72e8ff"
              intensity={3.1 * brightness}
              distance={5.6}
            />
          )}
          {/* Beam 3: Sunny Peach-Gold (#ffbe55) */}
          {peachGoldOn && (
            <pointLight
              position={[0.1, -0.4, -0.75]}
              color="#ffbe55"
              intensity={3.5 * brightness}
              distance={5.6}
            />
          )}

          {/* Overhead Rotating Party Bulb */}
          <mesh position={[0, 0.36, -0.15]}>
            <octahedronGeometry args={[0.1, 1]} />
            <meshStandardMaterial
              color="#fff4e0"
              emissive={roseOn ? '#ff7eb6' : cyanOn ? '#72e8ff' : '#ffbe55'}
              emissiveIntensity={0.7 * cozyFactor}
              metalness={0.35}
              roughness={0.25}
              flatShading
            />
          </mesh>
        </group>
      )}
    </>
  );
};

/* ============================================================================
   VINTAGE CRT MONITOR (#302) — SLIM SCULPTED BEZEL, LED & SINGLE-CLICK ZOOM
   ============================================================================ */
const VintageCRTMonitorMesh: React.FC<{
  actStage: ActStage;
  lensBroken: boolean;
  endingChoice: 'A' | 'B' | null;
  endingARedactedCount: number;
  lang: Language;
  isFocused: boolean;
  onFocusMonitor: () => void;
  onExitFocus: () => void;
  onHoverLabel?: (label: string | null) => void;
}> = ({
  actStage,
  lensBroken,
  endingChoice,
  endingARedactedCount,
  lang,
  isFocused,
  onFocusMonitor,
  onExitFocus,
  onHoverLabel,
}) => {
  const [hovered, setHovered] = useState(false);

  const screenTex = useMemo(
    () =>
      createMonitorScreenCanvasTexture(
        actStage,
        lensBroken,
        lang,
        endingChoice,
        endingARedactedCount
      ),
    [actStage, lensBroken, lang, endingChoice, endingARedactedCount]
  );

  const nameplateTex = useMemo(() => createNameplateTexture(), []);

  return (
    <group
      position={MONITOR_GROUP_POS}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        if (!isFocused) {
          onHoverLabel?.(
            lang === 'zh'
              ? '[ 显示器 TCD-302 / CRT MONITOR ]'
              : '[ CRT MONITOR TCD-302 ]'
          );
        }
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(false);
        onHoverLabel?.(null);
        document.body.style.cursor = 'default';
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (isFocused) {
          onExitFocus();
        } else {
          onFocusMonitor();
        }
      }}
    >
      {/* Monitor Pedestal Base & Neck */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.06, 0.36]} />
        <meshStandardMaterial color="#2b2723" roughness={0.62} flatShading />
      </mesh>
      <mesh position={[0, 0.09, -0.02]} castShadow>
        <cylinderGeometry args={[0.11, 0.14, 0.09, 12]} />
        <meshStandardMaterial color="#24201c" roughness={0.68} flatShading />
      </mesh>

      {/* Rear CRT Cathode Tube Housing */}
      <mesh position={[0, 0.42, -0.17]} castShadow receiveShadow>
        <boxGeometry args={[0.68, 0.48, 0.28]} />
        <meshStandardMaterial color="#292521" roughness={0.66} flatShading />
      </mesh>

      {/* Main Sculpted Plastic Bezel Casing */}
      <mesh position={[0, 0.415, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.88, 0.59, 0.26]} />
        <meshStandardMaterial
          color={hovered && !isFocused ? '#4a433c' : '#36312b'}
          roughness={0.36}
          metalness={0.18}
          flatShading
        />
      </mesh>

      {/* Slim Raised Bezel Lip Framing the CRT Glass */}
      <mesh position={[0, 0.435, 0.146]}>
        <boxGeometry args={[0.825, 0.5, 0.018]} />
        <meshStandardMaterial
          color="#181512"
          roughness={0.3}
          metalness={0.22}
          flatShading
        />
      </mesh>

      {/* Glowing Live Monitor Screen Plane */}
      <mesh position={[0, SCREEN_LOCAL_Y, SCREEN_LOCAL_Z]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial map={screenTex} />
      </mesh>

      {/* Physical Metallic Nameplate: TCD-302 */}
      <mesh position={[-0.31, 0.155, 0.152]}>
        <planeGeometry args={[0.14, 0.032]} />
        <meshStandardMaterial
          map={nameplateTex}
          metalness={0.65}
          roughness={0.28}
        />
      </mesh>

      {/* Power Indicator LED */}
      <mesh position={[0.35, 0.155, 0.154]}>
        <boxGeometry args={[0.024, 0.014, 0.008]} />
        <meshBasicMaterial color={lensBroken ? '#ff66a8' : '#8fd68a'} />
      </mesh>
      <pointLight
        position={[0.35, 0.155, 0.18]}
        intensity={lensBroken ? 0.32 : 0.16}
        distance={0.28}
        color={lensBroken ? '#ff66a8' : '#8fd68a'}
      />

      {/* Contrast / Brightness Knobs beside LED */}
      <mesh position={[0.27, 0.155, 0.153]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.011, 0.011, 0.012, 8]} />
        <meshStandardMaterial
          color="#1f1c19"
          roughness={0.4}
          metalness={0.3}
          flatShading
        />
      </mesh>
      <mesh position={[0.23, 0.155, 0.153]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.011, 0.011, 0.012, 8]} />
        <meshStandardMaterial
          color="#1f1c19"
          roughness={0.4}
          metalness={0.3}
          flatShading
        />
      </mesh>
    </group>
  );
};

/* ============================================================================
   FROSTED GLASS PARTITION (ADJACENT DESK #209)
   ============================================================================ */
const FrostedPartitionMesh: React.FC<{
  lensBroken: boolean;
  lang: Language;
  onSelect: () => void;
  onHoverLabel?: (label: string | null) => void;
}> = ({ lensBroken, lang, onSelect, onHoverLabel }) => {
  const [hovered, setHovered] = useState(false);
  const glassTex = useMemo(
    () => createPartitionGlassTexture(lensBroken),
    [lensBroken]
  );

  return (
    <group
      position={[0.08, 1.56, -0.82]}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        onHoverLabel?.(
          lang === 'zh'
            ? '[ 磨砂玻璃隔断 / FROSTED PARTITION ]'
            : '[ FROSTED PARTITION ]'
        );
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(false);
        onHoverLabel?.(null);
        document.body.style.cursor = 'default';
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <mesh position={[0, 0.34, 0]} castShadow>
        <boxGeometry args={[2.2, 0.05, 0.06]} />
        <meshStandardMaterial
          color={hovered ? '#473e35' : '#2e2822'}
          roughness={0.7}
          flatShading
        />
      </mesh>
      <mesh position={[0, -0.34, 0]} castShadow>
        <boxGeometry args={[2.2, 0.05, 0.06]} />
        <meshStandardMaterial
          color={hovered ? '#473e35' : '#2e2822'}
          roughness={0.7}
          flatShading
        />
      </mesh>
      {[-1.07, -0.36, 0.36, 1.07].map((xPos, idx) => (
        <mesh key={idx} position={[xPos, 0, 0]} castShadow>
          <boxGeometry args={[0.05, 0.72, 0.06]} />
          <meshStandardMaterial
            color={hovered ? '#473e35' : '#2e2822'}
            roughness={0.7}
            flatShading
          />
        </mesh>
      ))}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2.12, 0.64]} />
        <meshStandardMaterial map={glassTex} roughness={0.35} metalness={0.1} />
      </mesh>
    </group>
  );
};

/* ============================================================================
   MAIN 3D DESK SCENE COMPONENT
   ============================================================================ */
export const DeskScene: React.FC<DeskSceneProps> = ({
  lang,
  actStage,
  focusTarget,
  lensBroken,
  endingChoice,
  endingARedactedCount,
  brightness,
  drawerLocks,
  openDrawers,
  isTapePlaying,
  isDeskLampOn,
  activeDeskFiles,
  screenOverlayRef,
  onSelectFocus,
  onDeskFileClick,
  onToggleDrawer,
  onLockedDrawerRattle,
  onInspectDrawerFolder,
  onToggleTape,
  onInspectPlant,
  onToggleDeskLamp,
  onInspectCalendar,
  onHoverPropChange,
}) => {
  const walnutTex = useMemo(() => createWalnutDeskTexture(), []);
  const concreteTex = useMemo(() => createConcreteWallTexture(), []);
  const tileTex = useMemo(() => createBasementTileTexture(), []);

  const showWorldPrompts = focusTarget === 'none';

  return (
    <div
      className="three-canvas-container"
      onContextMenu={(e) => {
        e.preventDefault();
        if (focusTarget !== 'none') {
          onSelectFocus('none');
        }
      }}
    >
      <Canvas
        shadows
        camera={{ fov: 42, position: [0, 1.48, 2.12], near: 0.1, far: 20 }}
        onPointerMissed={() => {
          if (focusTarget !== 'none') {
            onSelectFocus('none');
          }
        }}
      >
        <color
          attach="background"
          args={[lensBroken ? '#241619' : '#151816']}
        />
        <fogExp2
          attach="fog"
          args={[lensBroken ? '#241619' : '#151816', lensBroken ? 0.095 : 0.085]}
        />

        <ExposureController brightness={brightness} />
        <CameraController
          focusTarget={focusTarget}
          screenOverlayRef={screenOverlayRef}
        />
        <OfficeAndDiscoLighting
          lensBroken={lensBroken}
          endingChoice={endingChoice}
          endingARedactedCount={endingARedactedCount}
          brightness={brightness}
        />

        {/* GROUNDED BASEMENT ROOM ENCLOSURE (Exit 8 Institutional Realism) */}
        <group>
          {/* Tiled Concrete Basement Floor */}
          <mesh
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[8, 7]} />
            <meshStandardMaterial
              map={tileTex}
              color={lensBroken ? '#423034' : '#ffffff'}
              roughness={0.88}
            />
          </mesh>

          {/* Back Institutional Plaster/Cinderblock Wall */}
          <mesh position={[0, 1.65, -1.78]} receiveShadow>
            <planeGeometry args={[8, 3.6]} />
            <meshStandardMaterial
              map={concreteTex}
              color={lensBroken ? '#523438' : '#b8bfb4'}
              roughness={0.92}
            />
          </mesh>

          {/* Left Basement Side Wall */}
          <mesh
            position={[-2.25, 1.65, 0.2]}
            rotation={[0, Math.PI / 2, 0]}
            receiveShadow
          >
            <planeGeometry args={[6, 3.6]} />
            <meshStandardMaterial
              map={concreteTex}
              color={lensBroken ? '#4d3034' : '#aeb5aa'}
              roughness={0.92}
            />
          </mesh>

          {/* Overhead Fluorescent Fixture Housing */}
          <group position={[0.05, 2.75, 0.2]}>
            <mesh>
              <boxGeometry args={[1.15, 0.05, 0.22]} />
              <meshStandardMaterial color="#3a3f3a" roughness={0.6} flatShading />
            </mesh>
            <mesh position={[0, -0.028, 0]}>
              <boxGeometry args={[1.05, 0.012, 0.14]} />
              <meshBasicMaterial
                color={lensBroken ? '#ffd48a' : '#eef5e8'}
              />
            </mesh>
          </group>
        </group>

        {/* STATIC 3D WALNUT DESK (Shifted slightly right to give Cabinet clear space) */}
        <group
          onClick={(e: ThreeEvent<MouseEvent>) => {
            if (focusTarget === 'monitor') {
              e.stopPropagation();
              onSelectFocus('none');
            }
          }}
        >
          {/* Main Walnut Desk Tabletop: x in [-0.84, +1.12] */}
          <mesh position={[0.14, 0.725, 0.05]} receiveShadow castShadow>
            <boxGeometry args={[1.96, 0.07, 1.2]} />
            <meshStandardMaterial
              map={walnutTex}
              roughness={0.62}
              metalness={0.08}
              flatShading
            />
          </mesh>

          {/* Dark Matte Desk Pad */}
          <mesh position={[0.06, 0.763, 0.14]} receiveShadow>
            <boxGeometry args={[1.42, 0.006, 0.82]} />
            <meshStandardMaterial color="#161412" roughness={0.85} flatShading />
          </mesh>

          {/* Left & Right Desk Drawer Pedestals */}
          <mesh position={[-0.64, 0.345, 0.05]} receiveShadow castShadow>
            <boxGeometry args={[0.42, 0.69, 1.08]} />
            <meshStandardMaterial map={walnutTex} roughness={0.82} flatShading />
          </mesh>
          <mesh position={[0.86, 0.345, 0.05]} receiveShadow castShadow>
            <boxGeometry args={[0.46, 0.69, 1.08]} />
            <meshStandardMaterial map={walnutTex} roughness={0.82} flatShading />
          </mesh>
        </group>

        {/* INSTITUTIONAL GREEN 3-TIER METAL FILING CABINET + CABINET-TOP CLUTTER & PLANT */}
        <FilingCabinetMesh
          position={[-1.15, 0, -0.06]}
          rotation={[0, 0.08, 0]}
          lang={lang}
          lensBroken={lensBroken}
          drawerLocks={drawerLocks}
          openDrawers={openDrawers}
          showWorldPrompt={showWorldPrompts}
          onToggleDrawer={onToggleDrawer}
          onLockedDrawerRattle={onLockedDrawerRattle}
          onInspectDrawerFolder={onInspectDrawerFolder}
          onInspectPlant={onInspectPlant}
          onHoverLabel={onHoverPropChange}
        />

        {/* IMMOVABLE INTERACTABLES: FROSTED PARTITION & CRT MONITOR */}
        <FrostedPartitionMesh
          lensBroken={lensBroken}
          lang={lang}
          onSelect={() =>
            onSelectFocus(focusTarget === 'partition' ? 'none' : 'partition')
          }
          onHoverLabel={onHoverPropChange}
        />

        <VintageCRTMonitorMesh
          actStage={actStage}
          lensBroken={lensBroken}
          endingChoice={endingChoice}
          endingARedactedCount={endingARedactedCount}
          lang={lang}
          isFocused={focusTarget === 'monitor'}
          onFocusMonitor={() => onSelectFocus('monitor')}
          onExitFocus={() => onSelectFocus('none')}
          onHoverLabel={onHoverPropChange}
        />

        {/* FOCUSED VINTAGE DESK LAMP (Back-Left Desk Corner) */}
        <VintageDeskLampMesh
          position={[-0.7, 0.76, -0.34]}
          rotation={[0, 0.45, 0]}
          isOn={isDeskLampOn}
          lensBroken={lensBroken}
          brightness={brightness}
          lang={lang}
          showWorldPrompt={showWorldPrompts}
          onToggle={onToggleDeskLamp}
          onHoverLabel={onHoverPropChange}
        />

        {/* LOOPING-TIME DESK CALENDAR (11/13) */}
        <DeskCalendarMesh
          position={[0.56, 0.76, -0.26]}
          rotation={[0, -0.24, 0]}
          lang={lang}
          showWorldPrompt={showWorldPrompts}
          onInspect={onInspectCalendar}
          onHoverLabel={onHoverPropChange}
        />

        {/* LIVED-IN DESK CLUTTER: METALLIC PAPERCLIPS & YELLOWING STICKY NOTES */}
        <DeskClutterGroup />

        {/* DESKTOP LOW-POLY CASSETTE TAPE RECORDER (Back-Right Desk Corner) */}
        <TapeRecorderMesh
          position={[0.82, 0.76, -0.32]}
          rotation={[0, -0.28, 0]}
          isTapePlaying={isTapePlaying}
          lensBroken={lensBroken}
          lang={lang}
          showWorldPrompt={showWorldPrompts}
          onToggleTape={onToggleTape}
          onHoverLabel={onHoverPropChange}
        />

        {/* REPOSITIONED FAMILY_PHOTO ON CABINET SIDE WALL (Clear of Monitor & Desk) */}
        <InteractableProp
          restPosition={[-0.892, 1.04, -0.02]}
          restRotation={[0, Math.PI / 2 + 0.08, 0.02]}
          hoverOffset={[0.015, 0.01, 0]}
          hoverLabel={
            lang === 'zh'
              ? '[家庭照片 — 端详]'
              : '[FAMILY PHOTO — INSPECT]'
          }
          showWorldPrompt={showWorldPrompts}
          inspectPosition={[0, 1.37, 1.48]}
          inspectRotation={[0.04, 0, 0]}
          inspectScale={1.55}
          isFocused={focusTarget === 'polaroid'}
          onHoverChange={(h) =>
            onHoverPropChange(
              h
                ? lang === 'zh'
                  ? '[ 拍立得家庭照片 / FAMILY PHOTO ]'
                  : '[ FAMILY PHOTO ]'
                : null
            )
          }
          onSelect={() =>
            onSelectFocus(focusTarget === 'polaroid' ? 'none' : 'polaroid')
          }
        >
          <PolaroidPhotoMesh lensBroken={lensBroken} />
        </InteractableProp>

        {/* DESK PROPS (PICK UP TO CAMERA FRONT + ±15° PARALLAX) */}
        <InteractableProp
          restPosition={[-0.64, 0.766, 0.1]}
          restRotation={[0, 0.28, 0]}
          hoverLabel={
            lang === 'zh' ? '[铝制便当盒 — 查看]' : '[LUNCHBOX — INSPECT]'
          }
          showWorldPrompt={showWorldPrompts}
          inspectPosition={[0, 1.31, 1.42]}
          inspectRotation={[0.38, -0.15, 0]}
          inspectScale={1.45}
          isFocused={focusTarget === 'prop_lunchbox'}
          onHoverChange={(h) =>
            onHoverPropChange(
              h
                ? lang === 'zh'
                  ? '[ 铝制便当盒 / TIN LUNCHBOX ]'
                  : '[ TIN LUNCHBOX ]'
                : null
            )
          }
          onSelect={() =>
            onSelectFocus(
              focusTarget === 'prop_lunchbox' ? 'none' : 'prop_lunchbox'
            )
          }
        >
          <LunchboxMesh lensBroken={lensBroken} lang={lang} />
        </InteractableProp>

        <InteractableProp
          restPosition={[0.44, 0.766, 0.42]}
          restRotation={[0, -0.45, 0]}
          hoverLabel={
            lang === 'zh' ? '[陶瓷马克杯 — 查看]' : '[COFFEE MUG — INSPECT]'
          }
          showWorldPrompt={showWorldPrompts}
          inspectPosition={[0, 1.31, 1.46]}
          inspectRotation={[0.32, -0.35, 0]}
          inspectScale={1.65}
          isFocused={focusTarget === 'prop_mug'}
          onHoverChange={(h) =>
            onHoverPropChange(
              h
                ? lang === 'zh'
                  ? '[ 陶瓷马克杯 / CERAMIC MUG ]'
                  : '[ CERAMIC MUG ]'
                : null
            )
          }
          onSelect={() =>
            onSelectFocus(focusTarget === 'prop_mug' ? 'none' : 'prop_mug')
          }
        >
          <CoffeeMugMesh lensBroken={lensBroken} />
        </InteractableProp>

        {/* PHASE 2 PHYSICAL DESK FILES PLACEHOLDERS (Wired to activeDeskFiles) */}
        {activeDeskFiles.includes('manual') && (
          <InteractableProp
            restPosition={[-0.56, 0.766, 0.4]}
            restRotation={[0, 0.18, 0]}
            isFocused={false}
            onHoverChange={(h) =>
              onHoverPropChange(
                h
                  ? lang === 'zh'
                    ? '[ 部门操作手册与钢笔 / TCD MANUAL ]'
                    : '[ TCD MANUAL & PEN ]'
                  : null
              )
            }
            onSelect={() => onDeskFileClick('manual')}
          >
            <ManualBookletMesh />
          </InteractableProp>
        )}

        {activeDeskFiles.includes('file01') && (
          <InteractableProp
            restPosition={[0.58, 0.794, 0.18]}
            restRotation={[0, -0.12, 0]}
            isFocused={false}
            onHoverChange={(h) =>
              onHoverPropChange(
                h
                  ? lang === 'zh'
                    ? '[ 档案卷宗 #01 / DOSSIER #01 ]'
                    : '[ DOSSIER #01 ]'
                  : null
              )
            }
            onSelect={() => onDeskFileClick('file01')}
          >
            <DossierFolderMesh num="#01" status="normal" />
          </InteractableProp>
        )}

        {activeDeskFiles.includes('file02') && (
          <InteractableProp
            restPosition={[0.68, 0.78, 0.09]}
            restRotation={[0, -0.22, 0]}
            isFocused={false}
            onHoverChange={(h) =>
              onHoverPropChange(
                h
                  ? lang === 'zh'
                    ? '[ 档案卷宗 #02 / DOSSIER #02 ]'
                    : '[ DOSSIER #02 ]'
                  : null
              )
            }
            onSelect={() => onDeskFileClick('file02')}
          >
            <DossierFolderMesh num="#02" status="normal" />
          </InteractableProp>
        )}

        {activeDeskFiles.includes('file03') && (
          <InteractableProp
            restPosition={[0.78, 0.766, 0.01]}
            restRotation={[0, -0.32, 0]}
            isFocused={false}
            onHoverChange={(h) =>
              onHoverPropChange(
                h
                  ? lang === 'zh'
                    ? '[ 档案卷宗 #03 / DOSSIER #03 ]'
                    : '[ DOSSIER #03 ]'
                  : null
              )
            }
            onSelect={() => onDeskFileClick('file03')}
          >
            <DossierFolderMesh
              num="#03"
              status={actStage >= 2 ? 'decrypted' : 'locked'}
            />
          </InteractableProp>
        )}

        {activeDeskFiles.includes('file04') && (
          <InteractableProp
            restPosition={[0.42, 0.768, 0.18]}
            restRotation={[0, -0.06, 0]}
            isFocused={false}
            onHoverChange={(h) =>
              onHoverPropChange(
                h
                  ? lang === 'zh'
                    ? '[ 档案卷宗 #04 / DOSSIER #04 ]'
                    : '[ DOSSIER #04 ]'
                  : null
              )
            }
            onSelect={() => onDeskFileClick('file04')}
          >
            <DossierFolderMesh num="#04" status="decrypted" />
          </InteractableProp>
        )}
      </Canvas>
    </div>
  );
};

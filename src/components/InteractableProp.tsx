import React, { useMemo, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { DeskFileId, Language } from '../types';
import {
  createCabinetLabelTexture,
  createDossierFolderTexture,
  createLoopingCalendarTexture,
  createLunchboxNoteTexture,
  createManualCoverTexture,
  createPolaroidCanvasTexture,
  createStickyNoteTexture,
  createTapeDeckFaceTexture,
} from '../utils/canvasTextures';

interface InteractablePropProps {
  restPosition: [number, number, number];
  restRotation: [number, number, number];
  inspectPosition?: [number, number, number];
  inspectRotation?: [number, number, number];
  inspectScale?: number;
  hoverOffset?: [number, number, number];
  hoverLabel?: string;
  showWorldPrompt?: boolean;
  isFocused: boolean;
  onSelect: () => void;
  onHoverChange?: (hovered: boolean) => void;
  children: React.ReactNode;
}

export const InteractableProp: React.FC<InteractablePropProps> = ({
  restPosition,
  restRotation,
  inspectPosition = [0, 1.36, 1.42],
  inspectRotation = [0.25, 0, 0],
  inspectScale = 1.35,
  hoverOffset = [0, 0.025, 0],
  hoverLabel,
  showWorldPrompt = true,
  isFocused,
  onSelect,
  onHoverChange,
  children,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetScale = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const speed = Math.min(1, delta * 8.5);

    if (isFocused) {
      targetPos.set(inspectPosition[0], inspectPosition[1], inspectPosition[2]);
      targetScale.setScalar(inspectScale);

      // ±15° (0.26 rad) mouse-following 3D parallax tilt when held in front of camera
      const tiltX = inspectRotation[0] - state.pointer.y * 0.26;
      const tiltY = inspectRotation[1] + state.pointer.x * 0.26;
      const tiltZ = inspectRotation[2] - state.pointer.x * 0.08;

      groupRef.current.position.lerp(targetPos, speed);
      groupRef.current.scale.lerp(targetScale, speed);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        tiltX,
        speed
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        tiltY,
        speed
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        tiltZ,
        speed
      );
    } else {
      const ox = hovered ? hoverOffset[0] : 0;
      const oy = hovered ? hoverOffset[1] : 0;
      const oz = hovered ? hoverOffset[2] : 0;
      targetPos.set(
        restPosition[0] + ox,
        restPosition[1] + oy,
        restPosition[2] + oz
      );
      targetScale.setScalar(hovered ? 1.03 : 1);

      groupRef.current.position.lerp(targetPos, speed);
      groupRef.current.scale.lerp(targetScale, speed);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        restRotation[0],
        speed
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        restRotation[1],
        speed
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        restRotation[2],
        speed
      );
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHoverChange?.(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    onHoverChange?.(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <group
      ref={groupRef}
      position={restPosition}
      rotation={restRotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {children}
      {/* Subtle rim highlight when hovered on desk */}
      {hovered && !isFocused && (
        <pointLight
          position={[0, 0.14, 0]}
          intensity={0.45}
          distance={0.55}
          color="#fff2d6"
        />
      )}
      {hovered && !isFocused && showWorldPrompt && hoverLabel && (
        <Html position={[0, 0.2, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="ps1-world-prompt">{hoverLabel}</div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================================
   1. ALUMINUM LUNCHBOX 3D LOW-POLY MESH (prop_lunchbox)
   ============================================================================ */
export const LunchboxMesh: React.FC<{ lensBroken: boolean; lang: Language }> = ({
  lensBroken,
  lang,
}) => {
  const noteTex = useMemo(
    () => createLunchboxNoteTexture(lensBroken, lang),
    [lensBroken, lang]
  );

  return (
    <group>
      {/* Lower Tin Box Body */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.075, 0.17]} />
        <meshStandardMaterial
          color={lensBroken ? '#422620' : '#b5afa4'}
          roughness={lensBroken ? 0.85 : 0.42}
          metalness={lensBroken ? 0.35 : 0.65}
          flatShading
        />
      </mesh>

      {/* Dark Interior Cavity */}
      <mesh position={[0, 0.079, 0]}>
        <boxGeometry args={[0.24, 0.006, 0.15]} />
        <meshStandardMaterial
          color={lensBroken ? '#1f080a' : '#2e261f'}
          roughness={0.9}
          flatShading
        />
      </mesh>

      {/* Mutated Contents when Lens Broken */}
      {lensBroken && (
        <group position={[0, 0.088, 0]}>
          <mesh position={[-0.04, 0.008, 0.01]} rotation={[0.1, 0.4, -0.15]}>
            <boxGeometry args={[0.09, 0.012, 0.06]} />
            <meshStandardMaterial color="#b8ae9c" roughness={0.9} flatShading />
          </mesh>
          <mesh position={[0.05, 0.01, -0.02]} rotation={[-0.15, -0.3, 0.2]}>
            <boxGeometry args={[0.08, 0.015, 0.06]} />
            <meshStandardMaterial color="#9e9280" roughness={0.9} flatShading />
          </mesh>
          <mesh position={[0, 0.02, 0.02]} rotation={[0, 0.5, 0.2]}>
            <boxGeometry args={[0.045, 0.005, 0.008]} />
            <meshStandardMaterial
              color="#d92638"
              roughness={0.4}
              metalness={0.5}
              flatShading
            />
          </mesh>
          <mesh position={[-0.03, 0.022, -0.02]} rotation={[0.2, -0.4, -0.1]}>
            <boxGeometry args={[0.045, 0.005, 0.008]} />
            <meshStandardMaterial
              color="#d92638"
              roughness={0.4}
              metalness={0.5}
              flatShading
            />
          </mesh>
        </group>
      )}

      {/* Slightly Ajar Upper Lid */}
      <group
        position={[0, 0.078, -0.08]}
        rotation={[lensBroken ? -0.52 : -0.16, 0, 0]}
      >
        <mesh position={[0, 0.012, 0.08]} castShadow receiveShadow>
          <boxGeometry args={[0.268, 0.024, 0.176]} />
          <meshStandardMaterial
            color={lensBroken ? '#4d2b24' : '#c4beb2'}
            roughness={lensBroken ? 0.8 : 0.38}
            metalness={lensBroken ? 0.3 : 0.68}
            flatShading
          />
        </mesh>

        {/* Warm Sticky Note / Mutated Patch on Top of Lid */}
        <mesh
          position={[0.01, 0.025, 0.08]}
          rotation={[-Math.PI / 2, 0, -0.06]}
        >
          <planeGeometry args={[0.16, 0.085]} />
          <meshStandardMaterial map={noteTex} roughness={0.85} />
        </mesh>
      </group>

      {/* Front Metal Latch Clasp */}
      <mesh position={[0, 0.055, 0.088]}>
        <boxGeometry args={[0.042, 0.03, 0.01]} />
        <meshStandardMaterial
          color="#787166"
          roughness={0.4}
          metalness={0.7}
          flatShading
        />
      </mesh>
    </group>
  );
};

/* ============================================================================
   2. STAINED CERAMIC COFFEE MUG 3D LOW-POLY MESH (prop_mug)
   ============================================================================ */
export const CoffeeMugMesh: React.FC<{ lensBroken: boolean }> = ({
  lensBroken,
}) => {
  return (
    <group scale={1.3}>
      {/* Square Cork/Paper Coaster */}
      <mesh position={[0, 0.004, 0]} receiveShadow>
        <boxGeometry args={[0.13, 0.008, 0.13]} />
        <meshStandardMaterial
          color={lensBroken ? '#2e1517' : '#a89982'}
          roughness={0.9}
          flatShading
        />
      </mesh>

      {/* Dark Coffee Stain Ring on Coaster */}
      <mesh position={[0.008, 0.009, 0.005]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.042, 0.052, 12]} />
        <meshBasicMaterial
          color={lensBroken ? '#4a0c12' : '#4a3221'}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ceramic Mug Chunky Low-Poly Cylinder Body */}
      <mesh position={[0, 0.065, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.048, 0.044, 0.115, 10]} />
        <meshStandardMaterial
          color={lensBroken ? '#6e5e57' : '#dfd7c8'}
          roughness={0.45}
          flatShading
        />
      </mesh>

      {/* Coffee / Coagulated Fluid Surface Inside Mug */}
      <mesh position={[0, 0.112, 0]}>
        <cylinderGeometry args={[0.043, 0.043, 0.01, 10]} />
        <meshStandardMaterial
          color={lensBroken ? '#38060b' : '#2b1b10'}
          roughness={lensBroken ? 0.2 : 0.25}
          flatShading
        />
      </mesh>

      {/* Arthur's Bloodied #209 Plastic ID Badge Protruding when Lens Broken */}
      {lensBroken && (
        <group position={[0.005, 0.125, 0]} rotation={[0.25, 0.3, -0.22]}>
          <mesh>
            <boxGeometry args={[0.058, 0.042, 0.004]} />
            <meshStandardMaterial color="#d8cec0" roughness={0.4} flatShading />
          </mesh>
          <mesh position={[0, 0.012, 0.003]}>
            <boxGeometry args={[0.054, 0.012, 0.002]} />
            <meshStandardMaterial color="#8a1822" roughness={0.5} flatShading />
          </mesh>
        </group>
      )}

      {/* Low-Poly Mug Handle (3 Box Segments) */}
      <group position={[0.054, 0.065, 0]}>
        <mesh position={[0, 0.028, 0]}>
          <boxGeometry args={[0.026, 0.012, 0.014]} />
          <meshStandardMaterial
            color={lensBroken ? '#6e5e57' : '#dfd7c8'}
            roughness={0.45}
            flatShading
          />
        </mesh>
        <mesh position={[0.014, 0, 0]}>
          <boxGeometry args={[0.012, 0.066, 0.014]} />
          <meshStandardMaterial
            color={lensBroken ? '#6e5e57' : '#dfd7c8'}
            roughness={0.45}
            flatShading
          />
        </mesh>
        <mesh position={[0, -0.028, 0]}>
          <boxGeometry args={[0.026, 0.012, 0.014]} />
          <meshStandardMaterial
            color={lensBroken ? '#6e5e57' : '#dfd7c8'}
            roughness={0.45}
            flatShading
          />
        </mesh>
      </group>
    </group>
  );
};

/* ============================================================================
   3. POLAROID PHOTO 3D MESH (Mounted to Cabinet Side Wall w/ Tape & Magnet)
   ============================================================================ */
export const PolaroidPhotoMesh: React.FC<{ lensBroken: boolean }> = ({
  lensBroken,
}) => {
  const photoTex = useMemo(
    () => createPolaroidCanvasTexture(lensBroken),
    [lensBroken]
  );

  return (
    <group>
      {/* Polaroid Card Backing */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.19, 0.005]} />
        <meshStandardMaterial map={photoTex} roughness={0.72} flatShading />
      </mesh>

      {!lensBroken ? (
        <>
          {/* Yellowing Masking Tape Strip Across Top Center */}
          <mesh position={[-0.012, 0.092, 0.004]} rotation={[0, 0, -0.09]}>
            <boxGeometry args={[0.072, 0.02, 0.003]} />
            <meshStandardMaterial
              color="#dfd0a8"
              transparent
              opacity={0.86}
              roughness={0.75}
              flatShading
            />
          </mesh>
          {/* Small Chunky Round Magnet Holding Corner to Steel Cabinet */}
          <group position={[0.052, 0.072, 0.007]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.007, 8]} />
              <meshStandardMaterial
                color="#9e3a32"
                roughness={0.45}
                metalness={0.25}
                flatShading
              />
            </mesh>
            <mesh position={[0, -0.003, 0]}>
              <cylinderGeometry args={[0.013, 0.013, 0.003, 8]} />
              <meshStandardMaterial color="#1f2021" roughness={0.6} flatShading />
            </mesh>
          </group>
        </>
      ) : (
        /* Heavy Crimson Staple when Lens Broken */
        <mesh position={[0, 0.092, 0.004]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.055, 0.01, 0.004]} />
          <meshStandardMaterial color="#d92638" roughness={0.4} flatShading />
        </mesh>
      )}
    </group>
  );
};

/* ============================================================================
   4. OPERATING MANUAL BOOKLET & ARCHIVAL DOSSIERS
   ============================================================================ */
export const ManualBookletMesh: React.FC = () => {
  const coverTex = useMemo(() => createManualCoverTexture(), []);

  return (
    <group>
      <mesh position={[0.004, 0.012, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.23, 0.022, 0.31]} />
        <meshStandardMaterial color="#dfd7c8" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.24, 0.005, 0.32]} />
        <meshStandardMaterial map={coverTex} roughness={0.75} flatShading />
      </mesh>
      {/* Low-Poly Fountain/Ballpoint Pen Resting on Top of Manual */}
      <group position={[0.02, 0.033, 0.01]} rotation={[0, 0.44, Math.PI / 2]}>
        {/* Dark Navy Faceted Barrel */}
        <mesh castShadow>
          <cylinderGeometry args={[0.006, 0.006, 0.14, 6]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.45}
            metalness={0.25}
            flatShading
          />
        </mesh>
        {/* Brass Pocket Clip & Center Band */}
        <mesh position={[0, 0.005, 0]}>
          <cylinderGeometry args={[0.0068, 0.0068, 0.008, 6]} />
          <meshStandardMaterial
            color="#b8984c"
            roughness={0.35}
            metalness={0.7}
            flatShading
          />
        </mesh>
        <mesh position={[0.006, 0.036, 0]}>
          <boxGeometry args={[0.003, 0.038, 0.004]} />
          <meshStandardMaterial
            color="#b8984c"
            roughness={0.35}
            metalness={0.7}
            flatShading
          />
        </mesh>
        {/* Metallic Nib Cone */}
        <mesh position={[0, -0.082, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.006, 0.024, 6]} />
          <meshStandardMaterial
            color="#c8cdd2"
            roughness={0.3}
            metalness={0.8}
            flatShading
          />
        </mesh>
      </group>
    </group>
  );
};

export const DossierFolderMesh: React.FC<{
  num: '#01' | '#02' | '#03' | '#04' | '#05';
  status: 'normal' | 'locked' | 'decrypted' | 'complete';
}> = ({ num, status }) => {
  const folderTex = useMemo(
    () => createDossierFolderTexture(num, status),
    [num, status]
  );

  return (
    <group>
      <mesh position={[0.005, 0.006, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.23, 0.01, 0.3]} />
        <meshStandardMaterial color="#e8e2d5" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.013, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.245, 0.004, 0.32]} />
        <meshStandardMaterial map={folderTex} roughness={0.8} flatShading />
      </mesh>
    </group>
  );
};

/* ============================================================================
   5. CABINET-TOP WITHERED PLANT (Morphs into Unsettling Cheerful Blooms in Act 3)
   ============================================================================ */
export const WitheredPlantMesh: React.FC<{
  position: [number, number, number];
  lensBroken: boolean;
  lang: Language;
  showWorldPrompt: boolean;
  onInspect: () => void;
  onHoverLabel?: (label: string | null) => void;
}> = ({
  position,
  lensBroken,
  lang,
  showWorldPrompt,
  onInspect,
  onHoverLabel,
}) => {
  const [hovered, setHovered] = useState(false);

  const stems: Array<{
    pos: [number, number, number];
    rot: [number, number, number];
    len: number;
    bloomColor: string;
  }> = [
    { pos: [-0.02, 0.14, 0.01], rot: [0.32, 0.2, 0.42], len: 0.13, bloomColor: '#ff2e63' },
    { pos: [0.025, 0.15, -0.01], rot: [-0.28, 0.4, -0.36], len: 0.14, bloomColor: '#ff8fb8' },
    { pos: [0.0, 0.155, 0.025], rot: [0.46, -0.3, 0.12], len: 0.12, bloomColor: '#ffe066' },
    { pos: [-0.015, 0.13, -0.025], rot: [-0.4, 0.1, 0.28], len: 0.11, bloomColor: '#ff4f87' },
    { pos: [0.018, 0.125, 0.022], rot: [0.22, -0.5, -0.45], len: 0.10, bloomColor: '#ffbe55' },
  ];

  return (
    <group
      position={position}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        onHoverLabel?.(
          lang === 'zh'
            ? '[ 磁带录音机 / CASSETTE RECORDER ]'
            : '[ CASSETTE RECORDER ]'
        );
        onHoverLabel?.(
          lang === 'zh'
            ? '[ 磁带录音机 / CASSETTE RECORDER ]'
            : '[ CASSETTE RECORDER ]'
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
        onInspect();
      }}
    >
      {/* Faceted Terracotta Pot */}
      <mesh position={[0, 0.055, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.072, 0.05, 0.11, 7]} />
        <meshStandardMaterial
          color={hovered ? '#b56846' : lensBroken ? '#b85b3f' : '#9c5638'}
          roughness={0.85}
          flatShading
        />
      </mesh>
      {/* Top Rim Collar */}
      <mesh position={[0, 0.108, 0]} castShadow>
        <cylinderGeometry args={[0.079, 0.076, 0.022, 7]} />
        <meshStandardMaterial
          color={hovered ? '#c27452' : '#a86040'}
          roughness={0.8}
          flatShading
        />
      </mesh>
      {/* Dry Soil Bed */}
      <mesh position={[0, 0.116, 0]}>
        <cylinderGeometry args={[0.068, 0.068, 0.008, 7]} />
        <meshStandardMaterial color="#3b2b1e" roughness={0.95} flatShading />
      </mesh>

      {/* Crooked Stems & Drooping Leaves / Act 3 Cheerful Blossoms */}
      {stems.map((s, idx) => (
        <group key={idx} position={s.pos} rotation={s.rot}>
          <mesh position={[0, s.len * 0.5, 0]} castShadow>
            <boxGeometry args={[0.01, s.len, 0.01]} />
            <meshStandardMaterial
              color={lensBroken ? '#3d9932' : '#5e5332'}
              roughness={0.85}
              flatShading
            />
          </mesh>
          {/* Low-Poly Leaf Blade */}
          <mesh
            position={[0.018, s.len * 0.72, 0]}
            rotation={[0.45, 0.2, lensBroken ? -0.35 : -0.95]}
            castShadow
          >
            <boxGeometry args={[0.044, 0.006, 0.022]} />
            <meshStandardMaterial
              color={lensBroken ? '#52c445' : idx % 2 === 0 ? '#7e6f3d' : '#8d7841'}
              roughness={0.8}
              flatShading
            />
          </mesh>
          {/* Act 3 Unnaturally Bright Cheerful Paper/Crimson Blossoms */}
          {lensBroken && (
            <mesh position={[0, s.len + 0.012, 0]} castShadow>
              <octahedronGeometry args={[0.024, 0]} />
              <meshStandardMaterial
                color={s.bloomColor}
                emissive={s.bloomColor}
                emissiveIntensity={0.22}
                roughness={0.5}
                flatShading
              />
            </mesh>
          )}
        </group>
      ))}

      {hovered && showWorldPrompt && (
        <Html position={[0, 0.28, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="ps1-world-prompt">
            {lensBroken
              ? lang === 'zh'
                ? '[盆栽 — 盛开得异常鲜艳]'
                : '[POTTED PLANT — IN FULL BLOOM]'
              : lang === 'zh'
              ? '[枯萎的盆栽 — 查看]'
              : '[WITHERED PLANT — INSPECT]'}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================================
   6. INSTITUTIONAL GREEN 3-TIER METAL FILING CABINET (with Side Photo & Clutter)
   ============================================================================ */
interface FilingCabinetMeshProps {
  position: [number, number, number];
  rotation: [number, number, number];
  lang: Language;
  lensBroken: boolean;
  drawerLocks: [boolean, boolean, boolean];
  openDrawers: [boolean, boolean, boolean];
  showWorldPrompt: boolean;
  onToggleDrawer: (index: 0 | 1 | 2) => void;
  onLockedDrawerRattle: (index: 1 | 2) => void;
  onInspectDrawerFolder: (fileId: DeskFileId) => void;
  onInspectPlant: () => void;
  onHoverLabel?: (label: string | null) => void;
}

export const FilingCabinetMesh: React.FC<FilingCabinetMeshProps> = ({
  position,
  rotation,
  lang,
  lensBroken,
  drawerLocks,
  openDrawers,
  showWorldPrompt,
  onToggleDrawer,
  onLockedDrawerRattle,
  onInspectDrawerFolder,
  onInspectPlant,
  onHoverLabel,
}) => {
  const drawerRefs = useRef<Array<THREE.Group | null>>([null, null, null]);
  const slideProgressRef = useRef<[number, number, number]>([0, 0, 0]);
  const rattleTimersRef = useRef<[number, number, number]>([0, 0, 0]);

  const [hoveredDrawer, setHoveredDrawer] = useState<number | null>(null);
  const [hoveredFolder, setHoveredFolder] = useState<boolean>(false);
  const [lockedNoticeIdx, setLockedNoticeIdx] = useState<number | null>(null);
  const lockNoticeTimeoutRef = useRef<number | null>(null);

  const labelTex0 = useMemo(
    () => createCabinetLabelTexture('#01-A', drawerLocks[0]),
    [drawerLocks[0]]
  );
  const labelTex1 = useMemo(
    () => createCabinetLabelTexture('#02-B', drawerLocks[1]),
    [drawerLocks[1]]
  );
  const labelTex2 = useMemo(
    () => createCabinetLabelTexture('#03-C', drawerLocks[2]),
    [drawerLocks[2]]
  );
  const labelTextures = [labelTex0, labelTex1, labelTex2];

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const speed = Math.min(1, delta * 8.5);

    ([0, 1, 2] as const).forEach((idx) => {
      const grp = drawerRefs.current[idx];
      if (!grp) return;

      const isUnlocked = !drawerLocks[idx];
      const desiredZ = isUnlocked && openDrawers[idx] ? 0.32 : 0;
      slideProgressRef.current[idx] = THREE.MathUtils.lerp(
        slideProgressRef.current[idx],
        desiredZ,
        speed
      );

      let rattleZ = 0;
      let rattleX = 0;
      if (rattleTimersRef.current[idx] > 0) {
        rattleTimersRef.current[idx] = Math.max(
          0,
          rattleTimersRef.current[idx] - delta
        );
        const decay = rattleTimersRef.current[idx] / 0.38;
        rattleZ = Math.sin(t * 58) * 0.012 * decay;
        rattleX = Math.cos(t * 48) * 0.005 * decay;
      }

      grp.position.z = slideProgressRef.current[idx] + rattleZ;
      grp.position.x = rattleX;
    });
  });

  const handleDrawerClick = (idx: 0 | 1 | 2, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (drawerLocks[idx]) {
      rattleTimersRef.current[idx] = 0.38;
      setLockedNoticeIdx(idx);
      if (lockNoticeTimeoutRef.current !== null) {
        window.clearTimeout(lockNoticeTimeoutRef.current);
      }
      lockNoticeTimeoutRef.current = window.setTimeout(() => {
        setLockedNoticeIdx(null);
      }, 2200);
      if (idx === 1 || idx === 2) {
        onLockedDrawerRattle(idx);
      }
      return;
    }
    onToggleDrawer(idx);
  };

  const drawerYPositions = [1.04, 0.64, 0.24];
  const drawerCodes = ['#01-A', '#02-B', '#03-C'];

  return (
    <group position={position} rotation={rotation}>
      {/* Main Institutional Olive-Green Steel Cabinet Shell (0.50 x 1.28 x 0.56) */}
      <mesh position={[0, 0.64, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 1.28, 0.56]} />
        <meshStandardMaterial
          color="#3b4d3b"
          roughness={0.68}
          metalness={0.22}
          flatShading
        />
      </mesh>

      {/* Slightly Darker Recessed Front Cavity Shadow Frame */}
      <mesh position={[0, 0.64, 0.275]}>
        <boxGeometry args={[0.45, 1.2, 0.016]} />
        <meshStandardMaterial color="#232d23" roughness={0.85} flatShading />
      </mesh>

      {/* Recessed Steel Plinth Base */}
      <mesh position={[0, 0.025, 0]} receiveShadow>
        <boxGeometry args={[0.48, 0.05, 0.54]} />
        <meshStandardMaterial
          color="#263026"
          roughness={0.75}
          metalness={0.25}
          flatShading
        />
      </mesh>

      {/* Three Filing Drawers */}
      {drawerYPositions.map((dy, i) => {
        const idx = i as 0 | 1 | 2;
        const isLocked = drawerLocks[idx];
        const isOpen = !isLocked && openDrawers[idx];
        const isHovered = hoveredDrawer === idx;

        return (
          <group
            key={idx}
            ref={(el) => {
              drawerRefs.current[idx] = el;
            }}
            position={[0, dy, 0]}
          >
            {/* Steel Drawer Interior Box Tray (visible when slid open) */}
            <group position={[0, -0.02, 0.06]}>
              {/* Bottom */}
              <mesh position={[0, -0.11, 0]} receiveShadow>
                <boxGeometry args={[0.41, 0.015, 0.42]} />
                <meshStandardMaterial color="#2e392e" roughness={0.7} flatShading />
              </mesh>
              {/* Left & Right Rails */}
              <mesh position={[-0.2, -0.03, 0]}>
                <boxGeometry args={[0.015, 0.16, 0.42]} />
                <meshStandardMaterial color="#344234" roughness={0.65} flatShading />
              </mesh>
              <mesh position={[0.2, -0.03, 0]}>
                <boxGeometry args={[0.015, 0.16, 0.42]} />
                <meshStandardMaterial color="#344234" roughness={0.65} flatShading />
              </mesh>
              {/* Back Wall */}
              <mesh position={[0, -0.03, -0.2]}>
                <boxGeometry args={[0.41, 0.16, 0.015]} />
                <meshStandardMaterial color="#2c372c" roughness={0.7} flatShading />
              </mesh>

              {/* Manila Archive Folders Inside Unlocked Drawer */}
              {!isLocked && (
                <group
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredFolder(true);
                    onHoverLabel?.(
                      lang === 'zh'
                        ? '[ 柜内备用卷宗 / ARCHIVE FOLDERS ]'
                        : '[ ARCHIVE FOLDERS ]'
                    );
                    document.body.style.cursor = 'pointer';
                  }}
                  onPointerOut={(e) => {
                    e.stopPropagation();
                    setHoveredFolder(false);
                    onHoverLabel?.(null);
                    document.body.style.cursor = 'default';
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspectDrawerFolder('file04');
                  }}
                >
                  {[-0.12, -0.05, 0.02, 0.09, 0.15].map((fz, fi) => (
                    <group key={fi} position={[0, -0.01, fz]}>
                      <mesh castShadow>
                        <boxGeometry args={[0.35, 0.18, 0.022]} />
                        <meshStandardMaterial
                          color={
                            hoveredFolder
                              ? '#e2d2ad'
                              : fi % 2 === 0
                              ? '#c9b896'
                              : '#bcae8a'
                          }
                          roughness={0.85}
                          flatShading
                        />
                      </mesh>
                      {/* Staggered Folder Index Tab */}
                      <mesh position={[-0.1 + fi * 0.045, 0.1, 0]}>
                        <boxGeometry args={[0.065, 0.022, 0.018]} />
                        <meshStandardMaterial
                          color={fi === 2 ? '#a85a48' : '#d6c7a5'}
                          roughness={0.8}
                          flatShading
                        />
                      </mesh>
                    </group>
                  ))}

                  {hoveredFolder && isOpen && showWorldPrompt && (
                    <Html
                      position={[0, 0.24, 0.05]}
                      center
                      style={{ pointerEvents: 'none' }}
                    >
                      <div className="ps1-world-prompt">
                        {lang === 'zh'
                          ? '[取出备用审计卷宗 #04]'
                          : '[INSPECT ARCHIVE FOLDERS]'}
                      </div>
                    </Html>
                  )}
                </group>
              )}
            </group>

            {/* Drawer Front Steel Panel (Interactive Click Target) */}
            <group
              position={[0, 0, 0.282]}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                setHoveredDrawer(idx);
                onHoverLabel?.(
                  lang === 'zh'
                    ? `[ 铁皮柜抽屉 ${drawerCodes[idx]} / CABINET DRAWER ]`
                    : `[ CABINET DRAWER ${drawerCodes[idx]} ]`
                );
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                setHoveredDrawer((cur) => (cur === idx ? null : cur));
                onHoverLabel?.(null);
                document.body.style.cursor = 'default';
              }}
              onClick={(e) => handleDrawerClick(idx, e)}
            >
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.44, 0.34, 0.028]} />
                <meshStandardMaterial
                  color={isHovered ? '#546b53' : '#465945'}
                  roughness={0.62}
                  metalness={0.24}
                  flatShading
                />
              </mesh>

              {/* Index Card Brass Label Slot */}
              <mesh position={[0, 0.088, 0.016]}>
                <planeGeometry args={[0.145, 0.058]} />
                <meshStandardMaterial
                  map={labelTextures[idx]}
                  roughness={0.55}
                  flatShading
                />
              </mesh>

              {/* Chunky Dark-Metal Pull Handle */}
              <group position={[0, -0.025, 0.024]}>
                <mesh position={[0, 0, 0.012]} castShadow>
                  <boxGeometry args={[0.16, 0.022, 0.016]} />
                  <meshStandardMaterial
                    color="#1b1e1c"
                    metalness={0.6}
                    roughness={0.4}
                    flatShading
                  />
                </mesh>
                <mesh position={[-0.07, 0, 0.002]}>
                  <boxGeometry args={[0.02, 0.022, 0.018]} />
                  <meshStandardMaterial
                    color="#1b1e1c"
                    metalness={0.6}
                    roughness={0.4}
                    flatShading
                  />
                </mesh>
                <mesh position={[0.07, 0, 0.002]}>
                  <boxGeometry args={[0.02, 0.022, 0.018]} />
                  <meshStandardMaterial
                    color="#1b1e1c"
                    metalness={0.6}
                    roughness={0.4}
                    flatShading
                  />
                </mesh>
              </group>

              {/* Mechanical Lock Cylinder on Middle (#02-B) & Bottom (#03-C) */}
              {idx > 0 && (
                <group
                  position={[0.155, 0.11, 0.018]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <mesh castShadow>
                    <cylinderGeometry args={[0.015, 0.015, 0.012, 6]} />
                    <meshStandardMaterial
                      color="#8f8b78"
                      metalness={0.7}
                      roughness={0.35}
                      flatShading
                    />
                  </mesh>
                  <mesh position={[0, 0.007, 0]}>
                    <boxGeometry
                      args={isLocked ? [0.014, 0.003, 0.004] : [0.004, 0.003, 0.014]}
                    />
                    <meshStandardMaterial color="#111210" flatShading />
                  </mesh>
                </group>
              )}

              {/* Hover World-Space PS1 Prompt */}
              {isHovered &&
                lockedNoticeIdx !== idx &&
                showWorldPrompt &&
                !hoveredFolder && (
                  <Html
                    position={[0, 0.21, 0.04]}
                    center
                    style={{ pointerEvents: 'none' }}
                  >
                    <div
                      className={`ps1-world-prompt ${
                        isLocked ? 'prompt-locked' : ''
                      }`}
                    >
                      {isLocked
                        ? lang === 'zh'
                          ? `[抽屉 ${drawerCodes[idx]} — 已锁定]`
                          : `[DRAWER ${drawerCodes[idx]} — LOCKED]`
                        : isOpen
                        ? lang === 'zh'
                          ? `[抽屉 ${drawerCodes[idx]} — 推回]`
                          : `[DRAWER ${drawerCodes[idx]} — CLOSE]`
                        : lang === 'zh'
                        ? `[抽屉 ${drawerCodes[idx]} — 拉开]`
                        : `[DRAWER ${drawerCodes[idx]} — OPEN]`}
                    </div>
                  </Html>
                )}

              {/* Locked Drawer Rattle Prompt */}
              {lockedNoticeIdx === idx && (
                <Html
                  position={[0, 0.22, 0.05]}
                  center
                  style={{ pointerEvents: 'none' }}
                >
                  <div className="ps1-world-prompt prompt-locked">
                    {lang === 'zh'
                      ? '[已锁定 — 需要密码]'
                      : '[LOCKED — KEYCODE REQUIRED]'}
                  </div>
                </Html>
              )}
            </group>
          </group>
        );
      })}

      {/* CABINET-TOP CLUTTER (y = 1.28): Stacked Cardboard Archive Boxes + Crooked Binder */}
      <group position={[-0.1, 1.28, -0.07]}>
        {/* Bottom Archive Box */}
        <mesh position={[0, 0.07, 0]} rotation={[0, 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.24, 0.14, 0.22]} />
          <meshStandardMaterial color="#8f8068" roughness={0.88} flatShading />
        </mesh>
        <mesh position={[0, 0.142, 0]} rotation={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[0.252, 0.018, 0.232]} />
          <meshStandardMaterial color="#7d6f59" roughness={0.88} flatShading />
        </mesh>
        {/* Front Label Strip */}
        <mesh position={[0.01, 0.07, 0.112]} rotation={[0, 0.06, 0]}>
          <planeGeometry args={[0.11, 0.045]} />
          <meshStandardMaterial color="#dfd6c0" roughness={0.9} flatShading />
        </mesh>

        {/* Top Stacked Archive Box (Askew) */}
        <mesh
          position={[0.01, 0.205, 0.01]}
          rotation={[0, -0.14, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.2, 0.11, 0.18]} />
          <meshStandardMaterial color="#7d6f59" roughness={0.88} flatShading />
        </mesh>
        <mesh position={[0.01, 0.262, 0.01]} rotation={[0, -0.14, 0]} castShadow>
          <boxGeometry args={[0.21, 0.016, 0.19]} />
          <meshStandardMaterial color="#6e614d" roughness={0.88} flatShading />
        </mesh>
        <mesh position={[0.01, 0.205, 0.102]} rotation={[0, -0.14, 0]}>
          <planeGeometry args={[0.09, 0.036]} />
          <meshStandardMaterial color="#dfd6c0" roughness={0.9} flatShading />
        </mesh>

        {/* Crooked Institutional Binder Leaning Beside Boxes */}
        <group position={[0.145, 0.085, -0.04]} rotation={[0, 0.12, 0.22]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.042, 0.18, 0.22]} />
            <meshStandardMaterial color="#2c3844" roughness={0.78} flatShading />
          </mesh>
          <mesh position={[0, 0.02, 0.112]}>
            <planeGeometry args={[0.028, 0.08]} />
            <meshStandardMaterial color="#d8d0be" roughness={0.85} flatShading />
          </mesh>
        </group>
      </group>

      {/* CABINET-TOP WITHERED POTTED PLANT (Morphs into Cheerful Blooms in Act 3) */}
      <WitheredPlantMesh
        position={[0.11, 1.28, 0.1]}
        lensBroken={lensBroken}
        lang={lang}
        showWorldPrompt={showWorldPrompt}
        onInspect={onInspectPlant}
        onHoverLabel={onHoverLabel}
      />
    </group>
  );
};

/* ============================================================================
   7. DESKTOP LOW-POLY CASSETTE TAPE RECORDER (Back-Right Desk Corner)
   ============================================================================ */
interface TapeRecorderMeshProps {
  position: [number, number, number];
  rotation: [number, number, number];
  isTapePlaying: boolean;
  lensBroken: boolean;
  lang: Language;
  showWorldPrompt: boolean;
  onToggleTape: () => void;
  onHoverLabel?: (label: string | null) => void;
}

export const TapeRecorderMesh: React.FC<TapeRecorderMeshProps> = ({
  position,
  rotation,
  isTapePlaying,
  lensBroken,
  lang,
  showWorldPrompt,
  onToggleTape,
  onHoverLabel,
}) => {
  const [hovered, setHovered] = useState(false);
  const leftReelRef = useRef<THREE.Mesh>(null);
  const rightReelRef = useRef<THREE.Mesh>(null);
  const playBtnRef = useRef<THREE.Mesh>(null);

  const faceTex = useMemo(
    () => createTapeDeckFaceTexture(isTapePlaying),
    [isTapePlaying]
  );

  useFrame((_, delta) => {
    if (isTapePlaying) {
      if (leftReelRef.current) leftReelRef.current.rotation.y -= delta * 3.8;
      if (rightReelRef.current) rightReelRef.current.rotation.y -= delta * 3.8;
    }
    if (playBtnRef.current) {
      const targetY = isTapePlaying ? 0.056 : 0.068;
      playBtnRef.current.position.y = THREE.MathUtils.lerp(
        playBtnRef.current.position.y,
        targetY,
        Math.min(1, delta * 14)
      );
    }
  });

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        onHoverLabel?.(
          lang === 'zh'
            ? '[ 磁带录音机 / CASSETTE RECORDER ]'
            : '[ CASSETTE RECORDER ]'
        );
        onHoverLabel?.(
          lang === 'zh'
            ? '[ 磁带录音机 / CASSETTE RECORDER ]'
            : '[ CASSETTE RECORDER ]'
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
        onToggleTape();
      }}
    >
      {/* Main Faceted Dark-Slate Housing */}
      <mesh position={[0, 0.036, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.072, 0.19]} />
        <meshStandardMaterial
          color={hovered ? '#3d4247' : '#2b2e31'}
          roughness={0.62}
          metalness={0.25}
          flatShading
        />
      </mesh>

      {/* Top Fascia Plate (Speaker Grille + Status Markings) */}
      <mesh position={[0, 0.073, -0.01]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.26, 0.145]} />
        <meshStandardMaterial
          map={faceTex}
          roughness={0.5}
          metalness={0.35}
          flatShading
        />
      </mesh>

      {/* Cassette Well & Tinted Window */}
      <group position={[0.058, 0.074, -0.008]}>
        <mesh position={[0, -0.002, 0]}>
          <boxGeometry args={[0.115, 0.006, 0.074]} />
          <meshStandardMaterial color="#16181a" roughness={0.8} flatShading />
        </mesh>
        {/* Cream/Charcoal Cassette Shell */}
        <mesh position={[0, 0.002, 0]}>
          <boxGeometry args={[0.098, 0.006, 0.06]} />
          <meshStandardMaterial color="#cfc8b6" roughness={0.7} flatShading />
        </mesh>
        {/* Left & Right Spinning 6-Sided Tape Reels */}
        <mesh ref={leftReelRef} position={[-0.024, 0.007, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.004, 6]} />
          <meshStandardMaterial color="#24221e" roughness={0.5} flatShading />
        </mesh>
        <mesh ref={rightReelRef} position={[0.024, 0.007, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.004, 6]} />
          <meshStandardMaterial color="#24221e" roughness={0.5} flatShading />
        </mesh>
        {/* Tinted Acrylic Lid Window */}
        <mesh position={[0, 0.011, 0]}>
          <boxGeometry args={[0.106, 0.003, 0.068]} />
          <meshStandardMaterial
            color="#10181c"
            transparent
            opacity={0.42}
            roughness={0.2}
            flatShading
          />
        </mesh>
      </group>

      {/* Chunky Physical Push-Buttons Along Front Lip */}
      {/* PLAY (depresses when active) */}
      <mesh ref={playBtnRef} position={[-0.085, 0.068, 0.072]} castShadow>
        <boxGeometry args={[0.036, 0.018, 0.03]} />
        <meshStandardMaterial
          color={isTapePlaying ? '#6c9c6e' : '#a8ada8'}
          roughness={0.55}
          flatShading
        />
      </mesh>
      {/* STOP */}
      <mesh position={[-0.042, 0.068, 0.072]} castShadow>
        <boxGeometry args={[0.034, 0.018, 0.03]} />
        <meshStandardMaterial color="#969b96" roughness={0.55} flatShading />
      </mesh>
      {/* EJECT */}
      <mesh position={[0.001, 0.068, 0.072]} castShadow>
        <boxGeometry args={[0.034, 0.018, 0.03]} />
        <meshStandardMaterial color="#8c918c" roughness={0.55} flatShading />
      </mesh>
      {/* REC (Red Cap) */}
      <mesh position={[0.044, 0.068, 0.072]} castShadow>
        <boxGeometry args={[0.032, 0.018, 0.03]} />
        <meshStandardMaterial color="#9c3232" roughness={0.55} flatShading />
      </mesh>

      {/* Playback Indicator LED */}
      <mesh position={[0.11, 0.076, 0.068]}>
        <boxGeometry args={[0.014, 0.006, 0.01]} />
        <meshBasicMaterial
          color={
            isTapePlaying
              ? lensBroken
                ? '#ff66a8'
                : '#66e07a'
              : '#3b2424'
          }
        />
      </mesh>

      {hovered && showWorldPrompt && (
        <Html position={[0, 0.16, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="ps1-world-prompt">
            {isTapePlaying
              ? lang === 'zh'
                ? '[磁带录音机 — 播放中 · 点击停止]'
                : '[TAPE RECORDER — PLAYING · STOP]'
              : lang === 'zh'
              ? '[磁带录音机 — 点击播放]'
              : '[TAPE RECORDER — PLAY]'}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================================
   8. FOCUSED VINTAGE ARTICULATED DESK LAMP (Back-Left Desk Corner)
   ============================================================================ */
interface VintageDeskLampMeshProps {
  position: [number, number, number];
  rotation: [number, number, number];
  isOn: boolean;
  lensBroken: boolean;
  brightness: number;
  lang: Language;
  showWorldPrompt: boolean;
  onToggle: () => void;
  onHoverLabel?: (label: string | null) => void;
}

export const VintageDeskLampMesh: React.FC<VintageDeskLampMeshProps> = ({
  position,
  rotation,
  isOn,
  lensBroken,
  brightness,
  lang,
  showWorldPrompt,
  onToggle,
  onHoverLabel,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        onHoverLabel?.(
          lang === 'zh' ? '[ 复古台灯 / DESK LAMP ]' : '[ VINTAGE DESK LAMP ]'
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
        onToggle();
      }}
    >
      {/* Heavy Octagonal Cast-Metal Base */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.115, 0.128, 0.04, 8]} />
        <meshStandardMaterial
          color={hovered ? '#47524a' : '#2e3530'}
          roughness={0.55}
          metalness={0.4}
          flatShading
        />
      </mesh>
      {/* Rocker Power Switch Button on Base */}
      <mesh position={[0.028, 0.044, 0.066]} castShadow>
        <boxGeometry args={[0.03, 0.016, 0.025]} />
        <meshStandardMaterial
          color={isOn ? '#c49d56' : '#635c50'}
          roughness={0.5}
          flatShading
        />
      </mesh>

      {/* Lower Articulated Arm */}
      <mesh
        position={[-0.02, 0.225, -0.034]}
        rotation={[-0.22, 0, 0.14]}
        castShadow
      >
        <boxGeometry args={[0.025, 0.405, 0.025]} />
        <meshStandardMaterial
          color="#3a403c"
          metalness={0.55}
          roughness={0.45}
          flatShading
        />
      </mesh>

      {/* Brass Elbow Joint Screw */}
      <mesh position={[-0.048, 0.415, -0.08]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.036, 6]} />
        <meshStandardMaterial
          color="#9e874e"
          metalness={0.7}
          roughness={0.35}
          flatShading
        />
      </mesh>

      {/* Upper Articulated Arm Reaching Forward Toward Manual & Lunchbox */}
      <mesh
        position={[0.048, 0.49, 0.1]}
        rotation={[1.15, 0, -0.14]}
        castShadow
      >
        <boxGeometry args={[0.022, 0.39, 0.022]} />
        <meshStandardMaterial
          color="#3a403c"
          metalness={0.55}
          roughness={0.45}
          flatShading
        />
      </mesh>

      {/* Faceted Metal Lamp Shade & Bulb Mouth */}
      <group position={[0.12, 0.54, 0.28]} rotation={[0.42, 0, -0.18]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.048, 0.123, 0.133, 8]} />
          <meshStandardMaterial
            color={hovered ? '#47524a' : '#2e3530'}
            roughness={0.5}
            metalness={0.35}
            flatShading
          />
        </mesh>
        {/* Warm Emissive Bulb Core */}
        <mesh position={[0, -0.045, 0]}>
          <octahedronGeometry args={[0.034, 0]} />
          <meshStandardMaterial
            color={isOn ? '#fff6db' : '#5e5a52'}
            emissive={isOn ? (lensBroken ? '#ffd485' : '#ffeaad') : '#000000'}
            emissiveIntensity={isOn ? 1.5 : 0}
            flatShading
          />
        </mesh>
        {/* Focused Warm Localized Light Pool over Manual, Lunchbox & Left Desk Corner */}
        {isOn && (
          <pointLight
            position={[0, -0.09, 0.028]}
            intensity={(lensBroken ? 2.65 : 2.4) * brightness}
            distance={2.15}
            decay={2}
            color={lensBroken ? '#ffd996' : '#ffdfa8'}
          />
        )}
      </group>

      {hovered && showWorldPrompt && (
        <Html position={[0.12, 0.7, 0.22]} center style={{ pointerEvents: 'none' }}>
          <div className="ps1-world-prompt">
            {isOn
              ? lang === 'zh'
                ? '[台灯 — 开启 · 点击关闭]'
                : '[DESK LAMP — ON · SWITCH OFF]'
              : lang === 'zh'
              ? '[台灯 — 关闭 · 点击开启]'
              : '[DESK LAMP — OFF · SWITCH ON]'}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================================
   9. LOOPING-TIME DESK CALENDAR (Densely Crossed-Out Repeating 11/13 Dates)
   ============================================================================ */
interface DeskCalendarMeshProps {
  position: [number, number, number];
  rotation: [number, number, number];
  lang: Language;
  showWorldPrompt: boolean;
  onInspect: () => void;
  onHoverLabel?: (label: string | null) => void;
}

export const DeskCalendarMesh: React.FC<DeskCalendarMeshProps> = ({
  position,
  rotation,
  lang,
  showWorldPrompt,
  onInspect,
  onHoverLabel,
}) => {
  const [hovered, setHovered] = useState(false);
  const calTex = useMemo(() => createLoopingCalendarTexture(), []);

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        onHoverLabel?.(
          lang === 'zh'
            ? '[ 桌面台历 (11/13) / DESK CALENDAR ]'
            : '[ DESK CALENDAR (11/13) ]'
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
        onInspect();
      }}
    >
      {/* A-Frame Dark Cardboard Base */}
      <mesh position={[0, 0.005, 0]} receiveShadow>
        <boxGeometry args={[0.135, 0.01, 0.11]} />
        <meshStandardMaterial color="#2a2824" roughness={0.85} flatShading />
      </mesh>
      {/* Back Support Strut */}
      <mesh position={[0, 0.06, -0.025]} rotation={[0.38, 0, 0]} castShadow>
        <boxGeometry args={[0.13, 0.125, 0.008]} />
        <meshStandardMaterial color="#36322c" roughness={0.85} flatShading />
      </mesh>
      {/* Front Angled Calendar Pad */}
      <mesh position={[0, 0.062, 0.022]} rotation={[-0.32, 0, 0]} castShadow>
        <boxGeometry args={[0.13, 0.125, 0.01]} />
        <meshStandardMaterial
          color={hovered ? '#ebe2cf' : '#dcd3be'}
          roughness={0.88}
          flatShading
        />
      </mesh>
      {/* Front Printed Repeating-11/13 Page Face */}
      <mesh position={[0, 0.063, 0.028]} rotation={[-0.32, 0, 0]}>
        <planeGeometry args={[0.122, 0.118]} />
        <meshStandardMaterial map={calTex} roughness={0.9} />
      </mesh>
      {/* Twin Metal Spiral Spine Rings */}
      {[-0.036, 0, 0.036].map((rx, idx) => (
        <mesh key={idx} position={[rx, 0.122, 0.002]}>
          <boxGeometry args={[0.01, 0.014, 0.016]} />
          <meshStandardMaterial
            color="#a4aaae"
            metalness={0.75}
            roughness={0.3}
            flatShading
          />
        </mesh>
      ))}

      {hovered && showWorldPrompt && (
        <Html position={[0, 0.19, 0.02]} center style={{ pointerEvents: 'none' }}>
          <div className="ps1-world-prompt">
            {lang === 'zh'
              ? '[桌面台历 (11/13) — 查看]'
              : '[DESK CALENDAR (11/13) — INSPECT]'}
          </div>
        </Html>
      )}
    </group>
  );
};

/* ============================================================================
   10. LIVED-IN DESK CLUTTER: METALLIC PAPERCLIPS & YELLOWING STICKY NOTES
   ============================================================================ */
export const DeskClutterGroup: React.FC = () => {
  const note0 = useMemo(() => createStickyNoteTexture(0), []);
  const note1 = useMemo(() => createStickyNoteTexture(1), []);
  const note2 = useMemo(() => createStickyNoteTexture(2), []);

  const paperclips: Array<{
    pos: [number, number, number];
    rotY: number;
    brass?: boolean;
  }> = [
    { pos: [0.36, 0.766, 0.12], rotY: 0.4 },
    { pos: [0.41, 0.766, 0.06], rotY: 1.9, brass: true },
    { pos: [0.46, 0.766, -0.02], rotY: -0.6 },
    { pos: [0.51, 0.766, 0.25], rotY: 1.1 },
    { pos: [0.34, 0.766, 0.26], rotY: -1.4, brass: true },
    { pos: [0.54, 0.766, -0.05], rotY: 0.75 },
  ];

  return (
    <group>
      {/* Scattered Low-Poly Metallic Paperclips near Dossiers */}
      {paperclips.map((clip, idx) => (
        <group
          key={idx}
          position={clip.pos}
          rotation={[0, clip.rotY, 0]}
        >
          <mesh position={[0, 0, -0.005]}>
            <boxGeometry args={[0.028, 0.003, 0.003]} />
            <meshStandardMaterial
              color={clip.brass ? '#c8ba92' : '#b8bec2'}
              metalness={0.78}
              roughness={0.28}
              flatShading
            />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <boxGeometry args={[0.024, 0.003, 0.003]} />
            <meshStandardMaterial
              color={clip.brass ? '#c8ba92' : '#b8bec2'}
              metalness={0.78}
              roughness={0.28}
              flatShading
            />
          </mesh>
          <mesh position={[0.013, 0, 0]}>
            <boxGeometry args={[0.003, 0.003, 0.012]} />
            <meshStandardMaterial
              color={clip.brass ? '#c8ba92' : '#b8bec2'}
              metalness={0.78}
              roughness={0.28}
              flatShading
            />
          </mesh>
        </group>
      ))}

      {/* Yellowing Sticky Note 1: Left-Front Desk Pad */}
      <mesh
        position={[-0.31, 0.767, 0.34]}
        rotation={[-Math.PI / 2, 0, 0.14]}
        receiveShadow
      >
        <planeGeometry args={[0.078, 0.078]} />
        <meshStandardMaterial map={note0} roughness={0.9} />
      </mesh>

      {/* Yellowing Sticky Note 2: Beside Monitor Right Pedestal */}
      <mesh
        position={[0.35, 0.767, -0.04]}
        rotation={[-Math.PI / 2, 0, -0.22]}
        receiveShadow
      >
        <planeGeometry args={[0.072, 0.072]} />
        <meshStandardMaterial map={note1} roughness={0.9} />
      </mesh>

      {/* Yellowing Sticky Note 3: Pinned on Green Cabinet Side Wall below Family_Photo */}
      <mesh
        position={[-0.892, 0.86, 0.05]}
        rotation={[0, Math.PI / 2 + 0.08, -0.05]}
      >
        <planeGeometry args={[0.072, 0.072]} />
        <meshStandardMaterial map={note2} roughness={0.9} />
      </mesh>
    </group>
  );
};

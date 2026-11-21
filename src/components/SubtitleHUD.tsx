import React, { useState } from 'react';
import { getNarrativeBundle } from '../data/narrativeAssets';
import { ActStage, FocusTarget, Language } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface SubtitleHUDProps {
  lang: Language;
  actStage: ActStage;
  focusTarget: FocusTarget;
  lensBroken: boolean;
  endingARedactedCount: number;
  hoveredPropLabel: string | null;
  innerVoice: string;
  innerVoiceSource: string;
  subtitleLagging: boolean;
  brightness: number;
  onChangeBrightness: (value: number) => void;
  onToggleLang: () => void;
  onExitFocus: () => void;
  onJumpActStage: (stage: ActStage) => void;
}

export const SubtitleHUD: React.FC<SubtitleHUDProps> = ({
  lang,
  actStage,
  focusTarget,
  lensBroken,
  endingARedactedCount,
  hoveredPropLabel,
  innerVoice,
  innerVoiceSource,
  subtitleLagging,
  brightness,
  onChangeBrightness,
  onToggleLang,
  onExitFocus,
  onJumpActStage,
}) => {
  const [devExpanded, setDevExpanded] = useState<boolean>(false);
  const { ui } = getNarrativeBundle(lang);
  const isMonitorFocused = focusTarget === 'monitor';
  const showCorruptedOperator = lensBroken && endingARedactedCount < 2;

  return (
    <>
      {/* Subtle Top-Left Collapsible Developer Stage Switcher (Alt+1..4 always active) */}
      <div
        className={`dev-stage-bar ${isMonitorFocused ? 'dev-bar-stealth' : ''}`}
        title="Alt+1 / Alt+2 / Alt+3 / Alt+4"
      >
        <button
          type="button"
          className="dev-toggle-btn"
          onClick={() => setDevExpanded((v) => !v)}
        >
          {`DEV · A${actStage}`}
        </button>

        {devExpanded && (
          <div className="dev-controls-inline">
            {([1, 2, 3, 4] as ActStage[]).map((stage) => (
              <button
                key={stage}
                type="button"
                className={`dev-act-btn ${actStage === stage ? 'active' : ''}`}
                onClick={() => onJumpActStage(stage)}
              >
                {`A${stage}`}
              </button>
            ))}
            <span className="dev-hotkey-hint">Alt+1~4</span>
          </div>
        )}
      </div>

      {/* Top-Right Minimalist Controls — HIDDEN while zoomed into CRT monitor */}
      {!isMonitorFocused && (
        <div className="hud-top-right">
          <span
            className={`hud-operator-badge ${
              showCorruptedOperator ? 'operator-corrupted' : ''
            }`}
          >
            {showCorruptedOperator ? ui.operatorCorrupted : ui.operatorActive}
          </span>

          {focusTarget !== 'none' && (
            <button
              type="button"
              className="hud-exit-pill"
              onClick={() => {
                soundEngine.playPaperRustle();
                onExitFocus();
              }}
            >
              {lang === 'zh'
                ? '[ ESC / 右键退回桌面 ]'
                : '[ ESC / RMB Return to Desk ]'}
            </button>
          )}

          <div
            className="hud-brightness-control"
            title={
              lang === 'zh'
                ? '调节画面亮度（双击数值恢复默认 1.2x）'
                : 'Adjust scene brightness (double-click value to reset 1.2x)'
            }
          >
            <span className="hud-brightness-label" aria-hidden="true">
              {lang === 'zh' ? '亮度' : 'LUX'}
            </span>
            <input
              type="range"
              className="hud-brightness-slider"
              min={0.5}
              max={2.0}
              step={0.05}
              value={brightness}
              aria-label={lang === 'zh' ? '画面亮度' : 'Scene brightness'}
              onChange={(e) => onChangeBrightness(parseFloat(e.target.value))}
            />
            <button
              type="button"
              className="hud-brightness-value"
              onDoubleClick={() => onChangeBrightness(1.2)}
            >
              {(Number.isInteger(Math.round(brightness * 100) / 10)
                ? brightness.toFixed(1)
                : brightness.toFixed(2)) + 'x'}
            </button>
          </div>

          <button
            type="button"
            className="hud-lang-btn"
            onClick={() => {
              soundEngine.playKeyClick();
              onToggleLang();
            }}
            title="切换语言 / Switch Language"
          >
            {lang === 'zh' ? '[中文 / EN]' : '[EN / 中文]'}
          </button>
        </div>
      )}

      {/* Bottom Hover Preview Label (Concise Prop Name Prior to Clicking) */}
      {!isMonitorFocused && focusTarget === 'none' && hoveredPropLabel && (
        <div className="bottom-hover-preview-tag" aria-live="polite">
          {hoveredPropLabel}
        </div>
      )}

      {/* Single, Unobtrusive Bottom-Edge Subtitle Line */}
      <div
        className={`single-line-subtitle-hud ${
          isMonitorFocused ? 'subtitle-monitor-mode' : ''
        } ${subtitleLagging ? 'subtitle-lag-pulse' : ''}`}
        aria-live="polite"
      >
        <span
          className={`subtitle-speaker-tag ${
            lensBroken ? 'speaker-corrupted' : ''
          }`}
        >
          [{innerVoiceSource}]
        </span>
        <span className="single-line-subtitle-text">{innerVoice}</span>
      </div>
    </>
  );
};

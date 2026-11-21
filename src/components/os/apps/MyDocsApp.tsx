import React, { useState } from 'react';
import { ActStage, Language } from '../../../types';
import { soundEngine } from '../../../utils/soundEngine';
import { MY_DOCS_FILES } from '../osData';

interface MyDocsAppProps {
  lang: Language;
  actStage: ActStage;
  onDiscoverAnomaly: (key: string, subtitle?: string) => void;
}

export const MyDocsApp: React.FC<MyDocsAppProps> = ({
  lang,
  actStage,
  onDiscoverAnomaly,
}) => {
  const [selectedId, setSelectedId] = useState<string>(MY_DOCS_FILES[0].id);
  const current =
    MY_DOCS_FILES.find((f) => f.id === selectedId) ?? MY_DOCS_FILES[0];
  const lines = current.getBody(actStage, lang);

  const handleSelect = (id: string) => {
    soundEngine.playKeyClick();
    setSelectedId(id);
    if (actStage === 2) {
      const sub =
        id === 'coffee_notice'
          ? lang === 'zh'
            ? '茶水间早就断电了？那杯热咖啡到底从哪儿来的？'
            : 'The pantry breaker has been off for days... where did this hot coffee come from?'
          : undefined;
      onDiscoverAnomaly(`doc_${id}_act${actStage}`, sub);
    }
  };

  return (
    <div className="os-split-explorer">
      <aside className="os-file-sidebar">
        <div className="os-sidebar-head">C:\302\MY_DOCS</div>
        <div className="os-file-list">
          {MY_DOCS_FILES.map((file) => (
            <button
              key={file.id}
              type="button"
              className={`os-file-item ${
                file.id === selectedId ? 'selected' : ''
              }`}
              onClick={() => handleSelect(file.id)}
            >
              <span className="os-file-name">
                {lang === 'zh' ? file.filenameZh : file.filenameEn}
              </span>
              <span className="os-file-meta">
                {file.size} · {lang === 'zh' ? file.dateZh : file.dateEn}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <div className="os-doc-viewer">
        <div className="os-viewer-toolbar">
          <span>
            {lang === 'zh' ? current.filenameZh : current.filenameEn}
          </span>
          <span>
            {actStage === 3
              ? '[READ-ONLY // VERIFIED ★]'
              : actStage >= 4
              ? '[READ-ONLY // CORRUPTED]'
              : '[READ-ONLY // ASCII]'}
          </span>
        </div>
        <pre className="os-doc-pre">{lines.join('\n')}</pre>
      </div>
    </div>
  );
};

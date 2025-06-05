import React from 'react';
import { FlowchartDirectionDropdown } from './FlowchartDirectionDropdown';

interface DiagramHeaderProps {
  name: string;
  onExport: () => void;
  diagramId: string;
  code: string;
}

export function DiagramHeader({ name, onExport, diagramId, code }: DiagramHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 pb-2 mb-2 border-b border-gray-200">
      <div className="text-sm font-semibold text-gray-700 truncate">
        {name}
      </div>

      <div className="flex items-center gap-2">
        <FlowchartDirectionDropdown diagramId={diagramId} code={code} />
        
        <button
          className="flex items-center justify-center p-1 text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}
          title={`Export ${name} as PNG`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7,10 12,15 17,10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

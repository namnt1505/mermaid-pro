import React from 'react';

interface DiagramHeaderProps {
  name: string;
  onExport: () => void;
}

export function DiagramHeader({ name, onExport }: DiagramHeaderProps) {
  return (
    <div
      className="diagram-header"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
        paddingBottom: '4px',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div
        className="diagram-title"
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151',
        }}
      >
        {name}
      </div>
      <button
        className="export-button hover:bg-gray-200 hover:text-gray-700"
        onClick={(e) => {
          e.stopPropagation();
          onExport();
        }}
        title={`Export ${name} as PNG`}
        style={{
          background: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          padding: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          transition: 'all 0.2s ease',
        }}
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
  );
}

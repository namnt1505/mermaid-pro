import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useDiagramAction } from '../context/DiagramActionContext'; // Added import

interface DiagramContentProps {
  diagramId: string; // Added diagramId
  code: string;
  index: number;
  name: string;
  // onCodeChange?: (newCode: string) => void; // Removed onCodeChange
}

export function DiagramContent({ diagramId, code, index, name }: DiagramContentProps) { // Added diagramId, removed onCodeChange
  const contentRef = useRef<HTMLDivElement>(null);
  const { onCodeChange } = useDiagramAction(); // Use context

  // Check if the diagram is a flowchart and get its direction
  const getFlowchartDirection = (code: string) => {
    const match = code.match(/^\s*flowchart\s+(TD|LR|RL|BT)/m);
    return match ? match[1] : null;
  };

  // Change flowchart direction and update code
  const changeDirection = (newDirection: string) => {
    const currentDirection = getFlowchartDirection(code);
    if (currentDirection) {
      const newCode = code.replace(
        new RegExp(`^(\\s*flowchart\\s+)(${currentDirection})`, 'm'),
        `$1${newDirection}`
      );
      // console.log(newCode) // Kept for debugging, can be removed
      if (onCodeChange) {
        onCodeChange(diagramId, newCode); // Call context's onCodeChange with diagramId
      }
    }
  };

  const directions = [
    { value: 'TD', label: 'Top to Bottom' },
    { value: 'BT', label: 'Bottom to Top' },
    { value: 'LR', label: 'Left to Right' },
    { value: 'RL', label: 'Right to Left' },
  ];

  useEffect(() => {
    const renderDiagram = async () => {
      if (!contentRef.current) return;

      try {
        const { svg } = await mermaid.render(`mermaid-diagram-${index}`, code);
        contentRef.current.innerHTML = svg;

        // Apply additional styling to the rendered SVG
        const svgElement = contentRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.padding = '5px';
          svgElement.style.width = 'auto';
          svgElement.style.height = 'auto';
          svgElement.style.maxWidth = 'none';
          
          // Add smooth transition for SVG transformations
          svgElement.style.transform = 'scale(1)';
          svgElement.style.opacity = '0';
          setTimeout(() => {
            svgElement.style.opacity = '1';
          }, 10);

          // Style different node types
          const nodes = svgElement.querySelectorAll('.node');
          nodes.forEach((node) => {
            const rect = node.querySelector('rect, circle, polygon');
            if (rect) {
              rect.setAttribute('filter', 'drop-shadow(1px 1px 2px rgba(0,0,0,0.1))');
              rect.setAttribute('rx', '6');
            }
          });

          // Style subgraphs
          const clusters = svgElement.querySelectorAll('.cluster rect');
          clusters.forEach((cluster) => {
            cluster.setAttribute('rx', '8');
            cluster.setAttribute('stroke-width', '1.5');
            cluster.setAttribute('filter', 'drop-shadow(1px 1px 2px rgba(0,0,0,0.1))');
          });

          // Style edges/arrows
          const edges = svgElement.querySelectorAll('.edgePath path');
          edges.forEach((edge) => {
            edge.setAttribute('stroke-width', '1.5');
            edge.setAttribute('filter', 'drop-shadow(0.5px 0.5px 1px rgba(0,0,0,0.1))');
          });
        }
      } catch (error) {
        console.error(`Error rendering diagram ${name}:`, error);
        contentRef.current.innerHTML = `
          <div style="padding: 12px; color: #dc2626; border: 1px solid #fca5a5; border-radius: 6px; background: #fef2f2;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <strong style="font-size: 12px;">Error rendering diagram "${name}"</strong><br/>
                <span style="font-size: 11px;">Please check your Mermaid syntax.</span>
              </div>
              <button 
                class="copy-error-btn"
                style="padding: 4px 8px; border-radius: 4px; font-size: 11px; background: #fee2e2; border: 1px solid #fca5a5; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                onclick="navigator.clipboard.writeText(this.parentElement.parentElement.querySelector('pre').textContent)"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy Error
              </button>
            </div>
            <details style="margin-top: 6px;">
              <summary style="cursor: pointer; font-size: 11px;">Error details</summary>
              <pre style="margin-top: 4px; font-size: 10px; user-select: text; white-space: pre-wrap; word-break: break-word;">${error}</pre>
            </details>
          </div>
        `;

        // Add click handler for copy button
        const copyButton = contentRef.current.querySelector('.copy-error-btn');
        if (copyButton) {
          copyButton.addEventListener('click', () => {
            const errorText = contentRef.current?.querySelector('pre')?.textContent || '';
            navigator.clipboard.writeText(errorText).then(() => {
              const originalText = copyButton.innerHTML;
              copyButton.innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
                Copied!
              `;
              setTimeout(() => {
                copyButton.innerHTML = originalText;
              }, 2000);
            });
          });
        }
      }
    };

    renderDiagram();
  }, [code, index, name]);

  return (
    <div className="relative">
      <style jsx>{`
        .transform-opacity {
          transition: transform 0.3s ease-out, opacity 0.2s ease-out;
        }
        .diagram-content svg {
          transition: all 0.3s ease-out;
        }
        .diagram-content .node,
        .diagram-content .cluster,
        .diagram-content .edgePath {
          transition: transform 0.3s ease-out, opacity 0.2s ease-out;
        }
        .diagram-content:not(:hover) .node,
        .diagram-content:not(:hover) .cluster,
        .diagram-content:not(:hover) .edgePath {
          opacity: 0.9;
        }
        .diagram-content:hover .node,
        .diagram-content:hover .cluster,
        .diagram-content:hover .edgePath {
          opacity: 1;
        }
      `}</style>
      {getFlowchartDirection(code) && (
        <DropdownMenu>
          <DropdownMenuTrigger className="absolute top-2 right-2 bg-white/80 hover:bg-white border border-gray-200 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 shadow-sm backdrop-blur-sm z-10 flex items-center gap-1.5 transition-all">
            <span className="flex items-center gap-1.5">
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
                <path d="M4 4v16" />
                <path d="M20 4v16" />
                <path d="M12 4v16" />
                <path d="m8 8 4-4 4 4" />
                <path d="m16 16-4 4-4-4" />
              </svg>
              {directions.find(d => d.value === getFlowchartDirection(code))?.label || getFlowchartDirection(code)}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px]">
            {directions.map((direction) => (
              <DropdownMenuItem
                key={direction.value}
                onClick={() => changeDirection(direction.value)}
                className="text-xs"
              >
                {direction.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <div
        ref={contentRef}
        className="diagram-content"
        id={`diagram-${index}`}
      />
    </div>
  );
}

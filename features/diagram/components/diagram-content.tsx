import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface DiagramContentProps {
  code: string;
  index: number;
  name: string;
}

export function DiagramContent({ code, index, name }: DiagramContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

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
    <div
      ref={contentRef}
      className="diagram-content"
      id={`diagram-${index}`}
    />
  );
}

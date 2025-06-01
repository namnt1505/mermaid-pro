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
            <strong style="font-size: 12px;">Error rendering diagram "${name}"</strong><br/>
            <span style="font-size: 11px;">Please check your Mermaid syntax.</span>
            <details style="margin-top: 6px;">
              <summary style="cursor: pointer; font-size: 11px;">Error details</summary>
              <pre style="margin-top: 4px; font-size: 10px;">${error}</pre>
            </details>
          </div>
        `;
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

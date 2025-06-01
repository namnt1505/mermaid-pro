import React from 'react';
import { toPng } from "html-to-image";
import mermaid from "mermaid";

interface Diagram {
  id: string;
  name: string;
  code: string;
}

interface DiagramsContainerProps {
  diagrams: Diagram[];
  onExportDiagram: (diagramId: string, diagramName: string) => Promise<void>;
}

export function DiagramsContainer({ diagrams, onExportDiagram }: DiagramsContainerProps) {
  const renderDiagram = (diagram: Diagram, index: number) => {
    try {
      const diagramWrapper = document.createElement("div");
      diagramWrapper.className = "diagram-wrapper";
      diagramWrapper.id = `diagram-wrapper-${diagram.id}`;
      diagramWrapper.style.cssText = `
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 12px;
        background: #ffffff;
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        position: relative;
        width: max-content;
        min-width: 500px;
      `;

      // Add diagram header with title and export button
      const headerElement = document.createElement("div");
      headerElement.className = "diagram-header";
      headerElement.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        padding-bottom: 4px;
        border-bottom: 1px solid #e5e7eb;
      `;

      // Add diagram title
      const titleElement = document.createElement("div");
      titleElement.className = "diagram-title";
      titleElement.textContent = diagram.name;
      titleElement.style.cssText = `
        font-size: 14px;
        font-weight: 600;
        color: #374151;
      `;

      // Add export button
      const exportButton = document.createElement("button");
      exportButton.className = "export-button";
      exportButton.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      `;
      exportButton.style.cssText = `
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6b7280;
        transition: all 0.2s ease;
      `;
      exportButton.title = `Export ${diagram.name} as PNG`;
      exportButton.addEventListener("mouseenter", () => {
        exportButton.style.background = "#e5e7eb";
        exportButton.style.color = "#374151";
      });
      exportButton.addEventListener("mouseleave", () => {
        exportButton.style.background = "#f3f4f6";
        exportButton.style.color = "#6b7280";
      });
      exportButton.addEventListener("click", (e) => {
        e.stopPropagation();
        onExportDiagram(diagram.id, diagram.name);
      });

      headerElement.appendChild(titleElement);
      headerElement.appendChild(exportButton);

      // Add diagram content container
      const contentElement = document.createElement("div");
      contentElement.className = "diagram-content";
      contentElement.id = `diagram-${index}`;

      diagramWrapper.appendChild(headerElement);
      diagramWrapper.appendChild(contentElement);

      // Render the diagram
      mermaid
        .render(`mermaid-diagram-${index}`, diagram.code)
        .then(({ svg }) => {
          contentElement.innerHTML = svg;

          // Apply additional styling to the rendered SVG
          const svgElement = contentElement.querySelector("svg");
          if (svgElement) {
            svgElement.style.padding = "5px";
            svgElement.style.width = "auto";
            svgElement.style.height = "auto";
            svgElement.style.maxWidth = "none";

            // Style different node types
            const nodes = svgElement.querySelectorAll(".node");
            nodes.forEach((node) => {
              const rect = node.querySelector("rect, circle, polygon");
              if (rect) {
                rect.setAttribute("filter", "drop-shadow(1px 1px 2px rgba(0,0,0,0.1))");
                rect.setAttribute("rx", "6");
              }
            });

            // Style subgraphs
            const clusters = svgElement.querySelectorAll(".cluster rect");
            clusters.forEach((cluster) => {
              cluster.setAttribute("rx", "8");
              cluster.setAttribute("stroke-width", "1.5");
              cluster.setAttribute("filter", "drop-shadow(1px 1px 2px rgba(0,0,0,0.1))");
            });

            // Style edges/arrows
            const edges = svgElement.querySelectorAll(".edgePath path");
            edges.forEach((edge) => {
              edge.setAttribute("stroke-width", "1.5");
              edge.setAttribute("filter", "drop-shadow(0.5px 0.5px 1px rgba(0,0,0,0.1))");
            });
          }
        })
        .catch((error) => {
          console.error(`Error rendering diagram ${diagram.name}:`, error);
          contentElement.innerHTML = `
            <div style="padding: 12px; color: #dc2626; border: 1px solid #fca5a5; border-radius: 6px; background: #fef2f2;">
              <strong style="font-size: 12px;">Error rendering diagram "${diagram.name}"</strong><br/>
              <span style="font-size: 11px;">Please check your Mermaid syntax.</span>
              <details style="margin-top: 6px;">
                <summary style="cursor: pointer; font-size: 11px;">Error details</summary>
                <pre style="margin-top: 4px; font-size: 10px;">${error}</pre>
              </details>
            </div>
          `;
        });

      return diagramWrapper;
    } catch (error) {
      console.error(`Error processing diagram ${diagram.name}:`, error);
      return null;
    }
  };

  return (
    <div
      className="diagrams-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '10px',
        minHeight: '100%',
        width: 'max-content',
        minWidth: '100%',
      }}
    >
      {diagrams.map((diagram, index) => (
        <div key={diagram.id} ref={element => {
          if (element) {
            element.innerHTML = '';
            const diagramElement = renderDiagram(diagram, index);
            if (diagramElement) {
              element.appendChild(diagramElement);
            }
          }
        }} />
      ))}
    </div>
  );
}

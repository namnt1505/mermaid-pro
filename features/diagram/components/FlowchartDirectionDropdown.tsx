import React from 'react';
import { useDispatch } from 'react-redux';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { setDiagramCode } from '@/lib/store/features/editorSlice'; // Import the action
import { getDirectionIcon } from './FlowchartDirectionIcons'; // Added import

interface FlowchartDirectionDropdownProps {
  diagramId: string;
  code: string;
}

const directions = [
  { value: 'TD', label: 'Top to Bottom' }, // Label can be kept for tooltips or accessibility if needed later
  { value: 'BT', label: 'Bottom to Top' },
  { value: 'LR', label: 'Left to Right' },
  { value: 'RL', label: 'Right to Left' },
];

const getFlowchartDirection = (code: string) => {
  const match = code.match(/^\s*flowchart\s+(TD|LR|RL|BT)/m);
  return match ? match[1] : null;
};

export function FlowchartDirectionDropdown({ diagramId, code }: FlowchartDirectionDropdownProps) {
  const dispatch = useDispatch();

  const changeDirection = (newDirection: string) => {
    const currentDirection = getFlowchartDirection(code);
    if (currentDirection) {
      const newCode = code.replace(
        new RegExp(`^(\\s*flowchart\\s+)(${currentDirection})`, 'm'),
        `$1${newDirection}`
      );
      dispatch(setDiagramCode({ diagramId, code: newCode }));
    }
  };

  const currentDirectionValue = getFlowchartDirection(code);

  if (!currentDirectionValue) {
    return null; // Don't render if not a flowchart or direction not found
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="absolute top-2 right-2 bg-white/80 hover:bg-white border border-gray-200 rounded-md px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 shadow-sm backdrop-blur-sm z-10 flex items-center gap-1.5 transition-all">
        <span className="flex items-center gap-1.5">
          {getDirectionIcon(currentDirectionValue)}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-[40px]"> {/* Adjusted width */}
        {directions.map((direction) => (
          <DropdownMenuItem
            key={direction.value}
            onClick={() => changeDirection(direction.value)}
            className="text-xs flex justify-center items-center p-2" // Center icon
          >
            {getDirectionIcon(direction.value)}
            {/* Optionally, add a tooltip with direction.label here */}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import React from 'react';
import { Bell, CheckCircle, Coffee } from 'lucide-react';
import { ORDER_STAGES } from '../lib/brewhaven';

const ICONS = { Coffee, Bell, CheckCircle };

const stageIndex = (key) => ORDER_STAGES.findIndex(s => s.key === key);

export default function Stepper({ currentStage, progress = 0 }) {
  const idx = stageIndex(currentStage);
  return (
    <div className="flex items-center w-full max-w-xl mx-auto">
      {ORDER_STAGES.map((stage, i) => {
        const Icon = ICONS[stage.icon] || Coffee;
        const done = i < idx;
        const active = i === idx;
        const segmentFill = Math.max(0, Math.min(100, (progress - i * 33.3333) * 3));
        return (
          <React.Fragment key={stage.key}>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                done ? 'bg-amber-600 border-amber-600 text-white' :
                active ? 'border-amber-500 text-amber-500 bg-amber-500/10' :
                'border-neutral-700 text-neutral-600'
              }`}>
                <Icon size={18} className={active && stage.key !== 'ready' ? 'animate-pulse' : ''} />
              </div>
              <span className={`text-[11px] font-medium text-center leading-tight ${active || done ? 'text-neutral-200' : 'text-neutral-600'}`}>{stage.label}</span>
            </div>
            {i < ORDER_STAGES.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 mb-5 bg-neutral-800 relative overflow-hidden rounded">
                <div
                  className="absolute inset-y-0 left-0 bg-amber-600 transition-all duration-700"
                  style={{ width: `${i < idx ? 100 : Math.max(0, Math.min(100, segmentFill))}%` }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}


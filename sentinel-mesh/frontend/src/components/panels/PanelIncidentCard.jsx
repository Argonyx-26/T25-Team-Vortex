import React from 'react';
import IncidentView from '../IncidentView';
import InView from '../motion-primitives/InView';
import { Terminal, ShieldAlert } from 'lucide-react';
import { exampleIncident, exampleEvents } from '../../data/mockData';

export default function PanelIncidentCard({
  isActive = true,
  operatorLoad = 'normal',
  incident = exampleIncident,
  events = exampleEvents,
}) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col justify-center px-4 py-8">
      <InView isActive={isActive}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>Panel 05 • Unified Threat Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white flex items-center gap-2">
              <Terminal className="w-6 h-6 text-rose-400" />
              Correlated Incident Dossier
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Multi-stream narrative synthesized by Groq LLaMA 3.3 & Forecast Module with interactive proof chain.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-slate-500">Incident:</span>
            <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
              {incident?.incident_id || exampleIncident.incident_id}
            </span>
          </div>
        </div>
      </InView>

      {/* Render the full IncidentView */}
      <InView isActive={isActive} transition={{ delay: 0.15, duration: 0.5 }}>
        <IncidentView
          incident={incident || exampleIncident}
          events={events || exampleEvents}
          operatorLoad={operatorLoad}
          showWhy={true}
          enableBorderTrail={true}
        />
      </InView>
    </div>
  );
}

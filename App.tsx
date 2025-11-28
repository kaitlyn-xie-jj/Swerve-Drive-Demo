import React, { useState } from 'react';
import { Scene1_Translation } from './scenes/Scene1_Module';
import { Scene2_Rotation } from './scenes/Scene2_Chassis';
import { Scene3_Combined } from './scenes/Scene3_FieldCentric';
import { Scene4_Optimization } from './scenes/Scene4_RobotVsField';

const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState(0);

  const scenes = [
    { title: "Scene A: Pure Translation", component: <Scene1_Translation /> },
    { title: "Scene B: Pure Rotation", component: <Scene2_Rotation /> },
    { title: "Scene C: Combined", component: <Scene3_Combined /> },
    { title: "Scene D: Optimization", component: <Scene4_Optimization /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-20 sticky top-0">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-robot-accent rounded-lg flex items-center justify-center text-white font-bold">SD</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Swerve Drive <span className="text-robot-accent font-light">Kinematics</span></h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full h-full">
            <div className="flex-1 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                {scenes[currentScene].component}
            </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button 
                onClick={() => setCurrentScene(prev => Math.max(0, prev - 1))}
                disabled={currentScene === 0}
                className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
                ← Previous
            </button>

            <div className="flex items-center gap-2">
                {scenes.map((s, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentScene(idx)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentScene ? 'bg-robot-accent w-8' : 'bg-slate-300 hover:bg-slate-400'}`}
                        title={s.title}
                    />
                ))}
            </div>

            <button 
                onClick={() => setCurrentScene(prev => Math.min(scenes.length - 1, prev + 1))}
                disabled={currentScene === scenes.length - 1}
                className="px-4 py-2 rounded-lg font-medium text-white bg-robot-accent hover:bg-robot-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
                Next →
            </button>
        </div>
        <div className="text-center mt-2 text-xs text-slate-400 font-mono">
            {scenes[currentScene].title}
        </div>
      </footer>
    </div>
  );
};

export default App;

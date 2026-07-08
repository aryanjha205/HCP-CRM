import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchInteractions } from './store/interactionsSlice';
import FormLog from './components/FormLog';
import AIChat from './components/AIChat';
import Dashboard from './components/Dashboard';
import { Stethoscope, Activity, FileText, Settings, Menu, Sparkles, X } from 'lucide-react';

function App() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchInteractions());
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Mobile Left Sidebar Drawer Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Left Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-40 transition-transform duration-300 transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:flex'}`}>
        <div className="p-6 flex items-center justify-between border-b border-gray-100 md:border-b-0">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2 rounded-lg shadow-md shadow-brand-500/20">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">HCP CRM</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          <button
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-brand-50 text-brand-600 font-semibold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
          >
            <Activity className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('log'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${activeTab === 'log' ? 'bg-brand-50 text-brand-600 font-semibold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
          >
            <FileText className="w-5 h-5" />
            Log Interaction
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-gray-500 hover:bg-gray-50 rounded-xl transition-all">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-500 hover:text-gray-700">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight capitalize">
              {activeTab === 'dashboard' ? 'Overview' : 'Log New Interaction'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="lg:hidden bg-brand-50 hover:bg-brand-100 text-brand-600 p-2 rounded-xl border border-brand-200 flex items-center gap-2 text-sm font-semibold transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">AI Chat</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-extrabold border border-brand-200 shadow-sm text-sm">
              SR
            </div>
          </div>
        </header>

        {/* Dynamic Content + AI Panel */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Main Workspace */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            {activeTab === 'dashboard' ? <Dashboard /> : <FormLog />}
          </div>

          {/* Mobile Right Sidebar Chat Overlay */}
          {isChatOpen && (
            <div 
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm transition-opacity duration-300"
            />
          )}

          {/* AI Chat Panel (Right Sidebar / Drawer) */}
          <div className={`fixed inset-y-0 right-0 w-80 sm:w-96 border-l border-gray-200 bg-white shadow-2xl lg:shadow-none z-40 lg:z-20 transition-transform duration-300 transform lg:relative lg:translate-x-0 ${isChatOpen ? 'translate-x-0' : 'translate-x-full lg:block'}`}>
            {isChatOpen && (
              <button 
                onClick={() => setIsChatOpen(false)} 
                className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-white rounded-full border border-gray-200 shadow-sm text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <AIChat />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;

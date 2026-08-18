/**
 * StartScreen - Project selection and creation landing page
 *
 * Web version: recent projects are stored in localStorage (autosaved state),
 * Open Project imports a .nbproject JSON file via a file picker.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Plus, FolderOpen, Clock, Folder, AlertCircle, Check, X, Trash2 } from 'lucide-react';
import {
  loadRecentProjects,
  removeRecentProject,
  type RecentProjectEntry,
} from '../services/browserStorage';

interface StartScreenProps {
  onNewProject: (name?: string) => void;
  onOpenProject: () => void;
  onLoadRecentProject: (projectId: string) => void;
}

export function StartScreen({ onNewProject, onOpenProject, onLoadRecentProject }: StartScreenProps) {
  const [recentProjects, setRecentProjects] = useState<RecentProjectEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNameInput, setShowNameInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNameInput) {
      nameInputRef.current?.focus();
    }
  }, [showNameInput]);

  useEffect(() => {
    try {
      setRecentProjects(loadRecentProjects());
    } catch (err) {
      console.error('Failed to load recent projects:', err);
    }
    setLoading(false);
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-base text-ink font-sans flex flex-col">
      {/* Header */}
      <div className="border-b border-line bg-base/90">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="brand-wordmark text-3xl tracking-tight">
              Ai<span className="text-accent">chemy</span>
            </h1>
            <p className="brand-tagline text-xs mt-1">Brew your perfect prompt</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center pt-12 sm:pt-16 pb-12 px-4 sm:px-8">
        <div className="w-full max-w-4xl space-y-10">

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showNameInput ? (
              <div className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-accent bg-accent/5 rounded-card">
                <Plus className="w-10 h-10 text-accent" />
                <div className="text-sm font-black uppercase tracking-wider text-accent2 mb-1">Name Your Project</div>
                <div className="flex items-center gap-2 w-full max-w-xs">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newProjectName.trim()) {
                        onNewProject(newProjectName.trim());
                        setShowNameInput(false);
                        setNewProjectName('');
                      }
                      if (e.key === 'Escape') {
                        setShowNameInput(false);
                        setNewProjectName('');
                      }
                    }}
                    placeholder="Project name..."
                    className="flex-1 bg-surface border border-line text-ink text-sm px-3 py-2 focus:outline-none focus:border-accent placeholder-dim"
                  />
                  <button
                    onClick={() => {
                      if (newProjectName.trim()) {
                        onNewProject(newProjectName.trim());
                        setShowNameInput(false);
                        setNewProjectName('');
                      }
                    }}
                    disabled={!newProjectName.trim()}
                    className="p-2 bg-accent text-white disabled:opacity-30 hover:bg-accent/90 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setShowNameInput(false); setNewProjectName(''); }}
                    className="p-2 text-dim hover:text-ink border border-line hover:border-dim transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
            <button
              onClick={() => { setShowNameInput(true); setNewProjectName(''); }}
              className="group flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-line hover:border-accent bg-base hover:bg-accent/5 rounded-card transition-all duration-200"
            >
              <Plus className="w-10 h-10 text-dim group-hover:text-accent transition-colors" />
              <div>
                <div className="text-sm font-black uppercase tracking-wider text-ink group-hover:text-accent transition-colors">New Project</div>
                <div className="text-[10px] text-dim mt-1 uppercase tracking-wider">Start fresh with a blank canvas</div>
              </div>
            </button>
            )}

            <button
              onClick={onOpenProject}
              className="group flex flex-col items-center justify-center gap-3 p-8 border border-line hover:border-accent bg-base hover:bg-surface rounded-card transition-all duration-200"
            >
              <FolderOpen className="w-10 h-10 text-dim group-hover:text-blue-400 transition-colors" />
              <div>
                <div className="text-sm font-black uppercase tracking-wider text-ink group-hover:text-blue-400 transition-colors">Open Project</div>
                <div className="text-[10px] text-dim mt-1 uppercase tracking-wider">Import a .nbproject file</div>
              </div>
            </button>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-line pb-2">
              <Clock className="w-4 h-4 text-dim" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-dim">
                {recentProjects.length > 0 ? 'Your Projects' : 'No Projects Yet'}
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-10 text-dim text-sm">Loading projects...</div>
            ) : recentProjects.length > 0 ? (
              <div className="space-y-1">
                {recentProjects.map((project) => (
                  <div
                    key={project.projectId}
                    className="w-full flex items-center gap-4 px-4 py-3 bg-base border border-line hover:border-line hover:bg-surface transition-all group"
                  >
                    <button
                      onClick={() => onLoadRecentProject(project.projectId)}
                      className="flex-1 flex items-center gap-4 text-left min-w-0"
                    >
                      <Folder className="w-5 h-5 text-dim group-hover:text-accent transition-colors flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ink group-hover:text-ink truncate">
                          {project.name || 'Untitled'}
                        </div>
                      </div>
                      <span className="text-[10px] text-dim whitespace-nowrap flex-shrink-0">
                        {formatDate(project.lastOpened)}
                      </span>
                    </button>
                    <button
                      onClick={() => setRecentProjects(removeRecentProject(project.projectId))}
                      className="p-1.5 text-dim hover:text-danger transition-colors flex-shrink-0"
                      title="Remove from recent projects"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <AlertCircle className="w-10 h-10 text-dim mx-auto" />
                <p className="text-sm text-dim">No projects found.</p>
                <p className="text-xs text-dim">
                  Create a new project or import an existing .nbproject file to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

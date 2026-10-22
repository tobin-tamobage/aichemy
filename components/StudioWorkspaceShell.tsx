import React from 'react';

interface StudioWorkspaceShellProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
}

export function StudioWorkspaceShell({ leftPane, rightPane }: StudioWorkspaceShellProps) {
  return (
    <main className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-5 px-4 pt-5 pb-24 sm:px-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(24rem,0.9fr)] lg:gap-6 lg:overflow-hidden lg:px-8 lg:py-6 xl:gap-8">
      <section
        aria-label="Builder controls"
        className="studio-pane-enter lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-2"
      >
        {leftPane}
      </section>

      <section
        aria-label="Live prompt preview and next steps"
        className="studio-pane-enter studio-pane-enter--delayed lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pl-2"
      >
        {rightPane}
      </section>
    </main>
  );
}

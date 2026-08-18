import React from 'react';

interface StudioWorkspaceShellProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
}

export function StudioWorkspaceShell({ leftPane, rightPane }: StudioWorkspaceShellProps) {
  return (
    <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-8 lg:py-8 grid grid-cols-1 lg:grid-cols-[minmax(20rem,5fr)_minmax(0,7fr)] gap-6 lg:gap-8 xl:gap-10 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
      <section
        aria-label="Builder controls"
        className="lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-2"
      >
        {leftPane}
      </section>

      <section
        aria-label="Image and video workspace"
        className="lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pl-2"
      >
        {rightPane}
      </section>
    </main>
  );
}

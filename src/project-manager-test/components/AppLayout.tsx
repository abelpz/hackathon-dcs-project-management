import { ReactNode } from 'react';

interface AppLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
}

export function AppLayout({ sidebar, main }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-md overflow-y-auto">
        {sidebar}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {main}
        </div>
      </div>
    </div>
  );
} 
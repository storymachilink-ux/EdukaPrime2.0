import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHeader } from './MobileHeader';
import { FloatingAvatar } from '../FloatingAvatar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <MobileHeader />
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <FloatingAvatar />
    </div>
  );
}
import { ProjectManagerProvider } from './contexts/ProjectManagerContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { MainScreen } from './components/MainScreen';
import { AppLayout } from './components/AppLayout';
import { Sidebar } from './components/Sidebar';
import './style-reset.css';

export function TestApp() {
  return (
    <ProjectManagerProvider>
      <NavigationProvider>
        <AppLayout
          sidebar={<Sidebar />}
          main={<MainScreen />}
        />
      </NavigationProvider>
    </ProjectManagerProvider>
  );
} 
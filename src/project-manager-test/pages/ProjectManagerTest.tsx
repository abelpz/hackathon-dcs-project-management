import { useProjectManager } from '../contexts/ProjectManagerContext';
import { ProjectsList } from '../components/ProjectsList';
import { WelcomeScreen } from '../components/WelcomeScreen';

export function ProjectManagerTest() {
  const { isAuthenticated } = useProjectManager();

  if (!isAuthenticated) {
    return <WelcomeScreen />;
  }

  return <ProjectsList />;
} 
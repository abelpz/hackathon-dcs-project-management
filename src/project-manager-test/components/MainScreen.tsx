import { useNavigation } from '../contexts/NavigationContext';
import { useProjectManager } from '../contexts/ProjectManagerContext';
import { ProjectsList } from './ProjectsList';
import { ProjectDetails } from './ProjectDetails';
import { CreateProjectModal } from './CreateProjectModal';
import { WelcomeScreen } from './WelcomeScreen';

export function MainScreen() {
  const { currentScreen, goBack } = useNavigation();
  const { isAuthenticated } = useProjectManager();

  if (!isAuthenticated) {
    return <WelcomeScreen />;
  }

  switch (currentScreen.name) {
    case 'projects':
      return <ProjectsList />;
    
    case 'projectDetails':
      return (
        <ProjectDetails
          projectId={currentScreen.params?.projectId || ''}
          onBack={goBack}
        />
      );
    
    case 'createProject':
      return (
        <CreateProjectModal
          isOpen={true}
          onClose={goBack}
          onProjectCreated={() => {
            goBack();
          }}
        />
      );
    
    default:
      return <ProjectsList />;
  }
} 
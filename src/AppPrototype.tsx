import { AppState } from './App';
import ProjectPage from './ProjectPage';
import Test from './Test';

export default function AppPrototype({ token, appState }: { token: string, appState: AppState }) {

  return (
    <>
        {appState === "projects" && <ProjectPage token={token} />}
        {appState === "test" && <Test token={token} />}
    </>
//      {appState === "milestones" && <Milestones/>}
//      {appState === "issues" && <Issues />}
  )
}

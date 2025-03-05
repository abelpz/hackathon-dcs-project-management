import { AppState } from './App';
import ProjectPage from './ProjectPage';


export default function AppPrototype({ token, appState }: { token: string, appState: AppState }) {

  return (
    <>
        {appState === "projects" && <ProjectPage token={token} />}
    </>
//      {appState === "milestones" && <Milestones/>}
//      {appState === "issues" && <Issues />}
  )
}

import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import WorkspacePage from './pages/WorkspacePage.jsx';
import { navigate, usePath } from './lib/router.jsx';

// Two pages: the product introduction at "/" and the workspace at "/app".
export default function App() {
  const path = usePath();
  const inWorkspace = path.startsWith('/app');
  // Once opened, the workspace stays mounted so going back to the landing page doesn't lose unsaved notes.
  const [workspaceOpened, setWorkspaceOpened] = useState(inWorkspace);

  useEffect(() => {
    if (inWorkspace) setWorkspaceOpened(true);
  }, [inWorkspace]);

  // Links from before the workspace had its own page (/#inspect, /#diary) still land in the right tool.
  useEffect(() => {
    if (!inWorkspace && ['#inspect', '#diary'].includes(window.location.hash)) navigate(`/app${window.location.hash}`);
  }, [inWorkspace]);

  return (
    <>
      {!inWorkspace && <LandingPage />}
      {workspaceOpened && (
        <div hidden={!inWorkspace}>
          <WorkspacePage active={inWorkspace} />
        </div>
      )}
    </>
  );
}

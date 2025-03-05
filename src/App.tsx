import { getToken } from './core/authentication'
import { createTask } from './core/task'

import './App.css'
import { useEffect, useRef, useState } from 'react';

import Test from './Test';
import AppPrototype from './AppPrototype';
import ProjectsTest from './ProjectsTest';
import DropdownMenu from './DropdownMenu';

export type AppState = "home" | "projects" | "milestones" | "issues";

function App() {
  const userNameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState<string | null>(window.localStorage.getItem("token"));
  const [ appState, setAppState ] = useState<AppState>("home");


  return (
    <>{!token ? (
      <>
        <h1>Login</h1>
        <h2>Username</h2>
        <input type="text" ref={userNameRef} />
        <br />
        <h2>Password</h2>
        <input type="password" ref={passwordRef} />
        <br />
        <button onClick={() => {
          if (userNameRef.current?.value && passwordRef.current?.value) {
            getToken(userNameRef.current?.value, passwordRef.current?.value).then((token) => {
              setToken(token);
              window.localStorage.setItem("token", token);
            })
          }
        }}>Login</button>
      </>
    ) : (
      <>
        <DropdownMenu appState={appState} setAppState={setAppState}/>
        <Test token={token} />
        <AppPrototype token={token} appState={appState} />
      </>
    )}

    </>
  )
}

export default App
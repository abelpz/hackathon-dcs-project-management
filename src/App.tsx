import { getToken } from './core/authentication'

import './App.css'
import { useRef, useState } from 'react';
import Test from './Test';


function App() {
  const userNameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState<string | null>(window.localStorage.getItem("token"));


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
        <Test token={token} />
      </>
    )}
    </>
  )
}

export default App

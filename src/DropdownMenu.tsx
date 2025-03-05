import { useState, useEffect } from 'react';
import { AppState } from './App';

export default function DropdownMenu({ appState, setAppState }: { appState: AppState, setAppState: Function}) {

  

  return (
    <>  
        <select onChange={(e) => {setAppState(e.target.value)}} className="absolute top-0 left-0 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
          <option value="home">Home</option>
          <option value="projects">Projects</option>
          <option value="milestone">Milestone</option>
        </select>
    </>
  )
}

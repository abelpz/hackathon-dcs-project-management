import React from 'react'
import { useState } from 'react'
import LoginCard from './components/LoginCard'
import WelcomeScreen from './components/WelcomScreen'
import DashBoard from './components/DashBoard'
import { Button } from './components/prototype/btn'
import MyCardActive from './components/prototype/cardActive'
import MyCardFinished from './components/prototype/cardFinished'

export default function AppComonents() {
    const [active, setActive] = useState<JSX.Element | null>(null)
    const mostrarLogin = () => {
        setActive(<LoginCard />)
    }
    const mostrarComponents = () => {
        setActive(<DashBoard />)
    }
    const mostrarWelcome = () => {
        setActive(<WelcomeScreen />)
    }

    const mostrarSideBar = () => {
        setActive(<MyCardActive />)
    }
    const mostrarCardFinished = () => {
        setActive(<MyCardFinished />)
    }
    return (<>
        <Button label='Login Card' onClick={mostrarLogin} />
        <Button label='Dasboard' onClick={mostrarComponents} />
        <Button label='Welcome' onClick={mostrarWelcome} />
        <Button label='Card-active' onClick={mostrarSideBar} />
        <Button label='Card-finished' onClick={mostrarCardFinished} />
        <div>
            {active}
        </div>
    </>)
}
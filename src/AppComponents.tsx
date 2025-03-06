import React from 'react'
import { useState } from 'react'
import LoginCard from './components/prototype/LoginCard'
import WelcomeScreen from './components/prototype/WelcomScreen'
import DashBoard from './components/prototype/DashBoard'
import { Button } from './components/btn'
import MyCardActive from './components/cardActive'
import MyCardFinished from './components/cardFinished'
import CardsSection from './components/CardsSection'
import SideBar from './components/layouts/Sidebar'
import Input from './components/Input'

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

    const mostrarCardActive = () => {
        setActive(<MyCardActive />)
    }
    const mostrarCardFinished = () => {
        setActive(<MyCardFinished />)
    }
    const mostrarCardSection = () => {
        setActive(<CardsSection />)
    }
    const mostrarSideBar = () => {
        setActive(<SideBar />)
    }
    const mostrarInput = () => {
        setActive(<Input />)
    }


    return (<>
        <Button label='Login Card' onClick={mostrarLogin} />
        <Button label='Dasboard' onClick={mostrarComponents} />
        <Button label='Welcome' onClick={mostrarWelcome} />
        <Button label='Card-active' onClick={mostrarCardActive} />
        <Button label='Card-finished' onClick={mostrarCardFinished} />
        <Button label='Cards-section' onClick={mostrarCardSection} />
        <Button label='Side-Bar' onClick={mostrarSideBar} />
        <Button label='Input' onClick={mostrarInput} />
        <div>
            {active}
        </div>
    </>)
}
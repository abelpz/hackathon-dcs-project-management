import React from 'react'
import { useState } from 'react'
import LoginCard from './components/prototype/LoginCard'
import WelcomeScreen from './components/prototype/WelcomScreen'
import DashBoard from './components/prototype/DashBoard'
import { Button } from './components/btn'
import MyCardActive from './components/cardActive'
import MyCardFinished from './components/cardFinished'
import CardsSection from './components/layouts/CardsSection'
import SideBar from './components/layouts/Sidebar'
import Input from './components/Input'
import NavBar from './components/layouts/NavBar'
import Link from './components/Link'
import FilterSection from './components/layouts/FilterSection'
import AppContainer from './components/layouts/AppContainer'

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
    const mostrarNavBar = () => {
        setActive(<NavBar />)
    }
    const mostrarLink = () => {
        setActive(<Link />)
    }
    const mostrarFilter = () => {
        setActive(<FilterSection />)
    }
    const mostrarAppContainer = () => {
        setActive(<AppContainer />)
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
        <Button label='Nav-Bar' onClick={mostrarNavBar} />
        <Button label='Link' onClick={mostrarLink} />
        <Button label='Filter-Section' onClick={mostrarFilter} />
        <Button label='Container' onClick={mostrarAppContainer} />
        <div>
            {active}
        </div>
    </>)
}
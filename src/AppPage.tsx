import React from "react"
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
import MainSection from "./components/layouts/MainSection"


const AppPage = () => {
    return (
        <AppContainer>
            <SideBar />
            <MainSection>
                <FilterSection></FilterSection>
                <CardsSection>
                    <MyCardActive />
                    <MyCardActive />
                    <MyCardActive />
                    <MyCardActive />
                    <MyCardActive />
                    <MyCardFinished />
                    <MyCardFinished />
                    <MyCardFinished />
                    <MyCardFinished />
                </CardsSection>
            </MainSection>
        </AppContainer>
    );
};
export default AppPage;
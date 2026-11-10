import { HomeFooter, HomeHeader } from "@/widgets/home";
import {Outlet} from 'react-router';

export function MainLayout() {
    
    return (
        <>
            <HomeHeader />
            <Outlet />
            <HomeFooter />
        </>
    )
}
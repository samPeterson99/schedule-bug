import { ReactNode } from "react";
import Nav from "./Nav";

type LayoutProps = {children?: ReactNode};

export default function Layout({ children }: LayoutProps) {

    return (
        <div>
            <Nav />
            <main>{children}</main>
        </div>
    )
}
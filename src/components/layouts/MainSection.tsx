import React from "react";

const MainSection = ({ children }: { children: React.ReactNode }) => {
    return (
        <div id="main-section" className="flex-1 bg-gray-800 overflow-auto">
            {children}
        </div>
    )
}
export default MainSection;
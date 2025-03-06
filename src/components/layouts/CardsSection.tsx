import { GoPencil } from "react-icons/go";
import { AiOutlineMore } from "react-icons/ai";
import { ReactElement } from "react";
const CardsSection = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="project-cards-section grid grid-cols-3 mt-8 mx-4">
            {children}
        </div>
    );
};
export default CardsSection;

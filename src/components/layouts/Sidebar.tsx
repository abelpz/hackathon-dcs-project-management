import { AiOutlineMore } from "react-icons/ai";
import { AiOutlinePlus } from "react-icons/ai";
import { AiOutlineAlignLeft } from "react-icons/ai";
import { GoProjectSymlink } from "react-icons/go";
import { VscFolderActive } from "react-icons/vsc";
import { AiOutlineCheck } from "react-icons/ai";
import { HiOutlineArchiveBox } from "react-icons/hi2";

const Sidebar = () => {
    return (
        <aside className="sidebar-panel bg-gray-700 w-64 py-6 flex flex-col">
            <div className="sidebar-title flex justify-between items-center px-4 mb-4">
                <span className="font-semibold text-xs text-white">DCS PROJECT MANAGER</span>
                <button className="text-gray-600 focus:outline-none">
                    <span className="text-2xl text-white"><AiOutlineMore /></span>
                </button>
            </div>
            <hr className="border-gray-300 mb-4" />
            <div className="sidbar-body flex flex-col gap-4 px-4">
                <div className="sidebar-section">
                    <div className="sidebar-section-heading flex justify-between items-center mb-2">
                        <span className="font-semibold text-xs text-white">PROJECTS</span>
                        <button className="text-gray-600 focus:outline-none ml-25">
                            <span className="text-2xl text-white"><AiOutlinePlus /></span>
                        </button>
                        <button className="text-gray-600 focus:outline-none">
                            <span className="text-2xl text-white"><AiOutlineAlignLeft /></span>
                        </button>
                    </div>
                    <nav className="flex-grow font-light text-gray-300">
                        <a href="#" className="flex py-2 px-4  hover:bg-gray-800 rounded-sm  hover:text-blue-400"><span className="mx-2 mt-1"><GoProjectSymlink /></span>All Projects</a>
                        <a href="#" className="flex py-2 px-4  hover:bg-gray-800 rounded-sm  hover:text-blue-400"><span className="mx-2 mt-1"><VscFolderActive /></span>Active</a>
                        <a href="#" className="flex py-2 px-4  hover:bg-gray-800 rounded-sm  hover:text-blue-400"><span className="mx-2 mt-1"><AiOutlineCheck /></span>Finished</a>
                        <a href="#" className="flex py-2 px-4  hover:bg-gray-800 rounded-sm  hover:text-blue-400"><span className="mx-2 mt-1"><HiOutlineArchiveBox /></span>Archived</a>
                    </nav>
                </div>
                <div className="sidebar-section">
                    <div className="sidebar-section-heading flex justify-between items-center mb-2">
                        <span className="font-semibold text-xs text-white">RECENT PROJECTS</span>
                    </div>
                    <nav className="flex-grow text-gray-300 font-light text-sm">
                        <div className="flex justify-between items-center mt-4">
                            <a href="#" className=" hover:text-blue-500">Genesis Translation Project</a>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <a href="#" className="hover:text-blue-500">Psalms Translation Project</a>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <a href="#" className="hover:text-blue-500">Ruth Translation Project</a>
                        </div>
                    </nav>
                </div>
            </div>
        </aside>
    );
};
export default Sidebar;
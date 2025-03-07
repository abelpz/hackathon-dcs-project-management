import { GoProjectSymlink } from "react-icons/go";
import { VscFolderActive } from "react-icons/vsc";
import { AiOutlineCheck } from "react-icons/ai";
import { HiOutlineArchiveBox } from "react-icons/hi2";

const NavBar = () => {
    return (
        <nav className="flex-grow font-light text-gray-300">
            <a href="#" className="flex py-2 px-4  hover:bg-gray-800 rounded-sm  hover:text-blue-400"><span className="mx-2 mt-1"><GoProjectSymlink /></span>All Projects</a>
            <a href="#" className="flex py-2 px-4  hover:bg-gray-800 rounded-sm  hover:text-blue-400"><span className="mx-2 mt-1"><VscFolderActive /></span>Active</a>
            <a href="#" className="flex py-2 px-4  hover:bg-gray-800 rounded-sm  hover:text-blue-400"><span className="mx-2 mt-1"><AiOutlineCheck /></span>Finished</a>
            <a href="#" className="flex py-2 px-4  hover:bg-gray-800 rounded-sm  hover:text-blue-400"><span className="mx-2 mt-1"><HiOutlineArchiveBox /></span>Archived</a>
        </nav>
    )
}
export default NavBar;
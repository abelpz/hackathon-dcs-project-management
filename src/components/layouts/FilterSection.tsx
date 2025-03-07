import { AiOutlineDown } from "react-icons/ai";
const FilterSection = () => {
    return (
        <div className="filter-section flex justify-between items-center p-4 bg-gray-700 border-b border-gray-500 mx-8 mt-2 rounded-md">
            <div className="flex space-x-4">
                <button className="px-4 py-2 rounded-md bg-gray-600 hover:bg-blue-500 text-white">All Projects</button>
                <button className="px-4 py-2 rounded-md bg-gray-600 hover:bg-blue-500 text-white">Active</button>
                <button className="px-4 py-2 rounded-md bg-gray-600 hover:bg-blue-500 text-white">Finished</button>
                <button className="px-4 py-2 rounded-md bg-gray-600 hover:bg-blue-500 text-white">Archived</button>
            </div>

            <div className="flex items-center space-x-4">
                <span className="text-white">Sort by:</span>
                <button className="px-4 py-2 rounded-md bg-gray-600 hover:bg-blue-500 flex items-center space-x-2 text-white">
                    <span>Last Updated</span>
                    <span className="text-lg text-white"><AiOutlineDown /></span>
                </button>
            </div>
        </div>
    )
};
export default FilterSection;
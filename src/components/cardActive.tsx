import React from "react"
import { GoPencil } from "react-icons/go";
import { AiOutlineMore } from "react-icons/ai";

const MyCardActive: React.FC = () => {
    return (
        <div className="project-cards-section grid grid-cols-3 mt-8 mx-4">
            <div className="project-card bg-gray-700 m-3 rounded-md overflow-clip">
                <div className="card-title-bar flex bg-blue-800 justify-between items-center mb-2 p-2 px-4 pb-4">
                    <span className="font-semibold text-base mt-2 text-blue-300">Active</span>
                    <div className="flex gap-2">
                        <button className="text-gray-600 focus:outline-none mt-2">
                            <span className="text-1xl text-white"><GoPencil /></span>
                        </button>
                        <button className="text-gray-600 focus:outline-none mt-2">
                            <span className="text-1xl text-white"><AiOutlineMore /></span>
                        </button>
                    </div>
                </div>
                <div className="card-body px-4">
                    <div className="flex">
                        <span className=" font-semibold text-base mt-6 text-white">Translation Project - Genesis</span>
                    </div>
                    <div className="flex">
                        <span className=" text-sm mt-6 text-gray-300">Biblical Translation project for the book of Genesis with resources and references.</span>
                    </div>
                    <div className="progress">
                        <div className=" flex justify-between items-center mt-4">
                            <span className=" text-sm text-gray-300">Progress</span>
                            <span className=" text-sm text-gray-300">45%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 w-full mt-2">
                            <div className="bg-blue-500 rounded-full h-2 w-[45%]"></div>
                        </div>
                    </div>

                    <div className=" flex justify-between items-center mt-4">
                        <span className=" text-sm text-gray-300">Milestones: <span className="text-gray-100">8</span></span>
                        <span className=" text-sm text-gray-300">Tasks:  <span className="text-gray-100">24</span></span>
                        <span className=" text-sm text-gray-300">Repos: <span className="text-gray-100">3</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="avatar-stack flex items-center -space-x-2 mt-4 mb-4">
                            <div className="h-8 w-8 rounded-full ring-1 ring-black bg-blue-400 flex items-center justify-center text-sm text-white">
                                <span>AP</span>
                            </div>
                            <div className="h-8 w-8 rounded-full ring-1 ring-black bg-green-400 flex items-center justify-center text-sm text-white">
                                <span>YG</span>
                            </div>
                            <div className="h-8 w-8 rounded-full ring-1 ring-black bg-pink-400 flex items-center justify-center text-sm text-white">
                                <span>CD</span>
                            </div>
                        </div>
                        <span className=" text-xs text-gray-400">Updated 2 days ago</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default MyCardActive;

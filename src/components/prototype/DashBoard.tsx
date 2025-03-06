import React from "react";

import { AiOutlineMore } from "react-icons/ai";
import { AiOutlinePlus } from "react-icons/ai";
import { AiOutlineAlignLeft } from "react-icons/ai";
import { GoProjectSymlink } from "react-icons/go";
import { VscFolderActive } from "react-icons/vsc";
import { AiOutlineCheck } from "react-icons/ai";
import { HiOutlineArchiveBox } from "react-icons/hi2";
import { AiOutlineDown } from "react-icons/ai";
import { GoPencil } from "react-icons/go";
function Dashboard() {
    return (
        <>
            <div className="app-container flex bg-gray-800 w-full h-screen">
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

                <div id="main-section" className="flex-1 bg-gray-800 overflow-auto">
                    <div className="main-title-bar flex p-8 justify-between sticky">
                        <h1 className="text-2xl font-bold m-0 self-center text-white">Projects</h1>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center">
                            <span className="text-2xl mr-2">+</span>
                            New Project
                        </button>
                    </div>
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
                                    <span className=" font-semibold text-base mt-6 text-white">Translation Project - Psalms</span>
                                </div>
                                <div className="flex">
                                    <span className=" text-sm mt-6 text-gray-300">Biblical Translation project for the book of Psalms with poetic analysis.</span>
                                </div>
                                <div className="progress">
                                    <div className=" flex justify-between items-center mt-4">
                                        <span className=" text-sm text-gray-300">Progress</span>
                                        <span className=" text-sm text-gray-300">68%</span>
                                    </div>
                                    <div className="bg-gray-200 rounded-full h-2 w-full mt-2">
                                        <div className="bg-blue-500 rounded-full h-2 w-[68%]"></div>
                                    </div>
                                </div>

                                <div className=" flex justify-between items-center mt-4">
                                    <span className=" text-sm text-gray-300">Milestones: <span className="text-gray-100">5</span></span>
                                    <span className=" text-sm text-gray-300">Tasks:  <span className="text-gray-100">37</span></span>
                                    <span className=" text-sm text-gray-300">Repos: <span className="text-gray-100">4</span></span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="avatar-stack flex items-center -space-x-2 mt-4 mb-4">
                                        <div className="h-8 w-8 rounded-full ring-1 ring-black bg-yellow-500 flex items-center justify-center text-sm text-white">
                                            <span>PS</span>
                                        </div>
                                        <div className="h-8 w-8 rounded-full ring-1 ring-black bg-purple-500 flex items-center justify-center text-sm text-white">
                                            <span>RI</span>
                                        </div>
                                    </div>
                                    <span className=" text-xs text-gray-400">Updated 1 day ago</span>
                                </div>
                            </div>
                        </div>
                        <div className="project-card  bg-gray-700 m-3 rounded-md overflow-clip">
                            <div className="card-title-bar flex bg-green-800 justify-between items-center mb-2 p-2 px-4 pb-4">
                                <span className="font-semibold text-base mt-2 text-green-500">Finished</span>
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
                                    <span className=" font-semibold text-base mt-6 text-white">Translation Project - Ruth</span>
                                </div>
                                <div className="flex">
                                    <span className=" text-sm mt-6 text-gray-300">Biblical Translation project for the book of Ruth completed with all resources.</span>
                                </div>
                                <div className="progress">
                                    <div className=" flex justify-between items-center mt-4">
                                        <span className=" text-sm text-gray-300">Progress</span>
                                        <span className=" text-sm text-gray-300">100%</span>
                                    </div>
                                    <div className="bg-gray-200 rounded-full h-2 w-full mt-2">
                                        <div className="bg-green-500 rounded-full h-2 w-[100%]"></div>
                                    </div>
                                </div>
                                <div className=" flex justify-between items-center mt-4">
                                    <span className=" text-sm text-gray-300">Milestones: <span className="text-gray-100">8</span></span>
                                    <span className=" text-sm text-gray-300">Tasks:  <span className="text-gray-100">32</span></span>
                                    <span className=" text-sm text-gray-300">Repos: <span className="text-gray-100">3</span></span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="avatar-stack flex items center -space-x-2 mt-4 mb-4">
                                        <div className="h-8 w-8 rounded-full ring-1 ring-black bg-blue-400 flex items-center justify-center text-sm text-white">
                                            <span>JD</span>
                                        </div>
                                        <div className="h-8 w-8 rounded-full ring-1 ring-black bg-pink-400 flex items-center justify-center text-sm text-white">
                                            <span>MN</span>
                                        </div>
                                        <div className="h-8 w-8 rounded-full ring-1 ring-black bg-green-400 flex items-center justify-center text-sm text-white">
                                            <span>KL</span>
                                        </div>
                                    </div>
                                    <span className=" text-xs text-gray-400">Completed 2 weeks ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default Dashboard;
import { VscAccount } from "react-icons/vsc";
import { VscSettingsGear } from "react-icons/vsc";
import { IoIosHelpCircleOutline } from "react-icons/io";

function WelcomeScreen() {
    return (
        <div className="bg-gray-800 rounded-lg shadow-md p-6 w-380 h-180">
            <h1 className="text-white text-start mb-4">
                <span className="text-3xl font-bold">Bible Translation Manager</span>
                <span className=" text-white px-4 py-2 text-3xl">Get Started</span>
            </h1>

            <div className="flex flex-col items-start mt-6">
                <div className="flex items-center mb-2">
                    <span className="mr-2 text-xl text-white"><VscAccount /></span>
                    <span className="font-bold text-white">Get Started</span>
                </div>
                <div className="text-blue-500 text-sm mb-1">Login</div>
                <div className="text-blue-500 text-sm">Sign Up</div>
            </div>

            <div className="flex flex-col items-start mt-6">
                <div className="flex items-center mb-2">
                    <span className="mr-2 text-xl text-white"><VscSettingsGear /></span>
                    <span className="text-white font-bold">Settings</span>
                </div>
                <div className="text-blue-500 text-sm">Open Settings</div>
            </div>

            <div className="flex flex-col items-start mt-6">
                <div className="flex items-center mb-2">
                    <span className="mr-2 text-xl text-white"><IoIosHelpCircleOutline /></span>
                    <span className="text-white font-bold">Help</span>
                </div>
                <div className="text-blue-500 text-sm">Documentation</div>
            </div>
        </div>

    );
}
export default WelcomeScreen;
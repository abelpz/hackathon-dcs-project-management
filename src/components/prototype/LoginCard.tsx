function LoginCard() {
    return (
        <>
            <div className="bg-gray-200 rounded-lg shadow-md w-140 mt-4 ml-4">
                <div className="bg-[#017ACC] text-white p-2 rounded-t-lg flex justify-between items-center">
                    <div className="font-semibold">Authentication</div>
                    <button className="text-white hover:text-gray-300 pr-2">x</button>
                </div>
                <div className="p-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Enter your DCS OAuth Credentials</label>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="text"
                            placeholder="e.g john@email.com"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="Enter your password" />

                        <div className="flex space-x-2 place-self-end mt-4">
                            <button className="bg-white text-black py-2 px-4 rounded-lg">Cancel</button>
                            <button className="bg-[#017ACC] text-white py-2 px-4 rounded-lg">Login</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginCard;
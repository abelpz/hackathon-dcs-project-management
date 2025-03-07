const TitleBar = () => {
    return (
        <div className="main-title-bar flex p-8 justify-between sticky">
            <h1 className="text-2xl font-bold m-0 self-center text-white">Projects</h1>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center">
                <span className="text-2xl mr-2">+</span>
                New Project
            </button>
        </div>
    );
};
export default TitleBar;
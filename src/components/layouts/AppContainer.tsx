
const AppContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="app-container flex bg-gray-800 w-full h-screen">
            {children}
        </div>)
}
export default AppContainer;
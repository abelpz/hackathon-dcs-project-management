export function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to DCS Project Manager
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-8">
        Manage your Door43 Content Service projects efficiently with our project management tools.
      </p>
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md w-full shadow-sm">
        <h2 className="text-lg font-medium text-gray-800 mb-2">
          Getting Started
        </h2>
        <p className="text-gray-600 text-sm">
          Please log in using your DCS credentials in the sidebar to start managing your projects.
        </p>
      </div>
    </div>
  );
} 
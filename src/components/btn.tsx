interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
}
export const Button: React.FC<ButtonProps> = ({ label, ...props }) => {
    return (
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" {...props}> {label} </button>
    )
}


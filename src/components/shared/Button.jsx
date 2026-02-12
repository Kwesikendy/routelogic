export default function Button({ children, onClick, variant = 'primary', type = 'button', className = '', disabled = false }) {
    const baseClasses = 'font-bold text-body px-7 py-3.5 rounded-button transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark',
        secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white',
        danger: 'bg-danger text-white hover:bg-red-700',
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    )
}

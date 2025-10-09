export function Button({ children, className, ...props }) {
    return (
      <button {...props} className={`py-2 px-4 rounded bg-red-500 text-white ${className}`}>
        {children}
      </button>
    );
  }
  
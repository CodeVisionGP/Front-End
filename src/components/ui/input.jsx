// src/components/ui/input.jsx
export function Input(props) {
    return (
      <input
        className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-500"
        {...props}
      />
    );
  }
  
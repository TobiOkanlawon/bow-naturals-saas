import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
type Props = {
  id: string;
  label?: string;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const Input: React.FC<Props> = ({ id, label = "Password", ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label
        className="block text-sm font-medium text-gray-700 mb-1"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        className="input-field pr-10"
        placeholder="Enter your password"
        {...props}
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

export default Input;

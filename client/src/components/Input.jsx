export const Input = ({
  placeholder,
  name,
  type,
  value,
  handleChange,
  className,
  step = "0.001",
  min,
}) => (
  <input
    placeholder={placeholder}
    type={type}
    min={min}
    step={step}
    value={value}
    onChange={(e) => handleChange(e, name)}
    className={`my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white border-none text-sm white-glassmorphism ${className}`}
  />
);

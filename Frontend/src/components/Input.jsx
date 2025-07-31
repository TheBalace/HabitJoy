const Input = ({ type, value, onChange, name, placeholder, required }) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={{ padding: "8px", margin: "5px 0", width: "100%" }}
    />
  );
};

export default Input;

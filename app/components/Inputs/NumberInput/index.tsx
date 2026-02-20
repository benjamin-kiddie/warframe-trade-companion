"use client";

type Props = {
  /** Current value. */
  currentValue: number;
  /** Callback to update the form value. */
  onChange: (value: number) => void;
  /** True if this input is required. */
  required?: boolean;
};

/**
 * Number input that only accepts digits from the keyboard.
 * More convenient than built in number input, as it does not always include leading 0.
 */
export default function NumberInput({
  currentValue,
  onChange,
  required,
}: Props) {
  /** Only accept digits from keyboard. */
  function handleInputChange(newValue: string) {
    if (/^\d*$/.test(newValue)) {
      onChange(Number(newValue));
    }
  }

  return (
    <input
      type="text"
      value={currentValue}
      onChange={(e) => handleInputChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:text-white"
      placeholder="Enter number"
      required={required}
    />
  );
}

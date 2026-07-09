import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export interface AppSelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: AppSelectOption[];
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

// Radix's SelectItem throws if given value="" (empty string is reserved
// internally to mean "no selection" / show placeholder). Translate any
// empty-string option value to this sentinel at the boundary so callers
// can keep using '' (e.g. "All Statuses" filters) without knowing about
// the Radix restriction.
const EMPTY_VALUE_SENTINEL = '__empty__';

export function AppSelect({
  value,
  onValueChange,
  options,
  className,
  disabled,
  placeholder,
  id,
  name,
  required,
}: AppSelectProps) {
  return (
    <Select
      value={value === '' ? EMPTY_VALUE_SENTINEL : value}
      onValueChange={(next) =>
        onValueChange(next === EMPTY_VALUE_SENTINEL ? '' : next)
      }
      disabled={disabled}
      name={name}
      required={required}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border border-slate-700 text-white">
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value === '' ? EMPTY_VALUE_SENTINEL : opt.value}
            className="focus:bg-slate-700/50 focus:text-white text-white"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

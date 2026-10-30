

type Props<T extends string> = {
    value: T;
    labels: Record<T, string>;
    disabled?: boolean;
    onChange: (value: T) => void;
};

export default function StatusSelect<T extends string>({ value, labels, disabled, onChange }: Props<T>) {
    return (
        <select
            className="field w-auto !py-1 text-sm"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value as T)}
        >
            {Object.entries(labels).map(([key, label]) => (
                <option key={key} value={key}>{label as string}</option>
            ))}
        </select>
    );
}
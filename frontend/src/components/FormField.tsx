import type { ReactNode } from "react"



type Props = {
    label: string,
    error?: string,
    children: ReactNode,
}

export default function FormField({ label, error, children }: Props) {

    return (
        <>
            <label className="form-label">{label}</label>
            {children}
            {error && <p className="form-error">{error}</p>}
        </>
    )
}
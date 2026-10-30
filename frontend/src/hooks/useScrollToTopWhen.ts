import { useEffect } from "react";


export function useScrollToTopWhen(condition: unknown) {
    useEffect(() => {
        if (condition) window.scrollTo({ top: 0, behavior: "smooth" });
    }, [condition]);
}
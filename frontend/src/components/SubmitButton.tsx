type Props = {
    loading: boolean;
    text: string;
    loadingText: string;
};

export default function SubmitButton({ loading, text, loadingText }: Props) {
    return (
        <>
            <button className="btn mt-4" type="submit" disabled={loading}>
                {loading ? loadingText : text}
            </button>
            {loading && <p className="text-center text-sm text-muted">השרת מתעורר, זה יכול לקחת עד דקה...</p>}
        </>
    );
}
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";


type LoginForm = { email: string; password: string };


export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();


    async function onSubmit(data: LoginForm) {
        setServerError("")
        try {
            await login(data.email, data.password);
            navigate("/");
        } catch (err) {
            setServerError(err instanceof Error ? err.message : "שגיאה");
        }
    }

    return (
        <div>
            <h1 className="page-title">התחברות</h1>
            <form className="form-card" onSubmit={handleSubmit(onSubmit)}>
                <FormField label="אימייל" error={errors.email?.message}>
                    <input className="field" type="email" {...register("email", { required: "יש להזין אימייל" })} />
                </FormField>
                <FormField label="סיסמה" error={errors.password?.message}>
                    <input className="field" type="password" {...register("password", { required: "יש להזין סיסמה" })} />
                </FormField>
                {serverError && <p className="form-error">{serverError}</p>}
                <button className="btn mt-4" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "מתחבר..." : "התחבר/י"}
                </button>
                {isSubmitting && <p className="text-center text-sm text-muted">השרת מתעורר, זה יכול לקחת עד דקה...</p>}
            </form>
            <p className="mt-4 text-center text-sm">אין לך חשבון? <Link className="text-rose-dark underline" to="/register">להרשמה</Link></p>
        </div>
    )
}
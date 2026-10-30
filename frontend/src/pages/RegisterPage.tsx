


import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormField from "../components/FormField";
import SubmitButton from "../components/SubmitButton";


type RegisterForm = { name: string; email: string; password: string; confirmPassword: string };


export default function RegisterPage() {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>();


    async function onSubmit(data: RegisterForm) {
        setServerError("")
        try {
            await registerUser(data.name, data.email, data.password);
            navigate("/");
        } catch (err) {
            setServerError(err instanceof Error ? err.message : "שגיאה");
        }
    }

    return (
        <div>
            <h1 className="page-title">הרשמה</h1>
            <form className="form-card" onSubmit={handleSubmit(onSubmit)}>
                <FormField label="שם" error={errors.name?.message}>
                    <input className="field" type="text" {...register("name", { required: "יש להזין שם", minLength: { value: 2, message: "לפחות 2 תווים" } })} />
                </FormField>
                <FormField label="אימייל" error={errors.email?.message}>
                    <input className="field" type="email" {...register("email", { required: "יש להזין אימייל" })} />
                </FormField>
                <FormField label="סיסמה" error={errors.password?.message}>
                    <input className="field" type="password" {...register("password", { required: "יש להזין סיסמה", minLength: { value: 8, message: "לפחות 8 תווים" } })} />
                </FormField>
                <FormField label="אימות סיסמה" error={errors.confirmPassword?.message}>
                    <input className="field" type="password" {...register("confirmPassword", { required: "יש לאמת את הסיסמה", validate: (value) => value === watch("password") || "הסיסמאות לא תואמות" })} />
                </FormField>
                {serverError && <p className="form-error">{serverError}</p>}
                <SubmitButton loading={isSubmitting} text="הרשם/י" loadingText="נרשם..." />
            </form>
            <p className="mt-4 text-center text-sm">כבר יש לך חשבון? <Link className="text-rose-dark underline" to="/login">להתחברות</Link></p>
        </div>
    )
}
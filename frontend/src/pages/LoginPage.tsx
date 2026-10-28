import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


type LoginForm = { email: string; password: string };


export default function LoginPage()
{
    const { login } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();


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
            <form className="form-card" onSubmit = {handleSubmit(onSubmit)}>
                <label className="form-label">אימייל</label>
                <input className="field" type="email" {...register("email", { required: "יש להזין אימייל" })} />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
                <label className="form-label">סיסמה</label>
                <input className="field" type="password" {...register("password", { required: "יש להזין סיסמה" })} />
                {errors.password && <p className="form-error">{errors.password.message}</p>}
            {serverError && <p className="form-error">{serverError}</p>}
            <button className="btn mt-4" type="submit">התחבר/י</button>
            </form>
            <p className="mt-4 text-center text-sm">אין לך חשבון? <Link className="text-rose-dark underline" to="/register">להרשמה</Link></p>
        </div>
    )
}
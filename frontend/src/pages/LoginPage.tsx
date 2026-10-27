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
            <h1>התחברות</h1>
            <form onSubmit = {handleSubmit(onSubmit)}>
                <label>אימייל</label>
                <input type="email" {...register("email", { required: "יש להזין אימייל" })} />
                {errors.email && <p>{errors.email.message}</p>}
                <label>סיסמה</label>
                <input type="password" {...register("password", { required: "יש להזין סיסמה" })} />
                {errors.password && <p>{errors.password.message}</p>}
            {serverError && <p>{serverError}</p>}
            <button type="submit">התחבר/י</button>
            </form>
            <p>אין לך חשבון? <Link to="/register">להרשמה</Link></p>
        </div>
    )
}
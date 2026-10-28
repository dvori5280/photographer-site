


import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


type RegisterForm = { name: string; email: string; password: string; confirmPassword: string };


export default function RegisterPage()
{
    const { register: registerUser } =  useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");
   const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();


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
            <form className="form-card" onSubmit = {handleSubmit(onSubmit)}>
                <label className="form-label">שם</label>
                <input className="field" type="text" {...register("name", { required: "יש להזין שם", minLength: { value: 2, message: "לפחות 2 תווים" } })} />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
                <label className="form-label">אימייל</label>
                <input className="field" type="email" {...register("email", { required: "יש להזין אימייל" })} />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
                <label className="form-label">סיסמה</label>
                <input className="field" type="password" {...register("password", { required: "יש להזין סיסמה" , minLength: { value: 8, message: "לפחות 8 תווים"} })} />
                {errors.password && <p className="form-error">{errors.password.message}</p>}
                <label className="form-label">אימות סיסמה</label>
                <input className="field" type="password" {...register("confirmPassword", { required: "יש לאמת את הסיסמה", validate: (value) => value === watch("password") || "הסיסמאות לא תואמות" })} />
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
            {serverError && <p className="form-error">{serverError}</p>}
            <button className="btn mt-4" type="submit">הירשם/י</button>
            </form>
            <p className="mt-4 text-center text-sm">כבר יש לך חשבון? <Link className="text-rose-dark underline" to="/login">להתחברות</Link></p>
        </div>
    )
}
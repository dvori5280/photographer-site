


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
            <h1>הרשמה</h1>
            <form onSubmit = {handleSubmit(onSubmit)}>
                <label>שם</label>
                <input type="text" {...register("name", { required: "יש להזין שם", minLength: { value: 2, message: "לפחות 2 תווים" } })} />
                {errors.name && <p>{errors.name.message}</p>}
                <label>אימייל</label>
                <input type="email" {...register("email", { required: "יש להזין אימייל" })} />
                {errors.email && <p>{errors.email.message}</p>}
                <label>סיסמה</label>
                <input type="password" {...register("password", { required: "יש להזין סיסמה" , minLength: { value: 8, message: "לפחות 8 תווים"} })} />
                {errors.password && <p>{errors.password.message}</p>}
                <label>אימות סיסמה</label>
                <input type="password" {...register("confirmPassword", { required: "יש לאמת את הסיסמה", validate: (value) => value === watch("password") || "הסיסמאות לא תואמות" })} />
                {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
            {serverError && <p>{serverError}</p>}
            <button type="submit">הירשם/י</button>
            </form>
            <p>כבר יש לך חשבון? <Link to="/login">להתחברות</Link></p>
        </div>
    )
}
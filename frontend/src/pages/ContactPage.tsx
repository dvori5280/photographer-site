import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSendContact } from "../hooks/useSendContact";


type ContactForm = { 
    name: string; 
    email: string; 
    phone: string; 
    subject: string; 
    message: string 
};

export default function ContactPage()
{
    const sendContact = useSendContact();
    const [serverError, setServerError] = useState("");
    const [sent, setSent] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>();

    async function onSubmit(data:ContactForm) {
        setServerError("")
        setSent(false)
        try {
            await sendContact.mutateAsync({ name: data.name, 
                email: data.email, phone: data.phone || undefined, 
                subject: data.subject, message: data.message });
                setSent(true);
                reset();
        } catch (error) {
            setServerError(error instanceof Error ? error.message : "שגיאה");
        }
    }

    return (
        <div>
            <h1>צור קשר</h1>
            {sent && <p>ההודעה נשלחה, תודה! נחזור אלייך בהקדם.</p>}
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>שם</label>
<input type="text" {...register("name", {
  required: "יש להזין שם",
  minLength: { value: 2, message: "לפחות 2 תווים" },
  maxLength: { value: 80, message: "עד 80 תווים" },
})} />
{errors.name && <p>{errors.name.message}</p>}
                <label>אימייל</label>
                <input type="email" {...register("email", { required: "יש להזין אימייל" })} />
                {errors.email && <p>{errors.email.message}</p>}
                <label>טלפון</label>
                <input type="tel" {...register("phone", {
  pattern: { value: /^(\+972|0)[-\s]?\d{1,2}[-\s]?\d{7}$/, message: "טלפון לא תקין" },
})} />
                {errors.phone && <p>{errors.phone.message}</p>}
                <label>נושא</label>
                <input type="text" {...register("subject", {
  required: "יש להזין נושא",
  minLength: { value: 2, message: "לפחות 2 תווים" },
  maxLength: { value: 100, message: "עד 100 תווים" },
})} />
                {errors.subject && <p>{errors.subject.message}</p>}
                <label>הודעה</label>
                <textarea {...register("message", {
  required: "יש להזין הודעה",
  minLength: { value: 10, message: "לפחות 10 תווים" },
  maxLength: { value: 2000, message: "עד 2000 תווים" },
})} />
                {errors.message && <p>{errors.message.message}</p>}
                {serverError && <p>{serverError}</p>}
                <button type="submit" disabled={sendContact.isPending}>
  {sendContact.isPending ? "שולחת..." : "שליחה"}
</button>
            </form>
        </div>
    )
}
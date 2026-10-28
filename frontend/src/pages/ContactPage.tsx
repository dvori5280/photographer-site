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
            <h1 className="page-title">צור קשר</h1>
            {sent && <p className="mx-auto mb-4 max-w-lg rounded-xl bg-ok/15 p-3 text-center text-ok">ההודעה נשלחה, תודה! נחזור אלייך בהקדם.</p>}
            <form className="form-card" onSubmit={handleSubmit(onSubmit)}>
                <label className="form-label">שם</label>
<input className="field" type="text" {...register("name", {
  required: "יש להזין שם",
  minLength: { value: 2, message: "לפחות 2 תווים" },
  maxLength: { value: 80, message: "עד 80 תווים" },
})} />
{errors.name && <p className="form-error">{errors.name.message}</p>}
                <label className="form-label">אימייל</label>
                <input className="field" type="email" {...register("email", { required: "יש להזין אימייל" })} />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
                <label className="form-label">טלפון</label>
                <input className="field" type="tel" {...register("phone", {
  pattern: { value: /^(\+972|0)[-\s]?\d{1,2}[-\s]?\d{7}$/, message: "טלפון לא תקין" },
})} />
                {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                <label className="form-label">נושא</label>
                <input className="field" type="text" {...register("subject", {
  required: "יש להזין נושא",
  minLength: { value: 2, message: "לפחות 2 תווים" },
  maxLength: { value: 100, message: "עד 100 תווים" },
})} />
                {errors.subject && <p className="form-error">{errors.subject.message}</p>}
                <label className="form-label">הודעה</label>
                <textarea className="field min-h-28" {...register("message", {
  required: "יש להזין הודעה",
  minLength: { value: 10, message: "לפחות 10 תווים" },
  maxLength: { value: 2000, message: "עד 2000 תווים" },
})} />
                {errors.message && <p className="form-error">{errors.message.message}</p>}
                {serverError && <p className="form-error">{serverError}</p>}
                <button className="btn mt-4" type="submit" disabled={sendContact.isPending}>
  {sendContact.isPending ? "שולחת..." : "שליחה"}
</button>
            </form>
        </div>
    )
}
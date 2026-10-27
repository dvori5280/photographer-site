import type {User, AuthResult} from "../types"
import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../api/client";



type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
    const [user,setUser] = useState<User | null>(null);
    const [isLoading , setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if(!token)
        {
            setIsLoading(false);
            return;
        }
  api<{ user: User }>("/api/auth/me")
    .then((result) => setUser(result.user))
    .catch(() => localStorage.removeItem("token"))
    .finally(()=>setIsLoading(false));
}, []);

    function saveSession(result: AuthResult) {
        localStorage.setItem("token", result.accessToken);
        setUser(result.user);
    }
 async function login(email: string, password: string) {
    const result = await api<AuthResult>("/api/auth/login", {
     method: "POST",
     body: JSON.stringify({ email, password }),
   });
   saveSession(result);
}

async function register(name:string,email: string, password: string) {
    const result = await api<AuthResult>("/api/auth/register", {
     method: "POST",
     body: JSON.stringify({name, email, password }),
   });
   saveSession(result);
}

function logout() {
    localStorage.removeItem("token");
setUser(null);
    
}
return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const value = useContext(AuthContext);
    if (!value)
        throw new Error("useAuth must be used inside AuthProvider");
    return value;
}
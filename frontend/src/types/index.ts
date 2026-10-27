export type Role = "CUSTOMER" | "ADMIN";
export type EventType = "NEWBORN" | "SMASH_CAKE" | 
                        "CHALLAH_PHOTOSHOOT" | "FAMILY";
export type BookingStatus = "NEW" | "IN_PROGRESS" | 
                            "APPROVED" | "REJECTED" | 
                            "CANCELLED";
export type ContactStatus = "NEW" | "HANDLED";                        

export interface Category{
    id: string;
    name: string;
    description: string | null;
}

export interface Photo{
    id:string;
    title: string;
    description:string | null;
    imageUrl: string;
    takenAt:string | null;
    isPublished: boolean;
    category: {id: string, name:string};
    createdAt:string;
    updatedAt: string;
}

export interface Package{
    id:string;
    name:string; 
    description: string;
    basePrice: number;
    durationMinutes: number;
    includedItems:string[];
    imageUrl:string | null;
    isActive: boolean;
    category:{id: string, name:string};
    createdAt:string;
    updatedAt: string;
}

export interface Booking{
    id: string;
    requestedDate: string;
    eventType: EventType;
    location:string;
    phone: string;
    notes:string | null;
    status: BookingStatus;
    priceAtRequest: number;
    package:{id: string, name:string};
    customer?:{id: string; name:string; email:string;};
    createdAt:string; 
    updatedAt: string;
}


export interface ContactMessage{
    id:string; 
    name:string; 
    email:string;
    subject:string; 
    message: string;
    phone:string | null;
    status: ContactStatus;
    createdAt: string;
}

export interface AuthResult{
    user: User;
    accessToken: string;
}

export interface User{
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: string;
}
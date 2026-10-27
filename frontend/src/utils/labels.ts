import type { EventType, BookingStatus, ContactStatus } from "../types";

export const eventTypeLabels : Record<EventType, string> = {
    NEWBORN : "צילומי ניו בורן",
    SMASH_CAKE : "סמאש קייק",
    CHALLAH_PHOTOSHOOT : "צילומי חלאקה",
    FAMILY : "צילומי משפחות",

};
export const bookingStatusLabels : Record<BookingStatus, string> = {
    NEW : "חדשה",
    IN_PROGRESS : "בטיפול",
    APPROVED : "אושרה",
    REJECTED : "נדחתה",
    CANCELLED : "בוטלה",
};
export const contactStatusLabels : Record<ContactStatus, string> = {
    NEW : "חדשה",
    HANDLED : "טופלה",
};
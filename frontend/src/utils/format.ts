


export function formatPrice(price:number) {


    const formatter = new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
    });

    return formatter.format(price);
};

export function formatDate(text : string) {
    
    const date = text.split("-");
    const retDate = date[2] + "/" + date[1] + "/" + date[0];
    return retDate;
};

export function formatDuration(minutes:number) {
    
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    switch (h) {
        case 1:
        {
            if(m > 0)
                return "שעה ו-" + m + " דקות";
            return "שעה";
        }
        case 2: 
        {
            if(m > 0)
                return "שעתיים ו-" + m + " דקות";
            return "שעתיים";
        }
        case 0: 
            return m + " דקות";
        default:
        {
            if(m > 0)
                return h + " שעות ו-" + m + " דקות";
            return h + " שעות";
        }
    }


}
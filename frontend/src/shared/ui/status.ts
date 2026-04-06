export function getStatusClass(status: string) {
    const normalized = status.toLowerCase();

    switch (normalized) {
        case "created":
            return "badge status-created";
        case "confirmed":
            return "badge status-confirmed";
        case "inprogress":
            return "badge status-inprogress";
        case "done":
            return "badge status-done";
        case "cancelled":
            return "badge status-cancelled";
        case "approved":
            return "badge status-approved";
        case "rejected":
            return "badge status-rejected";
        case "ordered":
            return "badge status-ordered";
        case "received":
            return "badge status-received";
        default:
            return "badge";
    }
}
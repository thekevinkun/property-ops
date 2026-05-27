// Server-side validation for file type and size. Returns an error message if invalid, or null if valid
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Accepted file types for input
export const ACCEPTED_FILE_TYPE_INPUT = "image/jpeg,image/png,image/webp";

// 5MB limit — covers real-world phone camera shots without accepting RAW-sized files
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const BUCKET = "evidence";
import multer from "multer";

const storage = multer.memoryStorage(); // Save file in memory as a Buffer

export const upload = multer({ storage });

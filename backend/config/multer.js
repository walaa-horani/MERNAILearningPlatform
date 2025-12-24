import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads/documents");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Created upload directory:", uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Extract file extension
        const ext = path.extname(file.originalname); // e.g., ".pdf"
        const nameWithoutExt = path.basename(file.originalname, ext); // e.g., "document"
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

        // Generate filename: timestamp-random-originalname.pdf
        const filename = `${uniqueSuffix}-${nameWithoutExt}${ext}`;

        console.log("Generated filename:", filename);
        cb(null, filename);
    },
});

// Filter PDF files only
const fileFilter = (req, file, cb) => {
    console.log("File upload attempt:");
    console.log("- Original name:", file.originalname);
    console.log("- MIME type:", file.mimetype);

    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed!"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
    },
});

export default upload;
import multer from "multer";
import path from "path";

const storage = multer.memoryStorage(); // 🔹 ya no se guardará en disco

// Configuración de almacenamiento
/*
const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => { 
        const baseName = req.baseUrl.substring(1);
        const dividedName = file.originalname.split(".");
        const uniqueName =  baseName +"-" + req.params.id+"."+  dividedName[dividedName.length -1];
        cb(null, uniqueName);
    },
});
*/

export const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // máximo 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ["image/png", "image/jpeg"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Tipo de archivo no permitido"));
        }
    },
});


export const getImage = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            message: "No se recibió ningún archivo.",
        });
    }
    console.log("Archivo recibido:", req.file);
    next();

}
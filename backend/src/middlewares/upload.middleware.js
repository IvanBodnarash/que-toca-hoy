import multer from "multer";
import path from "path";

const storage = multer.memoryStorage(); // will no longer be saved to disk

export const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

export const getImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file received.",
    });
  }
  console.log("File received:", req.file);
  next();
};

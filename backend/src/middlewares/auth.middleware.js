import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "clave-secreta";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token received:", token);

  try {
    // Attempt to verify the token normally
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    console.log("VERIFY RESULT", decoded);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "TOKEN_EXPIRED" });
    }

    return res.status(401).json({ error: "Invalid token" });
  }
};

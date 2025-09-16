import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "clave-secreta";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token faltante o inválido" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token recibido:", token);

  try {
    // Intentar verificar el token normalmente
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    console.log("VERIFY RESULT", decoded);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "TOKEN_EXPIRED" });
    }

    return res.status(401).json({ error: "Token inválido" });
  }
};

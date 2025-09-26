import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { User, UserRefresh } from "../models/index.model.js";

const SECRET = process.env.JWT_SECRET || "clave-secreta";

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRATION;
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRATION || "7d";

function toSafeUser(u) {
  const plain = u.get ? u.get({ plain: true }) : { ...u };
  delete plain.password;
  return plain;
}

function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("jid", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// Login
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }
    // Generate token
    const payload = { idUser: user.idUser, username: user.username };
    const token = jwt.sign(payload, SECRET, {
      expiresIn: ACCESS_EXPIRES_IN,
    });

    // Generate refresh token
    const randomString = uuidv4();
    const payload_refresh = { idUser: user.idUser, string: randomString }; // We include idUser to know which user the refresh token belongs to
    const token_refresh = jwt.sign(payload_refresh, SECRET, {
      expiresIn: REFRESH_EXPIRES_IN,
    });

    await UserRefresh.create({
      idUser: user.idUser,
      refreshToken: token_refresh,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setRefreshCookie(res, token_refresh);

    res.json({ token, user: toSafeUser(user) });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Register
const register = async (req, res) => {
  const { name, email, username, password, image, color } = req.body;

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: "The username is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
      name,
      image: image || null,
      color: color || null,
    });

    // Autologin
    const payload = { idUser: newUser.idUser, username: newUser.username };
    const token = jwt.sign(payload, SECRET, {
      expiresIn: ACCESS_EXPIRES_IN,
    });

    const token_refresh = jwt.sign(
      {
        idUser: newUser.idUser,
        string: uuidv4(),
      },
      SECRET,
      { expiresIn: REFRESH_EXPIRES_IN }
    );

    await UserRefresh.create({
      idUser: newUser.idUser,
      refreshToken: token_refresh,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setRefreshCookie(res, token_refresh);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: toSafeUser(newUser),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const refresh = async (req, res) => {
  const tokenFromCookie = req.cookies?.jid;
  if (!tokenFromCookie) return res.status(401).json({ error: "NO_REFRESH" });

  console.log("🍪 tokenFromCookie", tokenFromCookie);

  try {
    const decoded = jwt.verify(tokenFromCookie, SECRET); // { string, idUser, iat, exp }
    const userRefresh = await UserRefresh.findOne({
      where: { refreshToken: tokenFromCookie },
    });

    console.log("🗄 userRefresh", userRefresh?.refreshToken);

    console.log("cookie jid len=", tokenFromCookie?.length);
    console.log("db refresh len=", userRefresh?.refreshToken?.length);
    console.log("equal?", userRefresh?.refreshToken === tokenFromCookie);

    if (!userRefresh) {
      return res.status(401).json({ error: "REFRESH_MISMATCH" });
    }

    if (userRefresh.expiresAt && userRefresh.expiresAt < new Date()) {
      return res.status(401).json({ error: "REFRESH_EXPIRED" });
    }

    const user = await User.findByPk(decoded.idUser);
    if (!user) return res.status(401).json({ error: "USER_NOT_FOUND" });

    // New access
    const accessToken = jwt.sign(
      { idUser: user.idUser, username: user.username },
      SECRET,
      { expiresIn: ACCESS_EXPIRES_IN }
    );

    // Rotation refresh
    const newRefresh = jwt.sign(
      { idUser: user.idUser, string: uuidv4() },
      SECRET,
      { expiresIn: REFRESH_EXPIRES_IN }
    );

    await UserRefresh.destroy({ where: { refreshToken: tokenFromCookie } });
    await UserRefresh.create({
      idUser: user.idUser,
      refreshToken: newRefresh,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setRefreshCookie(res, newRefresh);

    res.json({ token: accessToken });
  } catch (e) {
    console.error("Error en refresh:", e);
    return res.status(401).json({ error: "REFRESH_INVALID_OR_EXPIRED" });
  }
};

// Logout
const logout = async (req, res) => {
  const tokenFromCookie = req.cookies?.jid;
  try {
    if (tokenFromCookie) {
      await UserRefresh.destroy({ where: { refreshToken: tokenFromCookie } });
    }
  } catch (_) {}
  res.clearCookie("jid", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.json({ ok: true });
};

// Profile
const profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.idUser);
    if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });
    res.json({ message: "Acceso permitido", user: toSafeUser(user) });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const meId = req.user?.idUser;
    if (!meId) return res.status(401).json({ error: "UNAUTHORIZED" });

    const user = await User.findByPk(meId);
    if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });

    const { name, email, username, image, color, password, currentPassword } =
      req.body;

    if (username && username !== user.username) {
      const existing = await User.findOne({ where: { username } });
      if (existing) {
        return res.status(409).json({ error: "USERNAME_TAKEN" });
      }
      user.username = username;
    }

    if (typeof name !== "undefined") user.name = name;
    if (typeof email !== "undefined") user.email = email;
    if (typeof image !== "undefined") user.image = image;
    if (typeof color !== "undefined") user.color = color;

    if (
      typeof password !== "undefined" &&
      password !== null &&
      password !== ""
    ) {
      if (!currentPassword) {
        return res.status(400).json({ error: "CURRENT_PASSWORD_REQUIRED" });
      }
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) {
        return res.status(401).json({ error: "CURRENT_PASSWORD_INVALID" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "PASSWORD_TOO_SHORT" });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({ user: toSafeUser(user) });
  } catch (e) {
    console.error("updateProfile error:", e);
    res.status(500).json({ error: "SERVER_ERROR" });
  }
};

export { login, register, profile, refresh, logout, updateProfile };

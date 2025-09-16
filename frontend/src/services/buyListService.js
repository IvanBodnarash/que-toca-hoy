const API = "http://localhost:3000";
/*import { useNavigate } from "react-router-dom";
const navigate = useNavigate();*/


// 🔹 Obtener lista de compras (buylist) del usuario
export async function getMyBuyListReport(filter = "today") {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");
    if (!token || !rawUser) throw new Error("NO_AUTH");

    const me = JSON.parse(rawUser);
    const idUser = me.idUser;

    const res = await fetch(`${API}/user/${idUser}/buylist/report?filter=${filter}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        credentials: "include",
    });

    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        /*if (msg.includes("TOKEN_EXPIRED")) {
            // limpiar localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Redirige a login
            navigate("/auth");
        }*/
        throw new Error(`HTTP ${res.status} ${msg || ""}`.trim());
    }
    return res.json();
}

// 🔹 Actualizar cantidades en buylist
export async function updateBuyList(payload) {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");
    if (!token || !rawUser) throw new Error("NO_AUTH");

    const me = JSON.parse(rawUser);
    const idUser = me.idUser;

    const res = await fetch(`${API}/user/${idUser}/buylist`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        /*if (msg.includes("TOKEN_EXPIRED")) {
            // limpiar localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Redirige a login
            navigate("/auth");
        }*/
        throw new Error(`HTTP ${res.status} ${msg || ""}`.trim());
    }
    return res.json();

}

export async function getGroupBuyListReport(idGroup, filter = "today") {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");
    if (!token || !rawUser) throw new Error("NO_AUTH");

    const me = JSON.parse(rawUser);
    const idUser = me.idUser;
    console.log("idUser:", idUser, "idGroup:", idGroup);

    const res = await fetch(`${API}/user/${idUser}/group/${idGroup}/buylist/report?filter=${filter}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        credentials: "include",
    });

    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${msg || ""}`.trim());
    }
    return res.json();
}
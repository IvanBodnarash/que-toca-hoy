import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getMyGroups, getGroupDetails } from "../services/groupsService";

export const GroupContext = createContext(null);

export function GroupsProvider({ children }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [groupDetails, setGroupDetails] = useState({}); // 🔑 { [groupId]: data }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refetchGroups = async () => {
    if (!user?.idUser) return;
    setLoading(true);
    setError("");
    try {
      const data = await getMyGroups();
      setGroups(Array.isArray(data) ? data : data?.groups ?? []);
    } catch (error) {
      console.error("getMyGroups failed:", error);
      setError(error?.message || "Error to load groups");
    } finally {
      setLoading(false);
    }
  };

  const refetchGroupDetails = async (groupId) => {
    if (!groupId) return;
    try {
      const data = await getGroupDetails(groupId);
      setGroupDetails((prev) => ({ ...prev, [groupId]: data }));
    } catch (error) {
      console.error("getGroupDetails failed:", error);
    }
  };

  useEffect(() => {
    refetchGroups();
  }, [user?.idUser]);

  return (
    <GroupContext.Provider
      value={{
        groups,
        loading,
        error,
        refetchGroups,
        refetchGroupDetails,
        groupDetails,
        setGroups,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export const useGroup = () => useContext(GroupContext);

import { useAppStore } from "../state/AppStore";
import { getGroupUsers } from "../services/groupsService";
import { useCallback } from "react";

export function useGroupMembersStore(idGroup) {
  const { state, dispatch } = useAppStore();
  const slice = state.groups[idGroup] || {};
  const members = slice.members || [];
  const loaded = !!slice.membersLoaded;

  const fetchMembers = useCallback(async () => {
    const data = await getGroupUsers(idGroup);
    dispatch({ type: "GROUP/SET_MEMBERS", idGroup, members: data || [] });
  }, [idGroup, dispatch]);

  return { members, loaded, fetchMembers, dispatch };
}

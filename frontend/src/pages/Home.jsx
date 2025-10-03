import { IoSettingsOutline } from "react-icons/io5";
import { RiGroupLine } from "react-icons/ri";
import { ImExit } from "react-icons/im";

import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCallback, useState } from "react";
import NewGroupModal from "../components/groups/NewGroupModal";

import defaultAvatar from "../assets/initialAvatar.jpg";
import { safeImageSrc } from "../utils/imageProcessor";
import JoinGroupModal from "../components/groups/JoinGroupModal";

import { deleteGroup, getMyGroups } from "../services/groupsService";

import { useGroup } from "../context/GroupContext";
import ConfirmDialog from "../components/alerts/ConfirmDialog";
import GroupMembersStrip from "../components/groups/GetMembersStrip";

import { useEffect } from "react";
import BriefInfoSection from "../components/ui/BriefInfoSection";
import { useCachedQuery } from "../hooks/useCachedQuery";
import SceletonLoader from "../components/ui/SceletonLoader";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [newGroupModalOpened, setNewGroupModalOpened] = useState(false);
  const [joinGroupModalOpened, setJoinGroupModalOpened] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  // If the user is not there yet (for a moment after loading) - show a stub
  const displayName = user?.username || "User";

  const fetchGroups = useCallback(() => getMyGroups(), []);
  const {
    data: groups = [],
    loading,
    error,
    refetch: refetchGroups,
  } = useCachedQuery(["groups", user?.idUser], fetchGroups, {
    ttl: 60_000,
    enabled: !!user?.idUser,
    refetchOnWindowFocus: true,
    keepPreviousData: true,
  });

  return (
    <div className="">
      {/* Header */}
      <header className="flex flex-row items-center gap-4 bg-slate-100 py-3 px-3 md:py-2 md:px-32 border-b border-slate-400">
        <div
          className="size-16 rounded-full overflow-hidden shrink-0 border-4"
          style={{ borderColor: user?.color || "#1c5563" }}
        >
          <img
            src={safeImageSrc(user?.image, defaultAvatar) || defaultAvatar}
            alt="user avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-row w-full items-center justify-between">
          <div className="flex flex-col">
            <h1 className="font-bold text-cyan-900/90 text-lg">
              Welcome back!
            </h1>
            <h3 className="text-slate-700 text-md">{displayName}</h3>
          </div>
          <div className="flex flex-row items-center gap-6">
            <div>
              <NavLink
                to="/aboutUs"
                aria-label="Que Toca Hoy — Home"
                className="leading-none text-center text-cyan-900 hover:text-cyan-700 transition-all w-16"
              >
                <p className="text-3xl leading-none hidden md:block main-logo">
                  QueTocaHoy
                </p>
                <p className="text-xs leading-none hidden md:block">About Us</p>
              </NavLink>
            </div>
            <IoSettingsOutline
              onClick={() => navigate("userSettings")}
              title="Settings"
              className="text-cyan-900 hover:text-cyan-800 cursor-pointer hover:rotate-90 active:rotate-90 active:scale-110 transition-all"
              size={38}
            />
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-4 m-4 md:py-2 md:px-32">
        <BriefInfoSection userData={user} />

        <div className="flex flex-row justify-between items-center">
          <h1 className="font-bold text-cyan-900/80 text-lg">Your Groups</h1>
          <div className="text-sm md:text-md flex gap-2">
            <button
              className="bg-cyan-900 hover:bg-cyan-800 active:bg-cyan-700 transition-all cursor-pointer text-white p-2 rounded-md"
              onClick={() => setJoinGroupModalOpened(true)}
            >
              Join Group
            </button>
            <button
              className="bg-cyan-900 hover:bg-cyan-800 active:bg-cyan-700 transition-all cursor-pointer text-white p-2 rounded-md"
              onClick={() => setNewGroupModalOpened(true)}
            >
              + New Group
            </button>
          </div>
        </div>

        {loading && !error && (
          <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
            <SceletonLoader />
            <SceletonLoader />
          </div>
        )}
        {error && (
          <div className="text-red-600">Failed to load groups. Try again.</div>
        )}

        {!loading && !error && (
          <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
            {!groups || groups.length === 0 ? (
              loading ? (
                <div className="text-slate-600 animate-pulse">
                  Loading groups…
                </div>
              ) : (
                <div className="text-slate-600">You have no groups yet</div>
              )
            ) : (
              groups.map((group) => (
                <NavLink
                  key={group.idGroup}
                  to={`/app/group/${group.idGroup}/calendar`}
                  className="sm:min-w-120"
                >
                  <div className="flex flex-row gap-3 bg-slate-300 hover:bg-slate-200 transition-all p-3 rounded-md border border-slate-400 items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-slate-500 overflow-hidden bg-white/50">
                      {group.image ? (
                        <img
                          src={safeImageSrc(group.image)}
                          alt={`${group.name} avatar`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = defaultAvatar;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <RiGroupLine size={22} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 relative transition-all">
                      <h1 className="md:text-lg text-cyan-900/90 font-semibold truncate">
                        {group.name}
                      </h1>

                      <GroupMembersStrip idGroup={group.idGroup} max={5} />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Leave Group */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setGroupToDelete(group);
                          setConfirmOpen(true);
                        }}
                        className="text-cyan-900 hover:text-slate-500 cursor-pointer p-2 rounded border border-slate-400 bg-slate-100"
                      >
                        <ImExit size={20} />
                      </button>
                    </div>
                  </div>
                </NavLink>
              ))
            )}
          </div>
        )}

        {newGroupModalOpened && (
          <NewGroupModal
            onClose={() => setNewGroupModalOpened(false)}
            onCreated={async () => {
              await refetchGroups();
            }}
          />
        )}
        {joinGroupModalOpened && (
          <JoinGroupModal
            onClose={() => setJoinGroupModalOpened(false)}
            onJoined={async () => {
              await refetchGroups();
              setJoinGroupModalOpened(false);
            }}
          />
        )}
        {confirmOpen && (
          <ConfirmDialog
            open={confirmOpen}
            title="Leave group"
            message={`Are you sure you want to leave "${groupToDelete?.name}"?`}
            confirmText="Leave"
            cancelText="Cancel"
            danger
            onCancel={() => {
              setConfirmOpen(false);
              setGroupToDelete(null);
            }}
            onConfirm={async () => {
              try {
                await deleteGroup(groupToDelete.idGroup);
                await refetchGroups();
              } catch (err) {
                console.error("Failed to delete group", err);
              } finally {
                setConfirmOpen(false);
                setGroupToDelete(null);
              }
            }}
          />
        )}
      </main>
      <footer className="flex items-end justify-center p-8">
        {/* About Us Link */}
        <div className="py-2 md:hidden text-center">
          <NavLink
            to="/aboutUs"
            aria-label="Que Toca Hoy — Home"
            className="leading-none text-cyan-900 hover:text-cyan-700 hover:scale-75 transition-all"
          >
            <p className="text-3xl main-logo">QueTocaHoy</p>
            <p>About Us</p>
          </NavLink>
        </div>
      </footer>
    </div>
  );
}

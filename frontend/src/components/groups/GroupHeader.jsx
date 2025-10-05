import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router";
import { useGroup } from "../../context/GroupContext";
import MobileNavItem from "../navigation/MobileNavItem";
import { dataUrlToFile, safeImageSrc } from "../../utils/imageProcessor";
import GroupImageUploader from "./GroupImageUploader.jsx";
import defaultGroupAvatar from "../../assets/defaultGroupImg.png";
import {
  uploadGroupImage,
  updateGroupName,
  getGroupById,
} from "../../services/groupsService.js";
import { FiRefreshCw } from "react-icons/fi";
import { startCronJob } from "../../services/taskDatedService.js";
import { BiHome } from "react-icons/bi";
import { FaEdit } from "react-icons/fa";
import { IoIosSave } from "react-icons/io";
import { GiCancel } from "react-icons/gi";

import { useGroupRealtime } from "../../realtime/useGroupRealtime.js";

export default function GroupHeader() {
  const { groupId } = useParams();
  const { groups, loading, error, setGroups } = useGroup();

  const group = groups.find((g) => String(g.idGroup) === String(groupId));

  const [fallbackGroup, setFallbackGroup] = useState(null);
  const effectiveGroup = group || fallbackGroup;

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(effectiveGroup?.name || "");

  useGroupRealtime(groupId, {
    onGroupPatched: ({ patch }) => {
      setGroups((prev) =>
        prev.map((g) =>
          String(g.idGroup) === String(groupId) ? { ...g, ...patch } : g
        )
      );
    },
  });

  useEffect(() => {
    setNewName(effectiveGroup?.name || "");
  }, [effectiveGroup?.name]);

  useEffect(() => {
    if (!groupId) return;
    if (group) {
      setFallbackGroup(group);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const g = await getGroupById(groupId);
        if (cancelled || !g) return;
        setFallbackGroup(g);
        setGroups((prev) => {
          const exists = prev.some(
            (x) => String(x.idGroup) === String(g.idGroup)
          );
          return exists
            ? prev.map((x) =>
                String(x.idGroup) === String(g.idGroup) ? { ...x, ...g } : x
              )
            : [...prev, g];
        });
      } catch (e) {
        console.warn("getGroupById failed:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [groupId, group, setGroups]);

  const handleFileChange = async (dataUrl) => {
    try {
      const file = dataUrlToFile(dataUrl, `group-${groupId}.png`);
      const base64Image = await uploadGroupImage(groupId, file);
      setGroups((prevGroups) =>
        prevGroups.map((g) =>
          String(g.idGroup) === String(groupId)
            ? { ...g, image: base64Image }
            : g
        )
      );
    } catch (err) {
      console.error("Error uploading image:", err);
      alert(err.message);
    }
  };

  const handleStartCronJob = async (e) => {
    e.preventDefault();
    try {
      await startCronJob();
    } catch (err) {
      alert(err?.message || "Failed to start cron job");
    }
  };

  const handleNameClick = () => {
    setIsEditingName(true);
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const handleNameSubmit = async () => {
    if (!newName.trim()) return;
    try {
      await updateGroupName(groupId, newName.trim());
      setGroups((prevGroups) =>
        prevGroups.map((g) =>
          String(g.idGroup) === String(groupId)
            ? { ...g, name: newName.trim() }
            : g
        )
      );
      setFallbackGroup((prev) =>
        prev ? { ...prev, name: newName.trim() } : prev
      );
      setIsEditingName(false);
    } catch (err) {
      console.error("Error name changing:", err);
      alert(err.message);
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") handleNameSubmit();
    if (e.key === "Escape") {
      setNewName(group?.name || "");
      setIsEditingName(false);
    }
  };

  return (
    <div className="fixed w-full bg-cyan-800 flex flex-row items-center p-2 gap-2 md:gap-4 z-10 justify-between px-5 md:px-32">
      <GroupImageUploader
        avatar={safeImageSrc(effectiveGroup?.image) || defaultGroupAvatar}
        onChangeAvatar={handleFileChange}
        size="size-14"
      />

      <div className="flex-1">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newName}
              onChange={handleNameChange}
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyDown}
              autoFocus
              className="md:text-xl font-semibold p-1 rounded-md w-full bg-white/50 text-slate-800 border border-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              placeholder="Group name"
            />
            <button
              onClick={handleNameSubmit}
              className="p-2 rounded bg-white/15 text-white hover:bg-white/25 transition cursor-pointer"
              title="Save (Enter)"
            >
              <IoIosSave className="text-xl" />
            </button>
            <button
              onClick={() => {
                setNewName(group?.name || "");
                setIsEditingName(false);
              }}
              className="p-2 rounded-md bg-white/10 text-white/80 hover:bg-white/20 transition cursor-pointer"
              title="Cancel (Esc)"
            >
              <GiCancel className="text-xl" />
            </button>
          </div>
        ) : (
          <div className="group inline-flex items-center gap-2">
            <h1
              className="text-md md:text-xl text-white font-bold cursor-pointer select-none group-hover:underline decoration-white/60 underline-offset-4"
              onClick={handleNameClick}
              title="Click to change name"
            >
              {effectiveGroup?.name || "Loading..."}
            </h1>
            <FaEdit
              onClick={handleNameClick}
              className="text-white size-5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            />
          </div>
        )}
      </div>

      <div className="flex flex-end items-center justify-center gap-1 md:gap-2 text-white transition-all">
        {/* <button
          onClick={handleStartCronJob}
          title="Start scheduled tasks"
          className="inline-flex size-14 items-center justify-center hover:scale-105 active:scale-100 rounded-2xl hover:border-white/40 hover:bg-white/5 hover:border-2 cursor-pointer"
        >
          <FiRefreshCw className="size-8 hover:scale-105 hover:rotate-90 active:scale-100 transition-all" />
        </button> */}

        <NavLink
          to="/"
          title="Home"
          className="inline-flex size-14 items-center justify-center hover:scale-105 active:scale-100 rounded-2xl hover:border-white/40 hover:bg-white/5 hover:border-2 cursor-pointer"
        >
          <BiHome className="size-10 hover:scale-105 active:scale-100 transition-all" />
        </NavLink>
      </div>

      {error && (
        <span className="ml-2 text-sm text-red-200">Failed to load groups</span>
      )}
    </div>
  );
}

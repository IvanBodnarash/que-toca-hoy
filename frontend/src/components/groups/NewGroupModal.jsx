import { useState } from "react";
import { FaCopy } from "react-icons/fa6";
import { BiShow, BiHide } from "react-icons/bi";
import { createGroup } from "../../services/groupsService";
import GroupImageUploader from "./GroupImageUploader";

import initialGroupImg from "../../assets/defaultGroupImg.png";

export default function NewGroupModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState("");
  const [imageData, setImageData] = useState(initialGroupImg);

  const [invitePin, setInvitePin] = useState("");
  const [pinHidden, setPinHidden] = useState(true);
  const [displayCopied, setDisplayCopied] = useState(false);
  const [error, setError] = useState("");

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setDisplayCopied(true);
      setTimeout(() => {
        setDisplayCopied(false);
      }, 2500);
    } catch (error) {
      console.log(error);
    }
  };

  const submitAll = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await createGroup({ name: title, image: imageData });
      setInvitePin(res.pin); // <- PIN from backend
      setStep(2);
      if (onCreated) await onCreated(); // refetch in Home
    } catch (err) {
      setError(err?.message || "Failed to create group");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[85%] md:w-2/5 z-55 min-h-54 rounded-2xl bg-white p-4 shadow-xl">
        {step === 1 ? (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl text-slate-700 font-semibold">New Group</h2>
              <button
                onClick={() => onClose()}
                className="inline-flex h-8 w-8 items-center justify-center rounded cursor-pointer hover:bg-gray-100"
                title="close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="space-y-2">
              {/* Title */}
              <div className="flex text-sm md:text-md flex-col gap-2">
                <label htmlFor="title" className="text-slate-800">
                  Title
                </label>
                <input
                  id="title"
                  value={title}
                  type="text"
                  className="w-full border border-slate-600 outline-cyan-700 rounded-sm p-2"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Image */}
              <div className="flex text-sm md:text-md flex-col gap-2">
                <label htmlFor="title" className="text-slate-800">
                  Group Image
                </label>
                <GroupImageUploader
                  avatar={imageData}
                  onChangeAvatar={setImageData}
                />
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              {/* Action Buttons */}
              <div className="flex flex-row justify-end gap-2">
                <button
                  className="px-4 py-1 rounded-md bg-red-600/60 hover:bg-red-500 active:bg-red-400 text-white cursor-pointer transition-all"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-1 rounded-md bg-cyan-900 hover:bg-cyan-800 active:bg-cyan-700 text-white cursor-pointer transition-all"
                  onClick={submitAll}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl text-center font-semibold">
                Group created
              </h1>
              <button
                onClick={() => onClose()}
                className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100 cursor-pointer"
                title="close"
              >
                ✕
              </button>
            </div>

            {/* Pin number */}
            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-slate-800">
                Invite Pin
              </label>
              <div className="flex flex-row gap-2 justify-center items-center p-8 transition-all">
                {pinHidden ? (
                  <>
                    {" "}
                    <h1 className="text-3xl font-bold text-gray-600">******</h1>
                    <BiHide
                      className="text-xl text-gray-600 cursor-pointer"
                      onClick={() => setPinHidden(false)}
                    />
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-600">
                      {invitePin}
                    </h1>
                    <BiShow
                      className="text-xl text-gray-600 cursor-pointer"
                      onClick={() => setPinHidden(true)}
                    />
                  </>
                )}
                <FaCopy
                  className="text-gray-600 text-xl cursor-pointer"
                  onClick={() => copyText(invitePin)}
                />
                {displayCopied && <p className="text-gray-600">Coppied!</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import defaultAvatar from "../../assets/initialAvatar.jpg";
import { resizeImageToDataURL, safeImageSrc } from "../../utils/imageProcessor";

export default function UserImageUploader({ avatar, onChangeAvatar }) {
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await resizeImageToDataURL(file, 256, 0.8);
      onChangeAvatar(dataUrl);
      return;
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChangeAvatar(String(reader.result).replace(/\s+/g, ""));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative size-28 rounded-full border border-slate-400 overflow-hidden">
      <img
        src={safeImageSrc(avatar, defaultAvatar)}
        alt="userImage"
        className="size-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-slate-600/80 flex items-center justify-center py-2 cursor-pointer">
        <MdOutlineAddPhotoAlternate size={20} className="text-white" />
      </div>
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => handleFileChange(e)}
      />
    </div>
  );
}

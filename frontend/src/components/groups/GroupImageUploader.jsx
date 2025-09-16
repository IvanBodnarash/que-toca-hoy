import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import defaultGroupImg from "../../assets/defaultGroupImg.png";
import { resizeImageToDataURL, safeImageSrc } from "../../utils/imageProcessor";

export default function GroupImageUploader({
  avatar,
  onChangeAvatar,
  onFile,
  size = "size-24",
}) {
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (typeof onFile === "function") {
      onFile(file);
      return;
    }

    try {
      const dataUrl = await resizeImageToDataURL(file, 256, 0.8);
      onChangeAvatar(dataUrl);
      return;
    } catch (error) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChangeAvatar(String(reader.result).replace(/\s+/g, ""));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <label
      className={`relative ${size} rounded-full overflow-hidden group block cursor-pointer`}
      title="Change Image"
    >
      <img
        src={safeImageSrc(avatar, defaultGroupImg)}
        alt="Group Image"
        className="size-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-slate-600/80 flex items-center justify-center py-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <MdOutlineAddPhotoAlternate size={20} className="text-white" />
      </div>
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={handleFileChange}
      />
    </label>
  );
}

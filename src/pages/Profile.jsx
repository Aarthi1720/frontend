import React, { useState, useEffect, useContext, useRef } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  UploadCloud,
  Trash2,
  Lock,
  User,
  Coins,
  BookHeartIcon,
} from "lucide-react";
import Spinner from "../components/common/Spinner";
import Loader from "../components/ui/Loader";

const STATIC_URL = import.meta.env.VITE_STATIC_URL;

const Profile = () => {
  const { setUser } = useContext(AuthContext);
  const [user, setLocalUser] = useState(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [deleting, setDeleting] = useState(false); // ✅ loader for delete
  const navigate = useNavigate();
  const fileInputRef = useRef();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/users/me");
        setLocalUser(res.data);
        setName(res.data?.name || "");
      } catch {
        toast.error("Failed to load profile");
      }
    };
    load();
  }, []);

  const hasChanges = name !== (user?.name || "") || !!file;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || !hasChanges) return;

    setSaving(true);
    setJustSaved(false);

    try {
      const form = new FormData();
      form.append("name", name);

      if (file) {
        form.append("idVerification", file);
        // ✅ reset verification to pending on new upload
        form.append("forcePending", "true");
      }

      const res = await api.put("/users/me", form);
      setLocalUser(res.data);
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Profile updated");
      setFile(null);
      setJustSaved(true);
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast("ID photo removed");
  };

  const handleRemoveServerFile = async () => {
    setDeleting(true);
    try {
      await api.delete("/users/me/id-verification");
      const updated = { ...user, idVerification: null };
      setLocalUser(updated);
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      toast.success("ID document removed from profile");
    } catch {
      toast.error("Failed to remove ID");
    } finally {
      setDeleting(false);
    }
  };

  const handleChangePassword = () => {
    if (!user?.email) return toast.error("User email not found");
    navigate("/reset-password", {
      state: { email: user.email, mode: "profile" },
    });
  };

  if (!user) return <Spinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ccfbf1] to-[#fce7f3] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
        <h2 className="text-3xl font-bold text-[#0D9488] text-center flex items-center justify-center gap-2">
          <User size={28} /> My Profile
        </h2>

        {user.role === "admin" && (
          <div className="bg-teal-50 border border-[#0D9488] text-[#0D9488] text-sm p-3 rounded">
            You are an <strong>Admin</strong>. Manage hotels, rooms, offers, and
            analytics in the{" "}
            <Link to="/admin/dashboard" className="underline font-semibold">
              Admin Dashboard
            </Link>
            .
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-gray-300 px-4 py-2 rounded-md outline-none text-gray-700 caret-[#0D9488]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Email
            </label>
            <input
              value={user.email}
              readOnly
              type="email"
              className="w-full bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>

          {user.role !== "admin" && (
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                ID Verification
              </label>

              {/* ⚠️ Banner for re-upload */}
              <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 text-xs text-yellow-800 rounded">
                ⚠️ Uploading a new ID will reset your verification to{" "}
                <strong>pending</strong> until admin re-approves.
              </div>

              {user.idVerification?.documentUrl && (
                <div className="mb-3">
                  <img
                    src={`${STATIC_URL}${user.idVerification.documentUrl}`}
                    alt="ID"
                    className="max-h-64 w-auto object-contain rounded-md border border-gray-300 shadow-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Status: <strong>{user.idVerification.status}</strong> |
                    Method: <strong>{user.idVerification.method}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={handleRemoveServerFile}
                    disabled={deleting}
                    className="text-red-600 text-xs mt-2 hover:underline flex items-center gap-1"
                  >
                    {deleting ? <Loader className="w-20" /> : "❌ Remove from profile"}
                  </button>
                </div>
              )}

              <div className="flex gap-2 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="upload-id"
                />
                <label
                  htmlFor="upload-id"
                  className="flex items-center px-3 py-1.5 bg-[#0D9488] text-white rounded-md cursor-pointer hover:bg-[#0f766e] text-sm"
                >
                  <UploadCloud size={16} className="mr-2" />
                  {file ? "Change File" : "Upload ID"}
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-600 text-xs flex items-center hover:underline"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Remove
                  </button>
                )}
              </div>
              {file && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {file.name}
                </p>
              )}
            </div>
          )}

          <div className="text-sm text-gray-700 space-y-1">
            <p className="flex gap-3 items-center">
              <Coins className="w-5 h-5 text-yellow-500" />
              Loyalty Coins:{" "}
              <span className="inline-block bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-semibold">
                {user.loyaltyCoins || 0}
              </span>
            </p>
            <p className="flex gap-3 items-center">
              <BookHeartIcon className="w-5 h-5 text-red-500" />
              Favorites Saved: <strong>{user.favorites?.length || 0}</strong>
            </p>
          </div>

          <button
            type="submit"
            className={`w-full py-2 rounded-md text-white font-medium transition flex items-center justify-center ${
              saving
                ? "bg-[#0D9488]/70 cursor-wait"
                : !hasChanges
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#0D9488] hover:bg-[#0f766e]"
            }`}
          >
            {saving ? "Saving…" : justSaved ? "Saved" : "Save Changes"}
          </button>
        </form>

        <div className="pt-4 text-center">
          <button
            onClick={handleChangePassword}
            className="text-sm text-[#106a63] hover:underline flex items-center justify-center gap-2"
          >
            <Lock size={16} />
            Change / Reset Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

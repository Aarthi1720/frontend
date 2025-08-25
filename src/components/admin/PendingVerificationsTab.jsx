import React, { useEffect, useState } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import ConfirmModal from "../common/ConfirmModal";

const STATIC_URL = import.meta.env.VITE_STATIC_URL;

export default function PendingVerificationsTab() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState({ userId: null, action: "" });
  const limit = 6;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/id-verifications`, {
        params: { page, limit, status },
      });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error("Failed to load ID verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [status, page]);

  const requestAction = (userId, action) => {
    setConfirmData({ userId, action });
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    const { userId, action } = confirmData;
    try {
      setProcessingId(userId);
      const res = await api.post(`/admin/id-verifications/${userId}/${action}`);
      toast.success(res?.data?.message || `User ${action}d`);
      fetchUsers();
    } catch (err) {
      toast.error(`Failed to ${action} user`);
    } finally {
      setProcessingId(null);
      setShowConfirm(false);
      setConfirmData({ userId: null, action: "" });
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 p-4">
      {/* Filter & Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border-2 border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] text-gray-600"
        >
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>

        <div className="flex gap-2 items-center text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 border-2 border-gray-300 rounded disabled:opacity-50 transition"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2 py-1 border-2 border-gray-300 rounded disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        {loading ? (
          <p>Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500">No records found.</p>
        ) : (
          <table className="w-full border-2 border-gray-400 text-sm">
            <thead className="bg-gray-100">
              <tr>
                {["Name", "Email", "Status", "Uploaded", "ID", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="p-2 text-left border-b-2 border-b-gray-400 text-gray-700"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isDisabled =
                  user.idVerification?.status !== "pending" ||
                  processingId === user._id;
                return (
                  <tr
                    key={user._id}
                    className="border-t border-t-gray-400 text-gray-600"
                  >
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2 capitalize">
                      {user.idVerification?.status}
                    </td>
                    <td className="p-2">
                      {new Date(user.updatedAt).toLocaleString()}
                    </td>
                    <td className="p-2">
                      <img
                        src={`${STATIC_URL}${user.idVerification?.documentUrl}`}
                        alt="ID"
                        className="h-12 w-20 object-contain rounded cursor-pointer"
                        onClick={() =>
                          setSelectedImage(user.idVerification.documentUrl)
                        }
                      />
                    </td>
                    <td className="p-2 text-center space-x-1 flex ">
                      <button
                        onClick={() => requestAction(user._id, "approve")}
                        disabled={isDisabled}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs disabled:opacity-50 hover:bg-green-700 transition cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => requestAction(user._id, "reject")}
                        disabled={isDisabled}
                        className="px-2 py-1 bg-rose-500 text-white rounded text-xs disabled:opacity-50 hover:bg-rose-600 transition cursor-pointer"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden grid gap-4">
        {loading ? (
          <p>Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500">No records found.</p>
        ) : (
          users.map((user) => {
            const isDisabled =
              user.idVerification?.status !== "pending" ||
              processingId === user._id;
            return (
              <div
                key={user._id}
                className=" rounded border-2 border-gray-300 p-4 bg-white shadow-sm space-y-2"
              >
                <div className="text-[18px] font-semibold text-gray-600">
                  {user.name}
                </div>
                <div className="text-[16px] text-gray-500">{user.email}</div>
                <img
                  src={`${STATIC_URL}${user.idVerification?.documentUrl}`}
                  alt="ID"
                  className="max-h-64 w-auto object-contain mx-auto rounded cursor-pointer"
                  onClick={() =>
                    setSelectedImage(user.idVerification.documentUrl)
                  }
                />
                <p className="text-[16px] text-gray-600">
                  Status: {user.idVerification?.status}
                  <br />
                  Uploaded: {new Date(user.updatedAt).toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => requestAction(user._id, "approve")}
                    disabled={isDisabled}
                    className="flex-1 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => requestAction(user._id, "reject")}
                    disabled={isDisabled}
                    className="flex-1 py-1 bg-rose-500 text-white rounded hover:bg-rose-600 text-sm disabled:opacity-50 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Fullscreen Image Preview */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow max-w-lg w-full mx-4">
            <img
              src={`${STATIC_URL}${selectedImage}`}
              alt="Full Preview"
              className="w-full h-auto object-contain rounded"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="mt-4 text-sm text-rose-600 underline transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* Modal: Confirmation */}
      {showConfirm && (
        <ConfirmModal
          title={`Confirm ${
            confirmData.action === "approve" ? "Approval" : "Rejection"
          }`}
          message={`Are you sure you want to ${confirmData.action} this ID verification?`}
          onConfirm={handleConfirm}
          onCancel={() => {
            setShowConfirm(false);
            setConfirmData({ userId: null, action: "" });
          }}
        />
      )}
    </div>
  );
}

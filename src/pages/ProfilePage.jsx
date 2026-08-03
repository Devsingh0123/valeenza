import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userDeleteAccount, userProfile, userUpdate } from "../redux/slices/userAuthSlice";
import Loader from "@/components/common/Loader";
import { toast } from "react-toastify";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
} from "react-icons/fa";
import { ArrowLeft, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RiDeleteBinLine } from "react-icons/ri";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.userAuth);
  const navigate = useNavigate()

  // console.log(user)

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form data (without image)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    username: "",
  });

  // Image handling
  const [currentImageUrl, setCurrentImageUrl] = useState(null); // from server
  const [newImageBase64, setNewImageBase64] = useState(null); // base64 of new image

  // Fetch user profile if not already available
  useEffect(() => {
    if (!user) {
      dispatch(userProfile());
    }
  }, [dispatch, user]);

  // Populate form and image when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        username: user.username || "",
      });
      setCurrentImageUrl(user.profile_image || null);
      setNewImageBase64(null); // reset new image when user data changes
    }
  }, [user]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image selection: convert to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, etc.)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result; // e.g., "data:image/png;base64,iVB..."
      setNewImageBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Cancel editing: revert to original data
  const handleCancelEdit = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      username: user.username || "",
    });
    setNewImageBase64(null);
    setIsEditing(false);
  };

  // Submit updated profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      email: formData.email,
    };
    if (formData.mobile) payload.mobile = formData.mobile;
    if (formData.username) payload.username = formData.username;
    if (newImageBase64) payload.profile_image = newImageBase64; // send as base64

    try {
      await dispatch(userUpdate(payload)).unwrap();
      toast.success("Profile updated successfully");
      setIsEditing(false);
      // Refresh user profile to get updated data from server
      dispatch(userProfile());
      // Clear temporary image
      setNewImageBase64(null);
    } catch (err) {
      toast.error(err || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  // handle delete cccount
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await dispatch(userDeleteAccount()).unwrap();
      toast.success("Account deleted successfully");
      // Redirect to home page or login page after deletion
      navigate("/");
    } catch (err) {
      toast.error(err || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Loading / error states
  if (loading) return <Loader data="Loading profile..." />;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!user) return <div className="text-center py-10">No user data found</div>;

  // Determine which image to display (new image if selected, else current)
  const displayImage = newImageBase64 || currentImageUrl;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-amber-600 px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            {isEditing && (
              <button onClick={handleCancelEdit} className="text-white hover:text-amber-200 transition">
                <FaTimes />
              </button>
            )}
          </div>

          {/* Profile Content */}
          <div className="p-6 space-y-6">
            {!isEditing ? (
              // --- Display Mode ---
              <>
                <div className="flex items-center gap-4">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={user.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-amber-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                      <FaUserCircle className="w-12 h-12 text-amber-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {user.name}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Member since{" "}
                      {user.join_us}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-amber-600" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-800">{user.email}</p>
                    </div>
                  </div>
                  {user.mobile && (
                    <div className="flex items-center gap-3">
                      <FaPhoneAlt className="text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-500">Mobile</p>
                        <p className="text-gray-800">{user.mobile}</p>
                      </div>
                    </div>
                  )}
                  {user.username && (
                    <div className="flex items-center gap-3">
                      <FaUser className="text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-500">Username</p>
                        <p className="text-gray-800">{user.username}</p>
                      </div>
                    </div>
                  )}

                </div>

                {!isEditing && (
                  <div className="flex justify-end gap-3 border-t pt-6 mt-6">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition cursor-pointer"
                    >
                      <FaEdit /> Edit Profile
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
                    >
                      <RiDeleteBinLine className="w-4 h-4" /> Delete Account
                    </button>
                  </div>
                )}
              </>
            ) : (
              // --- Edit Mode ---
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Profile Picture */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt="Profile Preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-amber-500"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center">
                        <FaUserCircle className="w-16 h-16 text-amber-600" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-amber-600 rounded-full p-1 cursor-pointer hover:bg-amber-700">
                      <FaCamera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Click camera icon to change photo
                  </p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      "Saving..."
                    ) : (
                      <>
                        <FaSave /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}


          </div>


        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-md w-full mx-2">
             
              <p className="text-gray-600 mb-4">
                If you delete your account permanently, you will not be able to retrieve your current wallet balance. Do you still want to proceed?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        onClick={() => navigate('/')}
        className="flex items-center justify-center gap-2 text-amber-600  mt-4 hover:underline mb-6 text-center cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 text-center" /> Back to Home
      </div>


    </div>
  );
};

export default ProfilePage;
import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import SideBar from "../../Components/Side Bar/SideBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./Feed.css";
import API_BASE_URL from "../../API/apiConfig";

function Feed() {
    const navigate = useNavigate();
    const [uploadedImages, setUploadedImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [deletedImages, setDeletedImages] = useState([]);
    const [notification, setNotification] = useState({ message: "", type: "" });

    const token = localStorage.getItem("token"); // Retrieve JWT token from local storage

    // Fetch submitted images from the database
    useEffect(() => {
        const fetchUserImages = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}get-user-images`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.success) {
                    const fetchedImages = response.data.images.flatMap((item) =>
                        [item.image1, item.image2, item.image3, item.image4, item.image5].filter(Boolean)
                    ).map((path) => ({
                        url: `${API_BASE_URL.replace(/api\/$/, '')}${path}`,
                    }));

                    setUploadedImages(fetchedImages);
                    if (fetchedImages.length > 0) {
                        setSelectedImage(fetchedImages[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching user images:", error);
            }
        };

        fetchUserImages();
    }, []);

    const onDrop = (acceptedFiles) => {
        const newFiles = acceptedFiles.slice(0, 5 - uploadedImages.length);
        const previewFiles = newFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        const updatedImages = [
            ...previewFiles,
            ...uploadedImages.slice(0, 5 - previewFiles.length)
        ].slice(0, 5);

        setUploadedImages(updatedImages);
        if (!selectedImage && updatedImages.length > 0) {
            setSelectedImage(updatedImages[0]);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: "image/*",
        multiple: true,
    });

    const removeImage = async (index) => {
        const removedImage = uploadedImages[index];
    
        if (removedImage.url) {
            try {
                await axios.delete(`${API_BASE_URL}delete-user-image`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    data: {
                        image_url: removedImage.url,
                    },
                });
    
                setNotification({ message: "Image deleted successfully!", type: "success" });
            } catch (error) {
                setNotification({ message: "Failed to delete the image.", type: "error" });
            }
        }
    
        // Update UI
        const updatedImages = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(updatedImages);
        if (selectedImage === uploadedImages[index]) {
            setSelectedImage(updatedImages[0] || null);
        }
    };

    const handleImageUpload = async () => {
        setIsUploading(true);
        const formData = new FormData();

        uploadedImages.forEach((image) => {
            if (image.file) {
                formData.append("images[]", image.file);
            } else if (image.url && !deletedImages.includes(image.url)) {
                formData.append("existing_images[]", image.url);
            }
        });

        formData.append("deleted_images", JSON.stringify(deletedImages));
        formData.append("hotel_id", 1);

        try {
            const response = await axios.post(`${API_BASE_URL}upload-images`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            setNotification({ message: "Images updated successfully!", type: "success" });

            setDeletedImages([]);

            const updatedResponse = await axios.get(`${API_BASE_URL}get-user-images`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (updatedResponse.data.success) {
                const fetchedImages = updatedResponse.data.images.map((item) => ({
                    url: `${API_BASE_URL.replace(/api\/$/, '')}${item.image1}`,
                }));

                setUploadedImages(fetchedImages);
                if (fetchedImages.length > 0) {
                    setSelectedImage(fetchedImages[0]);
                }
            }
        } catch (error) {
            if (error.response) {
                const errorMessage =
                    error.response.data.error || "Something went wrong while uploading images.";
                setNotification({ message: errorMessage, type: "error" });
            } else {
                setNotification({ message: "Network error. Please try again.", type: "error" });
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="d-flex">
            <SideBar />
            <div className="flex-grow-1 p-3 mt-3 feed-container">
                <h2 className="text-center">Feed</h2>
                {notification.message && (
                    <div className={`notification ${notification.type}`}>
                        <span>{notification.message}</span>
                        <button
                            className="close-button"
                            onClick={() => setNotification({ message: "", type: "" })}
                        >
                            &times;
                        </button>
                    </div>
                )}
                <div className="dropzone-container">
                    <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
                        <input {...getInputProps()} />
                        <p>{isDragActive ? "Drop the images here..." : "Drag and drop up to 5 images, or click to browse"}</p>
                    </div>

                    {uploadedImages.length > 0 && (
                        <div className="image-preview-container">
                            <div className="thumbnails">
                                {uploadedImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail ${selectedImage === image ? "selected" : ""}`}
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        <img
                                            src={image.url || image.preview}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="thumbnail-image"
                                        />
                                        <button
                                            className="remove-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeImage(index);
                                            }}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="main-image-container">
                                {selectedImage && (
                                    <img
                                        src={selectedImage.url || selectedImage.preview}
                                        alt="Selected"
                                        className="main-image"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <button
                    className={`btn btn-primary ${isUploading ? "disabled" : ""}`}
                    onClick={handleImageUpload}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <span className="d-flex align-items-center gap-2">
                            <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                            ></span>
                            Uploading...
                        </span>
                    ) : (
                        "Upload Images"
                    )}
                </button>
            </div>
        </div>
    );
}

export default Feed;

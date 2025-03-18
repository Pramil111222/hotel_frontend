import { useState, useEffect } from "react";
import axios from "axios"; 
import Swal from "sweetalert2"; 
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../API/apiConfig";
import "./Facilities.css";


function RoomFormModel({ showModal, closeModal, onSave, roomToEdit }) {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        roomName: "", roomType: "", ac_non_ac: "", facilities: [], userId: "", room_number: "",
        room_description: "",
    });
    const [facilitiesList, setFacilitiesList] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/"); 
        }
    }, [navigate]);

    // Fetch user data on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            axios.get(`${API_BASE_URL}user`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                const { user } = response.data;
                setUserData({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                });
            })
            .catch((error) => {
                console.error("Error fetching user data", error);
                setError("Failed to load user data. Please try again.");
            });
        }
    }, []);

    // Update formData when userData changes
    useEffect(() => {
        if (userData) {
            setFormData((prevData) => ({
                ...prevData,
                userId: userData.id,
            }));
        }
    }, [userData]);

    // Fetch facilities list
    useEffect(() => {
        axios
            .get(`${API_BASE_URL}facilities`)
            .then((response) => {
                setFacilitiesList(response.data.map((facility) => ({
                    id: facility.id,
                    name: facility.name,
                })));
            })
            .catch((error) => {
                console.error("Error fetching facilities:", error);
                setError("Failed to load facilities. Please try again.");
            });
    }, [roomToEdit]); // This ensures facilities are fetched again when roomToEdit changes
    

    // Set room data when roomToEdit changes
    useEffect(() => {
        if (roomToEdit) {
            let selectedFacilities = [];
            
            // Ensure facilities are properly parsed
            if (typeof roomToEdit.facilities === "string") {
                try {
                    selectedFacilities = JSON.parse(roomToEdit.facilities); // Convert string to array
                } catch (error) {
                    console.error("Error parsing facilities:", error);
                    selectedFacilities = [];
                }
            } else if (Array.isArray(roomToEdit.facilities)) {
                selectedFacilities = roomToEdit.facilities;
            }
    
            setFormData({
                roomName: roomToEdit.room_name || "",
                roomType: roomToEdit.room_type || "",
                ac_non_ac: Number(roomToEdit.ac_non_ac) || 0,
                room_number: roomToEdit.room_number || "",
                room_description: roomToEdit.room_description || "",
                facilities: selectedFacilities.map(String), // Ensure IDs are strings
                userId: roomToEdit.userId || "",
            });
        }
    }, [roomToEdit]);
    

    const handleFacilityChange = (facilityId) => {
        setFormData((prevData) => {
            const currentFacilities = Array.isArray(prevData.facilities) ? prevData.facilities : [];
    
            // Toggle facility selection
            const updatedFacilities = currentFacilities.includes(facilityId)
                ? currentFacilities.filter((id) => id !== facilityId)  // Remove if already selected
                : [...currentFacilities, facilityId];  // Add if not selected
    
            return { ...prevData, facilities: updatedFacilities };
        });
    };
    
    
    

    // Handle form input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: name === "ac_non_ac" ? Number(value) : value, // Ensure AC/Non-AC is treated as number
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Ensure facilities is always treated as an array
        const facilitiesArray = Array.isArray(formData.facilities) ? formData.facilities : [];
    
        const formattedFacilities = facilitiesArray.map((facilityId) => String(facilityId));
    
        const dataToSend = {
            ...formData,
            facilities: formattedFacilities,
            ac_non_ac: formData.ac_non_ac,
        };
    
        try {
            if (roomToEdit) {
                // If editing, update the existing room
                await axios.put(`${API_BASE_URL}rooms_edit_update/${roomToEdit.id}`, dataToSend);
                Swal.fire({
                    title: "Success!",
                    text: "Room updated successfully.",
                    icon: "success",
                    confirmButtonText: "OK",
                });
            } else {
                // If creating a new room
                await axios.post(`${API_BASE_URL}rooms`, dataToSend);
                Swal.fire({
                    title: "Success!",
                    text: "Room added successfully.",
                    icon: "success",
                    confirmButtonText: "OK",
                });
            }
            if (onSave) onSave();
            closeModal();
        } catch (err) {
            console.error("Error saving room:", err);
            setError(err.response?.data?.message || "An error occurred while saving the room.");
            Swal.fire({
                title: "Error",
                text: err.response?.data?.message || "An error occurred. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };
    
    
    
    

    // Confirm before closing the modal
    const confirmClose = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "Unsaved changes will be lost!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#007bff",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, close it!",
        }).then((result) => {
            if (result.isConfirmed) {
                closeModal();
            }
        });
    };

    if (!showModal) return null;

    if (!userData) {
        return <div>Loading user data...</div>;
    }

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "5%", zIndex: 1000,
            backdropFilter: "blur(8px)",
        }}>
            <div className="p-3" style={{
                background: "#ffffff", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                width: "100%", maxWidth: "800px", padding: "20px", maxHeight: "80vh", overflowY: "auto",
            }}>
                <h4>{roomToEdit ? "Update Room" : "Add New Room"}</h4>
                {error && <div className="text-danger">{error}</div>}
                <form onSubmit={handleSubmit} className="mt-2">
                    <div className="form-group">
                        <label htmlFor="room_number">Room Number</label>
                        <input type="text" className="form-control" id="room_number" name="room_number" value={formData.room_number} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="roomName">Room Name</label>
                        <input type="text" className="form-control" id="roomName" name="roomName" value={formData.roomName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="room_description">Room Description</label>
                        <input type="text" className="form-control" id="room_description" name="room_description" value={formData.room_description} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="roomType">Room Type</label>
                        <select className="form-control" name="roomType" value={formData.roomType} onChange={handleChange} required>
                            <option value="">Select Room Type</option>
                            <option value="Single">Single</option>
                            <option value="Double">Double</option>
                            <option value="Suite">Suite</option>
                            <option value="Deluxe">Deluxe</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="ac_non_ac">AC/Non-AC</label>
                        <select className="form-control" name="ac_non_ac" value={formData.ac_non_ac} onChange={handleChange} required>
                            <option value={0}>Non-AC</option>
                            <option value={1}>AC</option>
                        </select>

                    </div>
                    <div className="form-group">
    <label>Room Facilities</label>
    <div className="facilities-cards">
        {facilitiesList.map((facility) => {
            const isSelected = formData.facilities.includes(String(facility.id)); // Ensure ID comparison works
            const facilityName = facility.name.length > 20 
                ? facility.name.substring(0, 20) + "..." 
                : facility.name;

            return (
                <div
                    key={facility.id}
                    className={`facility-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleFacilityChange(String(facility.id))}
                    style={{
                        display: "inline-block",
                        padding: "5px 10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        cursor: "pointer",
                        backgroundColor: isSelected ? "#007bff" : "#f8f9fa",
                        color: isSelected ? "#fff" : "#000",
                        fontSize: "13px", // Reduce font size
                    }}
                >
                    {facilityName}
                </div>
            );
        })}
    </div>
</div>


                    <div className="modal-footer gap-2">
                        <button type="button" className="btn" style={{ backgroundColor: "red", color: "white", padding: "10px 20px", borderRadius: "5px" }} onClick={confirmClose}>
                            Close
                        </button>
                        <button type="submit" className="btn" style={{ backgroundColor: "yellow", color: "black", padding: "10px 20px", borderRadius: "5px" }}>
                            {roomToEdit ? "Update" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RoomFormModel;


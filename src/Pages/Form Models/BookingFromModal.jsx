import { useState, useEffect } from "react";
import Swal from "sweetalert2"; // Import SweetAlert
import API_BASE_URL from '../../API/apiConfig';

function BookingFromModal({ showModal, closeModal, onSave, booking }) {
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        cusName: "",
        cusNic: "",
        cusEmail: "",
        cusTp: "",
        checkIn: "",
        checkOut: "",
        room: "",
        pkgType: "",
        note: "",
        advance_amount: "",  // Include advance_amount in form data
    });
    const [rooms, setRooms] = useState([]); // State to store room data
    const [packages, setPackages] = useState([]); // State to store package data

    useEffect(() => {
        // Fetch rooms data when the component mounts
        const fetchRooms = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}rooms_booking`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    }
                });
                const data = await response.json();
                setRooms(data); // Set rooms data into state
            } catch (err) {
                console.error("Error fetching rooms:", err);
                setError("Failed to load room data.");
            }
        };

        // Fetch package data when the component mounts
        const fetchPackages = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}rooms_package`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    }
                });
                const data = await response.json();
                setPackages(data); // Set package data into state
            } catch (err) {
                console.error("Error fetching packages:", err);
                setError("Failed to load package data.");
            }
        };

        fetchRooms();
        fetchPackages();
    }, []); // Only run once when the component mounts

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Convert dates to JavaScript Date objects
        const checkInDate = new Date(formData.checkIn);
        const checkOutDate = new Date(formData.checkOut);

        // Check if checkOut is after checkIn
        if (checkOutDate <= checkInDate) {
            Swal.fire({
                icon: "error",
                title: "Invalid Dates",
                text: "Check-out date must be after check-in date!",
            });
            return;
        }

        try {
            const token = localStorage.getItem('token'); // Retrieve the JWT token from local storage
            const response = await fetch(`${API_BASE_URL}bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // Include the JWT token in the headers
                },
                body: JSON.stringify({
                    cus_name: formData.cusName,
                    cus_nic: formData.cusNic,
                    cus_email: formData.cusEmail,
                    cus_tp: formData.cusTp,
                    check_in: formData.checkIn,
                    check_out: formData.checkOut,
                    room: formData.room,
                    room_name: formData.room, // Assuming room_name is the same as room
                    pkg_type: formData.pkgType,
                    note: formData.note,
                    advance_amount: formData.advance_amount, // Send advance_amount to the API
                }),
            });

            const data = await response.json();
            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Booking saved successfully!",
                });

                onSave(); // Call the function to refresh data
                closeModal(); // Close the modal
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error!",
                    text: data.message || "Something went wrong!",
                });
            }
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: err.message || "Something went wrong!",
            });
        }
    };

    if (!showModal) return null;

    return (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", zIndex: 1000, backdropFilter: "blur(8px)", overflowY: "auto", }} >
            <div style={{ background: "#ffffff", borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", width: "100%", maxWidth: "800px", padding: "20px", boxSizing: "border-box", maxHeight: "90vh", overflowY: "auto", }} >
                <h4>{booking ? 'Update Room' : 'Add New Booking'}</h4>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className='mt-2'>
                    <div className='row'>
                        <div className="col-md-6 form-group">
                            <label htmlFor="cusName">Customer Name <span>*</span></label>
                            <input type="text" className="form-control" id="cusName" name='cusName' value={formData.cusName} onChange={handleChange} placeholder="Enter customer name" />
                        </div>
                        <div className="col-md-6 form-group">
                            <label htmlFor="cusNic">Customer NIC <span>*</span></label>
                            <input type="text" className="form-control" id="cusNic" name='cusNic' value={formData.cusNic} onChange={handleChange} placeholder="Enter customer NIC" />
                        </div>
                    </div>

                    <div className='row'>
                        <div className="col-md-6 form-group">
                            <label htmlFor="cusEmail">Customer Email <span>(optional)</span></label>
                            <input type="text" className="form-control" id="cusEmail" name='cusEmail' value={formData.cusEmail} onChange={handleChange} placeholder="Enter customer email" />
                        </div>

                        <div className="col-md-6 form-group">
                            <label htmlFor="cusTp">Customer Mobile Number <span>*</span></label>
                            <input type="text" className="form-control" id="cusTp" name='cusTp' value={formData.cusTp} onChange={handleChange} placeholder="Enter customer mobile number" />
                        </div>
                    </div>

                    <div className='row'>
                        <div className="col-md-6 form-group">
                            <label htmlFor="checkIn">Check In Date <span>*</span></label>
                            <input type="datetime-local" className="form-control" id="checkIn" name='checkIn' value={formData.checkIn} onChange={handleChange} placeholder="Select check-in date" />
                        </div>

                        <div className="col-md-6 form-group">
                            <label htmlFor="checkOut">Check Out Date <span>*</span></label>
                            <input type="datetime-local" className="form-control" id="checkOut" name='checkOut' value={formData.checkOut} onChange={handleChange} placeholder="Select check-out date" />
                        </div>
                    </div>

                    <div className='row'>
                        <div className="col-md-6 form-group">
                            <label htmlFor="room">Room <span>*</span></label>
                            <select className="form-control" name="room" value={formData.room} onChange={handleChange} required>
                                <option value="">Select Room Type</option>
                                {rooms.length > 0 ? (
                                    rooms.map((room) => (
                                        <option key={room.id} value={room.id}>{room.room_number}</option>
                                    ))
                                ) : (
                                    <option value="">No Room Available</option>
                                )}
                            </select>
                        </div>

                        <div className="col-md-6 form-group">
                            <label htmlFor="pkgType">Package</label>
                            <select className="form-control" name="pkgType" id="pkgType" value={formData.pkgType} onChange={handleChange} required>
                                <option value="">Select Package Type</option>
                                {packages.length > 0 ? (
                                    packages.map((pkg) => (
                                        <option key={pkg.id} value={pkg.id}>{pkg.package_name} - Rs:{pkg.price}</option>
                                    ))
                                ) : (
                                    <option value="">No Packages Available</option>
                                )}
                            </select>
                        </div>
                    </div>


                    <div className="row">
                        <div className="col-md-6 form-group">
                            <label htmlFor="advance_amount">Advanced Amount</label>
                            <input type="number" className="form-control" name="advance_amount" id="advance_amount" value={formData.advance_amount} onChange={handleChange} placeholder="Enter advanced amount" />
                        </div>

                        <div className="col-md-6 form-group">
                            <label htmlFor="note">Description/Notes</label>
                            <textarea className="form-control" name="note" id="note" value={formData.note} onChange={handleChange} placeholder="Enter description or notes" />
                        </div>
                    </div>

                    <div className="modal-footer" style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                        <button
                            type="button"
                            className="btn"
                            style={{ backgroundColor: "red", color: "white", padding: "10px 20px", borderRadius: "5px", }} onClick={closeModal} >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="btn"
                            style={{ backgroundColor: "yellow", color: "black", padding: "10px 20px", borderRadius: "5px", }} >
                            {booking ? 'Update Booking' : 'Add Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BookingFromModal;

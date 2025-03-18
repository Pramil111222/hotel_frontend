import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import SideBar from "../../Components/Side Bar/SideBar";
import BookingFromModal from "../Form Models/BookingFromModal";
import DateEventModal from "../Form Models/DateEventModal";
import "./Bookings.css";
import API_BASE_URL from "../../API/apiConfig";
import axios from "axios";

function Bookings() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [dateEvents, setDateEvents] = useState([]);
    const [events, setEvents] = useState([]);

    // Function to get the JWT token from localStorage
    const getToken = () => {
        return localStorage.getItem('token'); // Retrieve the token from localStorage
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = getToken(); // Get the token
            const response = await axios.get(`${API_BASE_URL}bookings_data`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the headers
                },
            });
            console.log("API Data:", response.data); // Debugging log

            const formattedEvents = response.data.map(booking => ({
                title: booking.cus_name,
                start: booking.check_in,
                end: booking.check_out,
            }));

            console.log("Formatted Events:", formattedEvents); // Debugging log
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const handleDateClick = async (info) => {
        const clickedDate = info.dateStr;

        try {
            const token = getToken(); // Get the token
            const response = await axios.get(`${API_BASE_URL}bookings_data?date=${clickedDate}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the headers
                },
            });
            const data = response.data;

            if (response.status === 200) {
                setSelectedDate(clickedDate);
                setDateEvents(data);
                setShowDateModal(true);
            } else {
                console.error('Failed to fetch bookings:', data);
                setDateEvents([]);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setDateEvents([]);
        }
    };

    return (
        <div className="d-flex">
            <SideBar />
            <div className="flex-grow-1 p-4 calendar-container">
                <div className="row mb-2">
                    <div className="col-md-6">
                        <h4>Booking</h4>
                    </div>
                    <div className="col-md-6 d-flex justify-content-end">
                        <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>
                            Add New Booking
                        </button>
                    </div>
                </div>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    weekends={true}
                    events={events}
                    editable={true}
                    selectable={true}
                    dateClick={handleDateClick}
                    height={"85vh"}
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
                    }}
                />
                <BookingFromModal
                    showModal={showEditModal}
                    closeModal={() => setShowEditModal(false)}
                    onSave={fetchBookings}
                />
                <DateEventModal
                    show={showDateModal}
                    selectedDate={selectedDate}
                    events={dateEvents.length > 0 ? dateEvents : [{ cus_name: "No bookings available" }]}
                    onClose={() => setShowDateModal(false)}
                />
            </div>
        </div>
    );
}

export default Bookings;
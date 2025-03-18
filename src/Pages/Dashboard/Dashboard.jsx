import SideBar from "../../Components/Side Bar/SideBar";
import SecOne from "./Dashboard Sections/SecOne";
import SecTwo from "./Dashboard Sections/SecTwo";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../API/apiConfig";

function Dashboard() {
    const navigate = useNavigate();
    const [totalRooms, setTotalRooms] = useState(0);
    const [totalPackages, setTotalPackages] = useState(0);
    const [totalBookings, setTotalBookings] = useState(0);
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}dashboarddata`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    localStorage.removeItem("token");
                    navigate("/");
                    return;
                }

                const data = await response.json();
                setTotalRooms(data.totalRooms);
                setTotalPackages(data.totalPackages);
                setTotalBookings(data.totalBookings);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        const fetchMonthlyBookings = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}monthly-bookings`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
        
                if (!response.ok) {
                    return;
                }
        
                const data = await response.json();
        
                // Define all months with default values as 0
                const allMonths = [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
        
                // Create a default dataset with zero values
                const defaultData = allMonths.map((month, index) => ({
                    month,
                    year: new Date().getFullYear(),
                    bookings: 0,
                    revenue: 0,
                    expenses: 0,
                    profit: 0
                }));
        
                // If API returns data, update the default dataset with actual values
                const formattedData = defaultData.map(defaultItem => {
                    const foundItem = data.find(item => 
                        new Date(item.year, item.month - 1).toLocaleString('en-US', { month: 'long' }) === defaultItem.month
                    );
        
                    return foundItem ? {
                        month: defaultItem.month,
                        year: foundItem.year,
                        bookings: foundItem.bookings,
                        revenue: foundItem.revenue,
                        expenses: foundItem.expenses,
                        profit: foundItem.profit
                    } : defaultItem;
                });
        
                setMonthlyData(formattedData);
            } catch (error) {
                console.error("Error fetching monthly bookings:", error);
            }
        };
        

        fetchDashboardData();
        fetchMonthlyBookings();
    }, [navigate]);

    return (
        <div className="d-flex">
            <SideBar />
            <div className="flex-grow-1 p-3">
                <h2 style={{ paddingLeft: "50px" }}>Dashboard</h2>

                <div className="row mt-3">
                    <div className="col-md-12">
                        <SecOne
                            totalUsers={totalBookings}
                            totalBookings={totalRooms}
                            totalHotels={totalPackages}
                        />
                    </div>
                </div>

                <div className="row mt-5">
                    <div className="col-md-16">
                        <SecTwo monthlyData={monthlyData} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

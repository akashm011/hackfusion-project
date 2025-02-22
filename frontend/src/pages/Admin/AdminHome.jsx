import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import AdminDashboard from "../../components/Admin-Comp/AdminDashboard";
import AdminUsers from "../../components/Admin-Comp/AdminUsers";
import AdminElectionsManage from "./AdminElectionManage";
import AdminApprovals from "../../components/Admin-Comp/AdminApprovals";
import AdminSettings from "../../components/Admin-Comp/AdminSettings";
import AdminManageBookings from "../../components/Admin-Comp/AdminManageBookings";
import AdminComplaints from "../../components/Admin-Comp/AdminComplaints";

import ManageApplication from "../../components/ManageApplication";
import BudgetComponent from "../../components/Budget";
import ManageBudget from "../../components/Admin-Comp/ManageApproval";

function AdminHome() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const lastPart = location.pathname.split("/").pop();

  let ContentComponent;
  switch (lastPart) {
    case "dashboard":
      ContentComponent = <AdminDashboard />;
      break;
    case "complaints":
      ContentComponent = <AdminComplaints />;
      break;
    case "users":
      ContentComponent = <AdminUsers />;
      break;
    case "elections":
      ContentComponent = <AdminElectionsManage />;
      break;
    case "bookings":
      ContentComponent = <AdminManageBookings />;
      break;
    // case "approvals":
    //   ContentComponent = <AdminApprovals />;
    //   break;
    case "application":
      ContentComponent = <ManageApplication />;
      break;
     case "budget":
        ContentComponent=<BudgetComponent/>
        break;
    case "approvals":
      ContentComponent=<ManageBudget/>
      break;
    case "settings":
      ContentComponent = <AdminSettings />;
      break;
    default:
      ContentComponent = <AdminDashboard />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar for Admin */}
      <Sidebar role="Admin" isOpen={isSidebarOpen} />

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col bg-gradient-to-r from-blue-50 via-blue-30 to-blue-20"
        style={{
          marginLeft: isSidebarOpen ? "250px" : "0px",
          width: `calc(100% - ${isSidebarOpen ? "250px" : "0px"})`,
        }}
      >
        {/* Navbar */}
        <Navbar
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          userName="Admin"
        />

        {/* Main Section with Dynamic Content */}
        <div
          className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-8"
          style={{
            height: `calc(100vh - 60px)`,
          }}
        >
          <div className="container mx-auto px-20 py-10">
            {ContentComponent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;

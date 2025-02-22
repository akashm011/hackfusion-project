import { useState, useEffect, useMemo } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/budgets/all";

export default function ManageBudget() {
  const [userRole] = useState("faculty");
  const canReview = userRole === "faculty" || userRole === "admin";
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Updated Handle Approve/Reject Action
  const handleAction = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.put(
        "http://localhost:3000/api/budgets/update-status",
        { 
          id: id,
          status: status 
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );

      // Update local state
      setData((prev) =>
        prev.map((budget) =>
          budget._id === id ? { ...budget, status } : budget
        )
      );

      // Clear any existing errors
      setError(null);
    } catch (error) {
      console.error(`Failed to update budget status:`, error);
      setError(`Failed to ${status} budget request. Please try again.`);
    }
  };

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(response);
        

        if (response.data && response.data.data) {
          setData(response.data.data);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching budgets:", error);
        setError("Failed to fetch budget data. Please try again later.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  // Rest of the component remains the same...
  const stats = useMemo(() => {
    return {
      pending: data.filter((budget) => budget.status === "pending").length,
      approved: data.filter((budget) => budget.status === "approved").length,
      rejected: data.filter((budget) => budget.status === "rejected").length,
      highAmount: data.filter((budget) => budget.amount >= 100000).length,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading budget data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Budget Approvals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Pending Approvals", count: stats.pending, color: "text-yellow-500" },
          { title: "Approved", count: stats.approved, color: "text-green-500" },
          { title: "Rejected", count: stats.rejected, color: "text-red-500" },
          { title: "High Budget Requests", count: stats.highAmount, color: "text-orange-500" },
        ].map((stat, index) => (
          <div key={index} className="p-4 bg-white shadow rounded-lg">
            <h2 className="text-lg font-semibold mb-2">{stat.title}</h2>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Budget Requests</h2>
        {data.length === 0 ? (
          <div className="text-center py-4">No budget requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                    
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Category</th>
                  <th className="p-2 border">Amount (₹)</th>
                  <th className="p-2 border">Created By</th>
                  <th className="p-2 border">Status</th>
                  {canReview && <th className="p-2 border">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((budget) => (
                  <tr key={budget._id} className="border">
                    <td className="p-2 border capitalize">{budget.title}</td>
                    <td className="p-2 border capitalize">{budget.category}</td>
                    <td className={`p-2 border font-semibold ${budget.amount >= 100000 ? "text-red-500" : ""}`}>
                      ₹{budget.amount.toLocaleString()}
                    </td>
                    <td className="p-2 border">{`${budget.allocatedByModel} -(${budget.allocated_by.name})`}</td>
                    <td className="p-2 border">
                      <span
                        className={`px-3 py-1 rounded font-semibold ${
                          budget.status === "approved"
                            ? "bg-green-200 text-green-800"
                            : budget.status === "rejected"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                      </span>
                    </td>
                    {canReview && (
                      <td className="p-2 border text-center">
                        {budget.status === "pending" ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleAction(budget._id, "approved")}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(budget._id, "rejected")}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded font-semibold ${
                              budget.status === "approved"
                                ? "bg-green-200 text-green-800"
                                : "bg-red-200 text-red-800"
                            }`}
                          >
                            {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, SortDesc, Plus, Trash2 } from "lucide-react";
import AddRecordForm from "./Faculty-Comp/AddRecordForm";
import DeleteConfirmation from "./Faculty-Comp/DeleteConfirmation";

const ReportCheating = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [records, setRecords] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/cheating/all"
      );
      setRecords(response.data);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;

    

    try {
      const tok = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/api/cheating/delete/${recordToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${tok}` },
        }
      );

      await fetchRecords(); // Refetch records to ensure data freshness
      setRecordToDelete(null);
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const uniqueExams = Array.from(
    new Set(records.map((record) => record.examName))
  );

  const filteredData = records
    .filter(
      (record) =>
        (record.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.examName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedExam === "" || record.examName === selectedExam)
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {role === "faculty" && (
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add New Record
            </button>
          </div>
        )}

        {showAddForm && role === "faculty" && (
          <AddRecordForm
            onClose={() => setShowAddForm(false)}
            onSubmit={fetchRecords}
          />
          
        )}

        {recordToDelete && role === "faculty" && (
          <DeleteConfirmation
            registrationNumber={recordToDelete.student.registrationNumber} // Corrected path
            onClose={() => setRecordToDelete(null)}
            onConfirm={handleDelete} // Corrected handler
          />
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by Student Name or Exam Name"
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="">All Exams</option>
              {uniqueExams.map((exam) => (
                <option key={exam} value={exam}>
                  {exam}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <SortDesc className="h-5 w-5" />
              {sortOrder === "asc" ? "Oldest" : "Latest"}
            </button>
          </div>
        </div>

        <div className="w-full bg-white shadow rounded-lg">
          <div className="w-full">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-1/5 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase truncate">
                    Student Name
                  </th>
                  <th className="w-1/5 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase truncate">
                    Exam Name
                  </th>
                  <th className="w-1/5 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase truncate">
                    Reason
                  </th>
                  <th className="w-1/5 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase truncate">
                    Reported By
                  </th>
                  <th className="w-1/5 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase truncate">
                    Date
                  </th>
                  {role === "faculty" && (
                    <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase truncate">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900 truncate">
                      {record.student.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 truncate">
                      {record.examName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <p className="">
                        {record.reason}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 truncate">
                      {record.reportedBy.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 truncate">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    {role === "faculty" && (
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <button
                          onClick={() => setRecordToDelete(record)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCheating;

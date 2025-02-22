import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Default import

const API_URL = "http://localhost:3000/api/budgets/all";
const API_URL_ID = "http://localhost:3000/api/budgets/";
const API_URL_ADD = "http://localhost:3000/api/budgets/add";

function ErrorMessage({ message }) {
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
      role="alert"
    >
      <p>{message}</p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

function BudgetForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title:"To",
    category: "event",
    amount: "",
    allocated_by: {
      model: "Faculty", // Changed to match backend expectation
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken?.id;
      const userRole = decodedToken?.role;

      if (!userId) throw new Error("User ID not found in token");
      if (userRole !== "faculty") throw new Error("Only faculty members can allocate a budget.");

  
      // const decodedToken = jwtDecode(token);
      // console.log("Decoded Token:", decodedToken); // Debugging step
  
      // const userId = decodedToken?.studentId;  // Extracting correct field
      // if (!userId) {
      //   throw new Error("User ID not found in token");
      // }
  
      const submitData = {
        title:formData.title,
        category: formData.category,
        amount: Number(formData.amount),
        allocated_by: userId, 
        allocatedByModel: formData.allocated_by.model,
      };
  
      const response = await axios.post(API_URL_ADD, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });
  
      if (response.data.success) {
        onSubmit(response.data.data);
        setFormData({
          title:"To",
          category: "event",
          amount: "",
          allocated_by: { model: "Faculty" },
        });
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to create budget");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Create New Budget</h2>
        {error && <ErrorMessage message={error} />}
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter Title"
              value={formData.title}
          
              
              disabled={isSubmitting}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              className="w-full p-2 border rounded"
              value={formData.category}
              required
              disabled={isSubmitting}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="event">Event</option>
              <option value="department">Department</option>
              <option value="mess">Mess</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              placeholder="Enter amount"
              value={formData.amount}
              required
              min="0"
              disabled={isSubmitting}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allocated By
            </label>
            <select
              className="w-full p-2 border rounded"
              value={formData.allocated_by.model}
              required
              disabled={isSubmitting}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  allocated_by: {
                    ...formData.allocated_by,
                    model: e.target.value,
                  },
                })
              }
            >
              <option value="Faculty">Faculty</option>
              <option value="Student">Student</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExpenseTable({ expenses, isLoading, error }) {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="mt-4 p-4 border rounded">
      <h3 className="text-lg font-bold mb-2">Expense Log</h3>
      {!expenses || expenses.length === 0 ? (
        <p className="text-gray-600">No expenses found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Date</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Proof</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id} className="border hover:bg-gray-50">
                <td className="border p-2">
                  {new Date(expense.spent_at).toLocaleDateString()}
                </td>
                <td className="border p-2">{expense.description}</td>
                <td className="border p-2">
                  ₹
                  {expense?.amount_spent
                    ? expense.amount_spent.toFixed(2)
                    : "0.00"}
                </td>
                
                <td className="border p-2">
                  {expense.proofUrl ? (
                    <a
                      href={expense.proofUrl}
                      className="text-blue-600 hover:underline flex items-center justify-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">No proof</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function BudgetComponent() {
  const [budgets, setBudgets] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [expenses, setExpenses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expensesError, setExpensesError] = useState(null);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
 

  const fetchBudgets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });

      if (response.data.success) {
        setBudgets(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch budgets");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch budgets";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    async function fetchExpenses(budgetId) {
      setIsLoadingExpenses(true);
      setExpensesError(null);

      try {
        if (!budgetId) return;

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        console.log(`Fetching expenses for budget ID: ${budgetId}`);

        const response = await axios.get(`${API_URL_ID}${budgetId}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        });

        console.log("API Full Response:", response.data);

        const expensesData = response.data?.data?.expenses;
        if (!Array.isArray(expensesData)) {
          throw new Error("Expenses not found in response");
        }

        setExpenses((prev) => ({
          ...prev,
          [budgetId]: expensesData,
        }));
      } catch (error) {
        console.error(
          "Error fetching expenses:",
          error.response?.data || error.message
        );
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch expenses";
        setExpensesError(errorMessage);
      } finally {
        setIsLoadingExpenses(false);
      }
    }

    if (selectedBudget?._id) {
      fetchExpenses(selectedBudget._id);
    }
  }, [selectedBudget]);

  const handleCreateBudget = (newBudget) => {
    setBudgets((prev) => [...prev, newBudget]);
    setIsBudgetDialogOpen(false);
    fetchBudgets(); // Refresh the budgets list after creating a new one
  };

  const handleAddExpense = async (budgetId, newExpense) => {
      try {
        setExpenses((prevExpenses) => ({
          ...prevExpenses,
          [budgetId]: [...(prevExpenses[budgetId] || []), newExpense],
        })); // Update UI with new expense
      } catch (error) {
        console.error("Error adding expense:", error);
      }
    };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;




  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Budget Management</h1>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => setIsBudgetDialogOpen(true)}
        >
          + Create Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.length === 0 ? (
          <p className="text-gray-500">No budgets found.</p>
        ) : (
          budgets.map((budget) => (
            <div
              key={budget._id}
              className={`bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer ${
                selectedBudget?._id === budget._id
                  ? "border-2 border-blue-500"
                  : ""
              }`}
              onClick={() => setSelectedBudget(budget)}
            >
              <p>Title: {budget.title}</p>
              <p className="text-sm text-gray-600">
                Category: {budget.category}
              </p>
              <p className="text-sm text-gray-600">Amount: ₹ {budget.amount}</p>
              <p className="text-xs text-gray-500">
                Allocated by:{" "}
                {budget.allocated_by?.name ||
                  budget.allocated_by?.model ||
                  "Unknown"}
              </p>
            </div>
          ))
        )}
      </div>

      {/* {selectedBudget && (
        <ExpenseTable
          expenses={expenses[selectedBudget._id] || []}
          isLoading={isLoadingExpenses}
          error={expensesError}
        />
      )} */}
      {selectedBudget && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-bold">Expenses - {selectedBudget.title}</h3>
            <button
              className="px-4 py-2 bg-black text-white rounded"
              onClick={() => setIsExpenseDialogOpen(true)}
            >
              + Add Expense
            </button>
          </div>

          <ExpenseTable
            expenses={expenses[selectedBudget._id] || []}
            isLoading={isLoadingExpenses}
            error={expensesError}
          />
        </div>
      )}

      {isExpenseDialogOpen && selectedBudget && (
        <ExpenseForm
          budget={selectedBudget}
          onClose={() => setIsExpenseDialogOpen(false)}
          onSubmit={(expense) => handleAddExpense(selectedBudget._id, expense)}
        />
      )}

      {isBudgetDialogOpen && (
        <BudgetForm
          onClose={() => setIsBudgetDialogOpen(false)}
          onSubmit={handleCreateBudget}
        />
      )}
    </div>
  );
}



function ExpenseForm({ budget, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    description: "",
    amount_spent: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.description || !formData.amount_spent) {
      setError("Description and amount spent are required");
      setIsSubmitting(false);
      return;
    }

    if (Number(formData.amount_spent) > budget.amount) {
      setError("Expense amount cannot exceed the allocated budget");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await axios.post(
        `http://localhost:3000/api/budgets/${budget._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        onSubmit(response.data.data);
        setFormData({ description: "", amount_spent: "" });
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to add expense");
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message || "Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add Expense - {budget.category}</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Description*</label>
            <input
              className="w-full p-2 border rounded"
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount Spent* (Available: ₹{budget.amount})
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              placeholder="Enter amount"
              value={formData.amount_spent}
              onChange={(e) => setFormData({ ...formData, amount_spent: e.target.value })}
              required
              min="0"
              max={budget.amount}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}




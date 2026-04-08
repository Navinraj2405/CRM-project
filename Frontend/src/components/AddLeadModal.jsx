import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { X } from 'lucide-react';

const AddLeadModal = ({ isOpen, onClose, onLeadAdded }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website',
    status: 'New Lead',
    assignedTo: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch users for the assignment dropdown
      const fetchUsers = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const res = await axios.get('http://localhost:5000/api/users', config);
          setUsers(res.data.filter(u => u.role === 'Executive'));
        } catch (err) {
          console.error("Failed to fetch users for assign", err);
        }
      };
      
      if (user.role === 'Admin' || user.role === 'Manager') {
        fetchUsers();
      }
      
      // Reset form on open
      setFormData({
        name: '', email: '', phone: '', source: 'Website', status: 'New Lead', assignedTo: ''
      });
      setError(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Filter out empty assignedTo to avoid casting errors in DB
      const submitData = { ...formData };
      if (!submitData.assignedTo) {
          delete submitData.assignedTo;
      }

      await axios.post('http://localhost:5000/api/leads', submitData, config);
      onLeadAdded(); // trigger refresh
      onClose(); // close modal
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Modal panel */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl leading-6 font-medium text-gray-900" id="modal-title">
                Add New Lead
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X size={24} />
              </button>
            </div>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
                
                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Source</label>
                  <select name="source" value={formData.source} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                    <option value="Website">Website</option>
                    <option value="Facebook Ads">Facebook Ads</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                    <option value="New Lead">New Lead</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                {users.length > 0 && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Assign To Executive</label>
                    <select name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                      <option value="">Unassigned</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse border-t pt-4">
                <button type="submit" disabled={loading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                  {loading ? 'Adding...' : 'Save Lead'}
                </button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLeadModal;

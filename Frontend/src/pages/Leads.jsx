import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import { Search, Mail, Phone, MessageCircle, Edit, DollarSign } from 'lucide-react';
import { load } from '@cashfreepayments/cashfree-js';
import AddLeadModal from '../components/AddLeadModal';
import EditLeadModal from '../components/EditLeadModal';

const Leads = () => {
  const { user } = useContext(AuthContext);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, [search]);

  const fetchLeads = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`http://localhost:5000/api/leads?search=${search}`, config);
      setLeads(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertPayment = async (lead) => {
    try {
      const response = await fetch('http://localhost:5000/api/payment/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}` 
        },
        body: JSON.stringify({
          amount: 99.00,
          customerEmail: lead.email,
          customerPhone: lead.phone || "9999999999",
          leadId: lead._id
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Order creation failed on the backend.");
      }

      const cashfree = await load({ mode: "sandbox" });

      await cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        returnUrl: "http://localhost:5173/leads?payment=success",
        redirectTarget: "_self",
      });

    } catch (err) {
      console.error("Payment flow error:", err);
      alert(err.message || "Could not connect to payment gateway.");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'New Lead': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Qualified': 'bg-purple-100 text-purple-800',
      'Proposal Sent': 'bg-indigo-100 text-indigo-800',
      'Converted': 'bg-base-100 text-green-800 bg-green-100',
      'Lost': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div>Loading leads...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">Leads Management</h1>
        <div className="flex space-x-3">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {(user.role === 'Admin' || user.role === 'Manager') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Add Lead
            </button>
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status / Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow Up</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">Via {lead.source}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.assignedTo ? lead.assignedTo.name : 'Unassigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lead.followUpDate ? format(new Date(lead.followUpDate), 'MMM d, yyyy') : 'None'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap right text-right text-sm font-medium flex space-x-2 justify-end">
                  <a href={`mailto:${lead.email}`} className="text-gray-400 hover:text-primary-600" title="Email Lead">
                    <Mail size={18} />
                  </a>
                  <a href={`https://wa.me/${lead.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-green-600" title="WhatsApp Lead">
                    <MessageCircle size={18} />
                  </a>
                  <button 
                    onClick={() => { setSelectedLead(lead); setIsEditModalOpen(true); }} 
                    className="text-gray-400 hover:text-blue-600" 
                    title="Edit Lead"
                  >
                    <Edit size={18} />
                  </button>
                  {lead.status !== 'Converted' && (
                    <button 
                      onClick={() => handleConvertPayment(lead)} 
                      className="text-emerald-500 hover:text-emerald-600 ml-2" 
                      title="Pay & Convert"
                    >
                      <DollarSign size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onLeadAdded={fetchLeads} 
      />

      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onLeadUpdated={fetchLeads}
        lead={selectedLead}
      />
    </div>
  );
};

export default Leads;

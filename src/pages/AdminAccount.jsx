import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { Link } from 'react-router-dom';
import Spinner from '../components/common/Spinner';
import { ArrowLeft } from 'lucide-react';

const AdminAccount = () => {
  const [me, setMe] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/users/me');
        setMe(data);
        setForm({ name: data?.name || '', email: data?.email || '' });
      } catch {
        toast.error('Failed to load account');
      }
    };
    load();
  }, []);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('email', form.email);

      const { data } = await api.put('/users/me', payload);
      setMe(data);
      toast.success('Account updated');
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!me) return <Spinner />;

  return (
  <div className="p-6 w-full md:max-w-[1500px] mx-auto">
    <h2 className="text-3xl font-bold text-[#0D9488] mb-6 text-center">Admin Account</h2>

    <div className="bg-white shadow rounded-xl p-6 space-y-6 border border-gray-200">
      <Link to="/admin/dashboard" className="text-[#0D9488] hover:underline text-sm flex">
         <ArrowLeft className='w-5 h-5'/> Go to Admin Dashboard
        </Link>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Role</p>
          <p className="font-semibold flex items-center capitalize text-gray-800">
            {me.role}
            {me.role === 'admin' && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded bg-teal-100 text-[#0D9488]">
                Admin
              </span>
            )}
          </p>
        </div>
      </div>

      <form onSubmit={onSave} className="grid gap-5">
        <div >
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className="w-full border-2 border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
          />
        </div>
        <div >
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            readOnly
            value={form.email}
            onChange={onChange}
            className="w-full border-2 border-gray-300 px-4 py-2 rounded-md cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
          />
        </div>

        <div className=" text-right">
          <button
            type="submit"
            disabled={saving}
            className={`px-5 py-2 rounded-md font-medium text-white transition ${
              saving
                ? 'bg-teal-400 cursor-wait'
                : 'bg-[#0D9488] hover:bg-[#0f766e]'
            }`}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

};

export default AdminAccount;

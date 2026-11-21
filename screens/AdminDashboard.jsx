import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users, Stethoscope, Building2, FlaskConical, ShoppingBag, Package,
  ShieldCheck, LogOut, Search, Edit2, Trash2, CheckCircle, XCircle,
  LayoutDashboard, RefreshCw, Star, Menu, X,
  MessageSquare, FileText, Tag, Lock, User, Plus, KeyRound, Store, Key,
  Calendar, ShoppingCart, Beaker, Instagram, Image
} from 'lucide-react';
import SocialFeedSettingsTab from '@/components/admin/SocialFeedSettingsTab';
import BannerSettingsTab from '@/components/admin/BannerSettingsTab';

const SECTIONS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'doctors', label: 'Doctors', icon: Stethoscope },
  { key: 'hospitals', label: 'Hospitals', icon: Building2 },
  { key: 'labs', label: 'Labs', icon: FlaskConical },
  { key: 'retailers', label: 'Retailers', icon: ShoppingBag },
  { key: 'retailer_products', label: 'Products', icon: Package },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'bookings', label: 'Bookings & Orders', icon: FileText },
  { key: 'community', label: 'Community Posts', icon: MessageSquare },
  { key: 'provider_credentials', label: 'Provider Credentials', icon: KeyRound },
  { key: 'social_feed', label: 'Social Feed', icon: Instagram },
  { key: 'promo_banners', label: 'Promo Banners', icon: Image },
];

const STATUS_COLORS = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  delivered: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
};

function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
      {status || '—'}
    </span>
  );
}

function ImageUploadField({ value, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      {value && (
        <img src={value} alt="preview" className="w-full h-36 object-cover rounded-lg border" />
      )}
      <label className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg py-2.5 cursor-pointer text-sm transition-colors ${uploading ? 'border-teal-300 bg-teal-50 text-teal-600' : 'border-gray-200 hover:border-teal-400 hover:bg-teal-50 text-gray-500 hover:text-teal-600'}`}>
        {uploading ? (
          <><RefreshCw className="w-4 h-4 animate-spin" /> Uploading...</>
        ) : (
          <><Plus className="w-4 h-4" /> {value ? 'Change Image' : 'Upload Image'}</>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>
      {value && (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Or paste image URL"
          className="w-full border rounded-lg px-3 py-1.5 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      )}
    </div>
  );
}

function EditModal({ item, fields, onSave, onClose, title = 'Edit Record', saveLabel = 'Save Changes' }) {
  const [form, setForm] = useState({ ...item });
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-gray-500 mb-1 block capitalize">{f.label || f.key}</label>
              {f.type === 'image' ? (
                <ImageUploadField
                  value={form[f.key] || ''}
                  onChange={url => setForm(p => ({ ...p, [f.key]: url }))}
                />
              ) : f.type === 'select' ? (
                <select
                  value={form[f.key] || ''}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  value={form[f.key] || ''}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              ) : f.type === 'boolean' ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, [f.key]: !p[f.key] }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form[f.key] ? 'bg-teal-500' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form[f.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm text-gray-600">{form[f.key] ? 'Yes' : 'No'}</span>
                </div>
              ) : f.type === 'tags' ? (
                <div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(form[f.key] || []).map((tag, i) => (
                      <span key={i} className="flex items-center gap-1 bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full">
                        {tag}
                        <button type="button" onClick={() => setForm(p => ({ ...p, [f.key]: p[f.key].filter((_, idx) => idx !== i) }))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <Input
                    placeholder="Type and press Enter to add"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        setForm(p => ({ ...p, [f.key]: [...(p[f.key] || []), e.target.value.trim()] }));
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              ) : (
                <Input
                  value={form[f.key] || ''}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  type={f.type || 'text'}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 p-5 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => onSave(form)} className="flex-1 bg-teal-600 hover:bg-teal-700">{saveLabel}</Button>
        </div>
      </div>
    </div>
  );
}

function EntityTable({ entityName, columns, editFields, statusField, queryKey, extraRowAction }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [addingNew, setAddingNew] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: [queryKey || entityName],
    queryFn: () => base44.entities[entityName].list('-created_date', 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.functions.invoke('adminEntityAction', { entityName, action: 'update', id, data }),
    onSuccess: () => { qc.invalidateQueries([queryKey || entityName]); setEditItem(null); },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('adminEntityAction', { entityName, action: 'create', data }),
    onSuccess: () => { qc.invalidateQueries([queryKey || entityName]); setAddingNew(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.functions.invoke('adminEntityAction', { entityName, action: 'delete', id }),
    onSuccess: () => qc.invalidateQueries([queryKey || entityName]),
  });

  const filtered = data.filter(item =>
    columns.some(col => String(item[col.key] || '').toLowerCase().includes(search.toLowerCase()))
  );

  // Build an empty default object for the add form
  const emptyItem = editFields ? Object.fromEntries(editFields.map(f => [f.key, f.options ? f.options[0] : ''])) : {};

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <span className="text-sm text-gray-500">{filtered.length} records</span>
        <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries([queryKey || entityName])}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
        {editFields && (
          <Button size="sm" onClick={() => setAddingNew(true)} className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Entry
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{col.label}</th>
                ))}
                {statusField && <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>}
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={columns.length + 2} className="text-center py-10 text-gray-400">No records found</td></tr>
              ) : filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-gray-700 max-w-[200px] truncate">
                      {col.render ? col.render(item[col.key], item) : (item[col.key] ?? '—')}
                    </td>
                  ))}
                  {statusField && (
                    <td className="px-4 py-3">
                      <StatusBadge status={item[statusField]} />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {statusField && item[statusField] === 'pending' && (
                        <button
                          onClick={() => updateMutation.mutate({ id: item.id, data: { [statusField]: 'approved' } })}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {statusField && item[statusField] === 'approved' && (
                        <button
                          onClick={() => updateMutation.mutate({ id: item.id, data: { [statusField]: 'suspended' } })}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Suspend"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      {editFields && (
                        <button
                          onClick={() => setEditItem(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {extraRowAction && extraRowAction(item)}
                      <button
                        onClick={() => { if (window.confirm('Delete this record?')) deleteMutation.mutate(item.id); }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editItem && editFields && (
        <EditModal
          item={editItem}
          fields={editFields}
          onSave={(data) => updateMutation.mutate({ id: editItem.id, data })}
          onClose={() => setEditItem(null)}
        />
      )}

      {addingNew && editFields && (
        <EditModal
          item={emptyItem}
          fields={editFields}
          onSave={(data) => createMutation.mutate(data)}
          onClose={() => setAddingNew(false)}
          title="Add New Entry"
          saveLabel="Create"
        />
      )}
    </div>
  );
}

function Overview() {
  const { data: doctors = [] } = useQuery({ queryKey: ['Doctor_count'], queryFn: () => base44.entities.Doctor.list() });
  const { data: hospitals = [] } = useQuery({ queryKey: ['Hospital_count'], queryFn: () => base44.entities.Hospital.list() });
  const { data: labs = [] } = useQuery({ queryKey: ['Lab_count'], queryFn: () => base44.entities.Lab.list() });
  const { data: retailers = [] } = useQuery({ queryKey: ['Retailer_count'], queryFn: () => base44.entities.Retailer.list() });
  const { data: products = [] } = useQuery({ queryKey: ['RetailerProduct_count'], queryFn: () => base44.entities.RetailerProduct.list() });
  const { data: bookings = [] } = useQuery({ queryKey: ['Booking_count'], queryFn: () => base44.entities.Booking.list() });
  const { data: orders = [] } = useQuery({ queryKey: ['Order_count'], queryFn: () => base44.entities.Order.list() });
  const { data: posts = [] } = useQuery({ queryKey: ['CommunityPost_count'], queryFn: () => base44.entities.CommunityPost.list() });

  const stats = [
    { label: 'Doctors', icon: Stethoscope, color: 'bg-blue-50 text-blue-600', data: doctors },
    { label: 'Hospitals', icon: Building2, color: 'bg-green-50 text-green-600', data: hospitals },
    { label: 'Labs', icon: FlaskConical, color: 'bg-violet-50 text-violet-600', data: labs },
    { label: 'Retailers', icon: ShoppingBag, color: 'bg-orange-50 text-orange-600', data: retailers },
    { label: 'Products', icon: Package, color: 'bg-pink-50 text-pink-600', data: products },
    { label: 'Bookings', icon: FileText, color: 'bg-teal-50 text-teal-600', data: bookings },
    { label: 'Orders', icon: Tag, color: 'bg-indigo-50 text-indigo-600', data: orders },
    { label: 'Posts', icon: MessageSquare, color: 'bg-amber-50 text-amber-600', data: posts },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-5">Platform Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(e => {
          const Icon = e.icon;
          const pending = e.data.filter(d => d.status === 'pending').length;
          return (
            <div key={e.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${e.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold">{e.data.length}</div>
              <div className="text-sm text-gray-500">{e.label}</div>
              {pending > 0 && (
                <div className="mt-1 text-xs text-amber-600 font-medium">{pending} pending approval</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SECTION_CONFIG = {
  doctors: {
    entityName: 'Doctor',
    statusField: 'status',
    columns: [
      { key: 'name_en', label: 'Name (EN)' },
      { key: 'specialty_en', label: 'Specialty' },
      { key: 'phone', label: 'Phone' },
      { key: 'rating', label: 'Rating', render: v => v ? <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{v}</span> : '—' },
      { key: 'verified', label: 'Verified', render: v => v ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" /> },
      { key: 'deletion_requested', label: 'Deletion Req.', render: v => v ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Requested</span> : '—' },
    ],
    editFields: [
      { key: 'name_en', label: 'Name (EN)' }, { key: 'name_ar', label: 'Name (AR)' },
      { key: 'specialty_en', label: 'Specialty (EN)' }, { key: 'specialty_ar', label: 'Specialty (AR)' },
      { key: 'phone', label: 'Phone' }, { key: 'license_number', label: 'License Number' },
      { key: 'location_en', label: 'Location (EN)' }, { key: 'location_ar', label: 'Location (AR)' },
      { key: 'clinic_name_en', label: 'Clinic Name (EN)' }, { key: 'clinic_name_ar', label: 'Clinic Name (AR)' },
      { key: 'clinic_address', label: 'Clinic Address' },
      { key: 'consultation_fee', label: 'Consultation Fee (JOD)', type: 'number' },
      { key: 'experience_years', label: 'Experience (Years)', type: 'number' },
      { key: 'gender', label: 'Gender', type: 'select', options: ['male', 'female'] },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'suspended'] },
      { key: 'verified', label: 'Verified', type: 'boolean' },
      { key: 'deletion_requested', label: 'Deletion Requested', type: 'boolean' },
      { key: 'available_today', label: 'Available Today', type: 'boolean' },
      { key: 'bio_en', label: 'Bio (EN)', type: 'textarea' }, { key: 'bio_ar', label: 'Bio (AR)', type: 'textarea' },
      { key: 'specialties', label: 'Sub-Specialties (tags)', type: 'tags' },
      { key: 'services', label: 'Services (tags)', type: 'tags' },
      { key: 'insurance_accepted', label: 'Insurance Accepted (tags)', type: 'tags' },
      { key: 'languages', label: 'Languages (tags)', type: 'tags' },
      { key: 'instagram_url', label: 'Instagram URL' }, { key: 'facebook_url', label: 'Facebook URL' },
      { key: 'photo_url', label: 'Profile Photo', type: 'image' },
    ],
  },
  hospitals: {
    entityName: 'Hospital',
    statusField: 'status',
    columns: [
      { key: 'name_en', label: 'Name (EN)' },
      { key: 'city', label: 'City' },
      { key: 'phone', label: 'Phone' },
      { key: 'type', label: 'Type' },
      { key: 'verified', label: 'Verified', render: v => v ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" /> },
      { key: 'deletion_requested', label: 'Deletion Req.', render: v => v ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Requested</span> : '—' },
    ],
    editFields: [
      { key: 'name_en', label: 'Name (EN)' }, { key: 'name_ar', label: 'Name (AR)' },
      { key: 'city', label: 'City' }, { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' }, { key: 'website', label: 'Website' },
      { key: 'address_en', label: 'Address (EN)' }, { key: 'address_ar', label: 'Address (AR)' },
      { key: 'type', label: 'Type', type: 'select', options: ['public', 'private', 'specialist', 'clinic'] },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'suspended'] },
      { key: 'verified', label: 'Verified', type: 'boolean' },
      { key: 'deletion_requested', label: 'Deletion Requested', type: 'boolean' },
      { key: 'featured', label: 'Featured', type: 'boolean' },
      { key: 'consultation_fee', label: 'Consultation Fee (JOD)', type: 'number' },
      { key: 'beds_count', label: 'Beds Count', type: 'number' },
      { key: 'established_year', label: 'Established Year', type: 'number' },
      { key: 'description_en', label: 'Description (EN)', type: 'textarea' }, { key: 'description_ar', label: 'Description (AR)', type: 'textarea' },
      { key: 'specialties', label: 'Specialties (tags)', type: 'tags' },
      { key: 'services', label: 'Services (tags)', type: 'tags' },
      { key: 'insurance_accepted', label: 'Insurance Accepted (tags)', type: 'tags' },
      { key: 'photo_url', label: 'Photo', type: 'image' },
    ],
  },
  labs: {
    entityName: 'Lab',
    statusField: 'status',
    columns: [
      { key: 'name_en', label: 'Name (EN)' },
      { key: 'city', label: 'City' },
      { key: 'phone', label: 'Phone' },
      { key: 'rating', label: 'Rating' },
      { key: 'verified', label: 'Verified', render: v => v ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" /> },
      { key: 'deletion_requested', label: 'Deletion Req.', render: v => v ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Requested</span> : '—' },
    ],
    editFields: [
      { key: 'name_en', label: 'Name (EN)' }, { key: 'name_ar', label: 'Name (AR)' },
      { key: 'city', label: 'City' }, { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' }, { key: 'website', label: 'Website' },
      { key: 'address_en', label: 'Address (EN)' }, { key: 'address_ar', label: 'Address (AR)' },
      { key: 'working_hours', label: 'Working Hours' },
      { key: 'consultation_fee', label: 'Starting Price (JOD)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'suspended'] },
      { key: 'verified', label: 'Verified', type: 'boolean' },
      { key: 'deletion_requested', label: 'Deletion Requested', type: 'boolean' },
      { key: 'home_visit', label: 'Home Visit', type: 'boolean' },
      { key: 'description_en', label: 'Description (EN)', type: 'textarea' }, { key: 'description_ar', label: 'Description (AR)', type: 'textarea' },
      { key: 'services', label: 'Services/Tests (tags)', type: 'tags' },
      { key: 'insurance_accepted', label: 'Insurance Accepted (tags)', type: 'tags' },
      { key: 'maps_code', label: 'Google Maps Link' },
      { key: 'photo_url', label: 'Photo', type: 'image' },
    ],
  },
  retailers: {
    entityName: 'Retailer',
    statusField: 'status',
    columns: [
      { key: 'name_en', label: 'Name (EN)' },
      { key: 'type', label: 'Type' },
      { key: 'city', label: 'City' },
      { key: 'phone', label: 'Phone' },
      { key: 'verified', label: 'Verified', render: v => v ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" /> },
      { key: 'deletion_requested', label: 'Deletion Req.', render: v => v ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Requested</span> : '—' },
    ],
    editFields: [
      { key: 'name_en', label: 'Name (EN)' }, { key: 'name_ar', label: 'Name (AR)' },
      { key: 'city', label: 'City' }, { key: 'phone', label: 'Phone' },
      { key: 'address_en', label: 'Address (EN)' }, { key: 'address_ar', label: 'Address (AR)' },
      { key: 'license_number', label: 'License Number' },
      { key: 'type', label: 'Type', type: 'select', options: ['pharmacy', 'medical_store', 'supplement_store', 'general'] },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'suspended'] },
      { key: 'verified', label: 'Verified', type: 'boolean' },
      { key: 'deletion_requested', label: 'Deletion Requested', type: 'boolean' },
      { key: 'description_en', label: 'Description (EN)', type: 'textarea' }, { key: 'description_ar', label: 'Description (AR)', type: 'textarea' },
      { key: 'logo_url', label: 'Logo', type: 'image' },
    ],
  },
  retailer_products: {
    entityName: 'RetailerProduct',
    columns: [
      { key: 'name_en', label: 'Name (EN)' },
      { key: 'retailer_name_en', label: 'Retailer' },
      { key: 'category', label: 'Category' },
      { key: 'price', label: 'Price (JOD)', render: v => v ? `${v} JOD` : '—' },
      { key: 'stock_quantity', label: 'Stock' },
      { key: 'is_active', label: 'Active', render: v => v ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" /> },
    ],
    editFields: [
      { key: 'name_en', label: 'Name (EN)' }, { key: 'name_ar', label: 'Name (AR)' },
      { key: 'price', label: 'Price (JOD)', type: 'number' },
      { key: 'original_price', label: 'Original Price (JOD)', type: 'number' },
      { key: 'stock_quantity', label: 'Stock Quantity', type: 'number' },
      { key: 'sku', label: 'SKU' }, { key: 'unit', label: 'Unit (e.g. tablet, bottle)' },
      { key: 'category', label: 'Category', type: 'select', options: ['supplements', 'devices', 'care_tools', 'medications', 'cosmetics', 'baby_care', 'other'] },
      { key: 'is_active', label: 'Active', type: 'boolean' },
      { key: 'requires_prescription', label: 'Requires Prescription', type: 'boolean' },
      { key: 'doctor_recommended', label: 'Doctor Recommended', type: 'boolean' },
      { key: 'description_en', label: 'Description (EN)', type: 'textarea' }, { key: 'description_ar', label: 'Description (AR)', type: 'textarea' },
      { key: 'image_url', label: 'Product Image', type: 'image' },
    ],
  },
  users: {
    entityName: 'User',
    columns: [
      { key: 'full_name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', render: v => <Badge variant={v === 'admin' ? 'default' : 'secondary'}>{v}</Badge> },
      { key: 'created_date', label: 'Joined', render: v => v ? new Date(v).toLocaleDateString() : '—' },
    ],
    editFields: [
      { key: 'role', label: 'Role', type: 'select', options: ['user', 'admin'] },
    ],
  },
  community: {
    entityName: 'CommunityPost',
    columns: [
      { key: 'author_name', label: 'Author' },
      { key: 'type', label: 'Type' },
      { key: 'category', label: 'Category' },
      { key: 'likes_count', label: 'Likes' },
      { key: 'is_verified_doctor', label: 'Verified Dr.', render: v => v ? <CheckCircle className="w-4 h-4 text-green-500" /> : '—' },
    ],
    editFields: [
      { key: 'author_name', label: 'Author Name' },
      { key: 'content_en', label: 'Content (EN)', type: 'textarea' },
      { key: 'content_ar', label: 'Content (AR)', type: 'textarea' },
      { key: 'category', label: 'Category', type: 'select', options: ['general', 'dermatology', 'cardiology', 'orthopedics', 'nutrition', 'mental_health'] },
      { key: 'image_url', label: 'Post Image', type: 'image' },
    ],
  },
};

const BOOKING_CATEGORIES = [
  {
    key: 'doctor',
    label: 'Doctor Bookings',
    icon: Stethoscope,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    activeColor: 'bg-blue-600 text-white',
    entityName: 'Booking',
    columns: [
      { key: 'patient_name', label: 'Patient' },
      { key: 'patient_phone', label: 'Phone' },
      { key: 'consultation_type', label: 'Type' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'total_amount', label: 'Amount', render: v => v ? `${v} JOD` : '—' },
      { key: 'payment_method', label: 'Payment' },
    ],
    editFields: [
      { key: 'patient_name', label: 'Patient Name' }, { key: 'patient_phone', label: 'Phone' }, { key: 'patient_email', label: 'Email' },
      { key: 'consultation_type', label: 'Consultation Type', type: 'select', options: ['message', 'voice', 'video'] },
      { key: 'date', label: 'Date', type: 'date' }, { key: 'time', label: 'Time' },
      { key: 'total_amount', label: 'Total Amount (JOD)', type: 'number' },
      { key: 'payment_method', label: 'Payment Method', type: 'select', options: ['visa', 'mastercard', 'jordanian_wallet', 'network', 'jetwallet', 'paypal'] },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'confirmed', 'completed', 'cancelled'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    key: 'hospital',
    label: 'Hospital Bookings',
    icon: Building2,
    color: 'bg-green-50 text-green-700 border-green-200',
    activeColor: 'bg-green-600 text-white',
    entityName: 'HospitalBooking',
    columns: [
      { key: 'hospital_name_en', label: 'Hospital' },
      { key: 'patient_name', label: 'Patient' },
      { key: 'patient_phone', label: 'Phone' },
      { key: 'department', label: 'Dept / Specialty' },
      { key: 'service_type', label: 'Service' },
      { key: 'date', label: 'Date' },
      { key: 'time', label: 'Time' },
      { key: 'total_amount', label: 'Amount', render: v => v ? `${v} JOD` : '—' },
    ],
    editFields: [
      { key: 'patient_name', label: 'Patient Name' }, { key: 'patient_phone', label: 'Phone' }, { key: 'patient_email', label: 'Email' },
      { key: 'department', label: 'Department / Specialty' },
      { key: 'service_type', label: 'Service Type', type: 'select', options: ['consultation', 'checkup', 'surgery', 'emergency', 'lab_test', 'imaging'] },
      { key: 'date', label: 'Date', type: 'date' }, { key: 'time', label: 'Time' },
      { key: 'total_amount', label: 'Total Amount (JOD)', type: 'number' },
      { key: 'payment_method', label: 'Payment Method', type: 'select', options: ['visa', 'mastercard', 'cash_on_delivery', 'jordanian_wallet', 'network', 'paypal'] },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'confirmed', 'completed', 'cancelled'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  {
    key: 'retailer',
    label: 'Retailer Orders',
    icon: ShoppingCart,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    activeColor: 'bg-orange-500 text-white',
    entityName: 'Order',
    columns: [
      { key: 'customer_name', label: 'Customer' },
      { key: 'customer_phone', label: 'Phone' },
      { key: 'city', label: 'City' },
      { key: 'total_amount', label: 'Total', render: v => v ? `${v} JOD` : '—' },
      { key: 'payment_method', label: 'Payment' },
    ],
    editFields: [
      { key: 'customer_name', label: 'Customer Name' }, { key: 'customer_phone', label: 'Phone' }, { key: 'customer_email', label: 'Email' },
      { key: 'delivery_address', label: 'Delivery Address' }, { key: 'city', label: 'City' },
      { key: 'subtotal', label: 'Subtotal (JOD)', type: 'number' },
      { key: 'delivery_fee', label: 'Delivery Fee (JOD)', type: 'number' },
      { key: 'total_amount', label: 'Total Amount (JOD)', type: 'number' },
      { key: 'payment_method', label: 'Payment Method', type: 'select', options: ['visa', 'mastercard', 'cash_on_delivery', 'jordanian_wallet', 'network', 'paypal'] },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
];

function BookingsAndOrdersTab() {
  const [activeCategory, setActiveCategory] = useState('doctor');
  const cat = BOOKING_CATEGORIES.find(c => c.key === activeCategory);

  // Count queries for badges
  const { data: docBookings = [] } = useQuery({ queryKey: ['Booking_tab'], queryFn: () => base44.entities.Booking.list('-created_date', 200) });
  const { data: hospBookings = [] } = useQuery({ queryKey: ['HospitalBooking_tab'], queryFn: () => base44.entities.HospitalBooking.list('-created_date', 200) });
  const { data: orders = [] } = useQuery({ queryKey: ['Order_tab'], queryFn: () => base44.entities.Order.list('-created_date', 200) });

  const counts = { doctor: docBookings.length, hospital: hospBookings.length, retailer: orders.length };
  const pending = {
    doctor: docBookings.filter(b => b.status === 'pending').length,
    hospital: hospBookings.filter(b => b.status === 'pending').length,
    retailer: orders.filter(o => o.status === 'pending').length,
  };

  return (
    <div>
      {/* Category tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {BOOKING_CATEGORIES.map(c => {
          const Icon = c.icon;
          const isActive = activeCategory === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${isActive ? c.activeColor + ' border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              <Icon className="w-4 h-4" />
              {c.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                {counts[c.key]}
              </span>
              {pending[c.key] > 0 && (
                <span className="text-xs bg-amber-400 text-white px-1.5 py-0.5 rounded-full">{pending[c.key]} pending</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table for selected category */}
      {cat && (
        <EntityTable
          entityName={cat.entityName}
          columns={cat.columns}
          editFields={cat.editFields}
          statusField="status"
          queryKey={`${cat.key}_bookings`}
        />
      )}
    </div>
  );
}

const PROVIDER_TYPES = ['doctor', 'retailer', 'lab', 'hospital', 'clinic'];
const PROVIDER_REDIRECT = {
  doctor: '/doctor-console',
  retailer: '/retailer-console',
  lab: '/lab-console',
  hospital: '/hospital-console',
  clinic: '/clinic-console',
};

const CRED_STATUS_COLORS = {
  pending_approval: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function PendingCredentialsWidget({ filterType }) {
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data: creds = [] } = useQuery({
    queryKey: ['ProviderCredential'],
    queryFn: () => base44.entities.ProviderCredential.list('-created_date', 200),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProviderCredential.update(id, data),
    onSuccess: () => { qc.invalidateQueries(['ProviderCredential']); setEditItem(null); },
  });

  // Edit-save (with password) routes through the backend function so the
  // password is hashed server-side. Status-only approve/reject use updateMutation.
  const editCredMutation = useMutation({
    mutationFn: ({ c, form }) =>
      base44.functions.invoke('manageProviderCredential', {
        action: 'update',
        provider_type: c.provider_type,
        provider_id: c.provider_id,
        username: form.username,
        password: form.password || undefined,
        redirect_path: form.redirect_path,
        credential_status: form.credential_status,
      }).then((r) => { if (r.data?.error) throw new Error(r.data.error); return r.data; }),
    onSuccess: () => { qc.invalidateQueries(['ProviderCredential']); setEditItem(null); },
  });

  const filtered = filterType
    ? creds.filter(c => c.provider_type === filterType)
    : creds;

  const pending = filtered.filter(c => c.credential_status === 'pending_approval');
  const others = filtered.filter(c => c.credential_status !== 'pending_approval');
  const displayed = [...pending, ...others];

  if (displayed.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-amber-500" />
        Provider Credentials
        {pending.length > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{pending.length} pending</span>
        )}
      </h3>
      <div className="space-y-2">
        {displayed.map(c => (
          <div key={c.id}>
            {editItem?.id === c.id ? (
              <div className="bg-gray-50 rounded-xl border p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 block mb-0.5">Username</label>
                    <Input value={editForm.username || ''} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-0.5">Password</label>
                    <Input value={editForm.password || ''} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-0.5">Status</label>
                    <select value={editForm.credential_status || ''} onChange={e => setEditForm(f => ({ ...f, credential_status: e.target.value }))}
                      className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500">
                      <option value="pending_approval">Pending Approval</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-0.5">Redirect Path</label>
                    <Input value={editForm.redirect_path || ''} onChange={e => setEditForm(f => ({ ...f, redirect_path: e.target.value }))} className="h-8 text-sm" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditItem(null)}>Cancel</Button>
                  <Button size="sm" onClick={() => editCredMutation.mutate({ c, form: editForm })} className="bg-teal-600 hover:bg-teal-700 text-white">Save</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-3 py-2.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${CRED_STATUS_COLORS[c.credential_status] || 'bg-gray-100 text-gray-600'}`}>
                  {c.credential_status === 'pending_approval' ? 'Pending' : c.credential_status}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{c.provider_name || c.username}</p>
                  <p className="text-xs text-gray-400">@{c.username} · {c.provider_type}</p>
                </div>
                <div className="flex items-center gap-1">
                  {c.credential_status === 'pending_approval' && (
                    <>
                      <button
                        onClick={() => updateMutation.mutate({ id: c.id, data: { credential_status: 'approved' } })}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateMutation.mutate({ id: c.id, data: { credential_status: 'rejected' } })}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {c.credential_status === 'approved' && (
                    <button
                      onClick={() => updateMutation.mutate({ id: c.id, data: { credential_status: 'pending_approval' } })}
                      className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg"
                      title="Revoke"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => { setEditItem(c); setEditForm({ ...c }); }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const ENTITY_FOR_TYPE = {
  doctor: 'Doctor',
  retailer: 'Retailer',
  lab: 'Lab',
  hospital: 'Hospital',
  clinic: 'Hospital', // clinics are Hospital records with type='clinic'
};

const NAME_FIELD = {
  Doctor: 'name_en',
  Retailer: 'name_en',
  Lab: 'name_en',
  Hospital: 'name_en',
};

function CredForm({ value, onChange, onSave, onCancel, saveLabel = 'Save' }) {
  const entityName = ENTITY_FOR_TYPE[value.provider_type];

  const { data: providerRecords = [], isLoading: loadingRecords } = useQuery({
    queryKey: ['provider_records', entityName, value.provider_type],
    queryFn: async () => {
      const all = await base44.entities[entityName].list('name_en', 200);
      if (value.provider_type === 'clinic') return all.filter(r => r.type === 'clinic');
      if (value.provider_type === 'hospital') return all.filter(r => r.type !== 'clinic');
      return all;
    },
    staleTime: 30000,
  });

  const handleTypeChange = (newType) => {
    onChange({ ...value, provider_type: newType, redirect_path: PROVIDER_REDIRECT[newType] || '/', provider_id: '', provider_name: '' });
  };

  const handleProviderSelect = (id) => {
    const record = providerRecords.find(r => r.id === id);
    onChange({ ...value, provider_id: id, provider_name: record ? record[NAME_FIELD[entityName]] || '' : '' });
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Provider Type</label>
          <select
            value={value.provider_type}
            onChange={e => handleTypeChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            {PROVIDER_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Select {value.provider_type.charAt(0).toUpperCase() + value.provider_type.slice(1)}
          </label>
          <select
            value={value.provider_id || ''}
            onChange={e => handleProviderSelect(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
            disabled={loadingRecords}
          >
            <option value="">{loadingRecords ? 'Loading...' : '— Select record —'}</option>
            {providerRecords.map(r => (
              <option key={r.id} value={r.id}>
                {r[NAME_FIELD[entityName]] || r.id}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Username</label>
          <Input value={value.username} onChange={e => onChange({ ...value, username: e.target.value })} placeholder="Username" className="h-9 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Password</label>
          <Input value={value.password} onChange={e => onChange({ ...value, password: e.target.value })} placeholder="Password" className="h-9 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Redirect After Login</label>
          <Input value={value.redirect_path} onChange={e => onChange({ ...value, redirect_path: e.target.value })} placeholder="/doctor-console" className="h-9 text-sm" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(value)} className="bg-teal-600 hover:bg-teal-700 text-white">{saveLabel}</Button>
      </div>
    </div>
  );
}

function ProviderCredentialsTab() {
  const qc = useQueryClient();
  const emptyForm = { provider_type: 'doctor', provider_name: '', username: '', password: '', redirect_path: '/doctor-console', provider_id: '' };
  const [form, setForm] = useState(emptyForm);
  const [editItem, setEditItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const { data: creds = [], isLoading } = useQuery({
    queryKey: ['ProviderCredential'],
    queryFn: () => base44.entities.ProviderCredential.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.functions.invoke('manageProviderCredential', {
        action: 'create',
        provider_type: data.provider_type,
        provider_id: data.provider_id,
        provider_name: data.provider_name,
        username: data.username,
        password: data.password,
        redirect_path: data.redirect_path,
      }).then((r) => { if (r.data?.error) throw new Error(r.data.error); return r.data; }),
    onSuccess: () => { qc.invalidateQueries(['ProviderCredential']); setShowAdd(false); setForm(emptyForm); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      base44.functions.invoke('manageProviderCredential', {
        action: 'update',
        provider_type: data.provider_type,
        provider_id: data.provider_id,
        username: data.username,
        password: data.password || undefined,
        redirect_path: data.redirect_path,
      }).then((r) => { if (r.data?.error) throw new Error(r.data.error); return r.data; }),
    onSuccess: () => { qc.invalidateQueries(['ProviderCredential']); setEditItem(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProviderCredential.delete(id),
    onSuccess: () => qc.invalidateQueries(['ProviderCredential']),
  });

  const TYPE_COLORS = { doctor: 'bg-blue-100 text-blue-700', retailer: 'bg-orange-100 text-orange-700', lab: 'bg-violet-100 text-violet-700', hospital: 'bg-green-100 text-green-700', clinic: 'bg-teal-100 text-teal-700' };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Manage login credentials for providers. These appear as quick-login buttons on the Login page.</p>
        <Button size="sm" onClick={() => { setShowAdd(true); setEditItem(null); }} className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Credential
        </Button>
      </div>

      {showAdd && (
        <div className="mb-4">
          <CredForm value={form} onChange={setForm} onSave={(d) => createMutation.mutate(d)} onCancel={() => setShowAdd(false)} saveLabel="Create" />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : creds.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No credentials yet. Add one above.</div>
      ) : (
        <div className="space-y-2">
          {creds.map(c => (
            <div key={c.id}>
              {editItem?.id === c.id ? (
                <CredForm
                  value={editItem}
                  onChange={setEditItem}
                  onSave={(d) => updateMutation.mutate({ id: c.id, data: d })}
                  onCancel={() => setEditItem(null)}
                />
              ) : (
                <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[c.provider_type] || 'bg-gray-100 text-gray-600'}`}>{c.provider_type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.provider_name || '—'}</p>
                    <p className="text-xs text-gray-400">@{c.username} · {c.redirect_path}</p>
                    {c.provider_id && <p className="text-xs text-gray-300 font-mono truncate">ID: {c.provider_id}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditItem({ ...c }); setShowAdd(false); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { if (window.confirm('Delete?')) deleteMutation.mutate(c.id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GiveCredentialsModal({ provider, providerType, onClose }) {
  const qc = useQueryClient();
  const redirectMap = { retailer: '/retailer-console', hospital: '/hospital-console', doctor: '/doctor-console', lab: '/lab-console', clinic: '/clinic-console' };
  const [form, setForm] = useState({
    provider_type: providerType,
    provider_id: provider.id,
    provider_name: provider.name_en || '',
    username: '',
    password: '',
    redirect_path: redirectMap[providerType] || '/',
    credential_status: 'approved',
  });
  const [saved, setSaved] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.functions.invoke('manageProviderCredential', {
        action: 'create',
        provider_type: data.provider_type,
        provider_id: data.provider_id,
        provider_name: data.provider_name,
        username: data.username,
        password: data.password,
        redirect_path: data.redirect_path,
        credential_status: data.credential_status || 'approved',
      }).then((r) => { if (r.data?.error) throw new Error(r.data.error); return r.data; }),
    onSuccess: () => { qc.invalidateQueries(['ProviderCredential']); setSaved(true); },
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-lg">Give Credentials</h3>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        {saved ? (
          <div className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-800">Credentials Created!</p>
            <p className="text-sm text-gray-500 mt-1">Username: <strong>{form.username}</strong></p>
            <p className="text-sm text-gray-500">Login path: <strong>{form.redirect_path}</strong></p>
            <Button onClick={onClose} className="mt-4 bg-teal-600 hover:bg-teal-700 text-white">Done</Button>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <div className="bg-teal-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-teal-800">{provider.name_en}</p>
                <p className="text-xs text-teal-600 capitalize">{providerType} · {provider.city || ''}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Username</label>
                <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="e.g. retailer_abc" className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Password</label>
                <Input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" className="h-9 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Console Path (auto-set)</label>
                <Input value={form.redirect_path} onChange={e => setForm(f => ({ ...f, redirect_path: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Approval Status</label>
                <select value={form.credential_status} onChange={e => setForm(f => ({ ...f, credential_status: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500">
                  <option value="approved">Approved (active immediately)</option>
                  <option value="pending_approval">Pending Approval</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.username || !form.password || createMutation.isPending}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Credentials'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [authState, setAuthState] = useState({ loading: true, isAdmin: false, user: null });
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [credModal, setCredModal] = useState(null); // { provider, providerType }

  // Server-side role gate: only authenticated platform admins may view this
  // dashboard. The previous client-side username/password + sessionStorage flag
  // was a UI-only gate; this relies on the authenticated session's role instead.
  useEffect(() => {
    base44.auth.me()
      .then((u) => setAuthState({ loading: false, isAdmin: u?.role === 'admin', user: u }))
      .catch(() => setAuthState({ loading: false, isAdmin: false, user: null }));
  }, []);

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!authState.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-sm text-gray-500 mb-6">You must be signed in as an admin to view this page.</p>
          <Button onClick={() => { window.location.href = '/login'; }} className="bg-teal-600 hover:bg-teal-700 text-white">Go to Login</Button>
        </div>
      </div>
    );
  }

  const cfg = SECTION_CONFIG[activeSection];

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm">Admin Panel</div>
              <div className="text-xs text-gray-400">Mizher Medical Hub</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => { setActiveSection(s.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeSection === s.key
                    ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {s.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-gray-400 mb-1">Logged in as</div>
          <div className="text-sm font-semibold text-gray-700">{authState.user?.full_name || authState.user?.email || 'Admin'}</div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-base">
              {SECTIONS.find(s => s.key === activeSection)?.label}
            </h1>
            <p className="text-xs text-gray-400 hidden md:block">Manage and control all platform data</p>
          </div>
          <div className="ml-auto">
            <Badge className="bg-teal-50 text-teal-700 border-0">Admin</Badge>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeSection === 'overview' ? (
            <Overview />
          ) : activeSection === 'bookings' ? (
            <BookingsAndOrdersTab />
          ) : activeSection === 'social_feed' ? (
            <SocialFeedSettingsTab />
          ) : activeSection === 'promo_banners' ? (
            <BannerSettingsTab />
          ) : activeSection === 'provider_credentials' ? (
            <>
              <PendingCredentialsWidget filterType={null} />
              <ProviderCredentialsTab />
            </>
          ) : cfg ? (
            <>
              {['doctors','hospitals','labs','retailers'].includes(activeSection) && (
                <PendingCredentialsWidget filterType={
                  activeSection === 'doctors' ? 'doctor' :
                  activeSection === 'hospitals' ? 'hospital' :
                  activeSection === 'labs' ? 'lab' : 'retailer'
                } />
              )}
              <EntityTable
                entityName={cfg.entityName}
                columns={cfg.columns}
                editFields={cfg.editFields}
                statusField={cfg.statusField}
                queryKey={activeSection}
                extraRowAction={
                  ['doctors','hospitals','retailers','labs'].includes(activeSection)
                    ? (item) => (
                        <button
                          onClick={() => setCredModal({
                            provider: item,
                            providerType: activeSection === 'hospitals' ? 'hospital'
                              : activeSection === 'retailers' ? 'retailer'
                              : activeSection === 'labs' ? 'lab'
                              : 'doctor'
                          })}
                          className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Give Credentials"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      )
                    : undefined
                }
              />
            </>
          ) : null}
        </main>
      </div>

      {credModal && (
        <GiveCredentialsModal
          provider={credModal.provider}
          providerType={credModal.providerType}
          onClose={() => setCredModal(null)}
        />
      )}
    </div>
  );
}
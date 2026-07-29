import { useState, useMemo } from 'react';
import { useBrand } from '../context/BrandContext';
import { useCompany } from '../context/CompanyContext';
import {
  type StaffMember,
  type DateRange,
  formatNaira,
  getDateRangeFilter,
} from '../data/store';
import {
  useStaff,
  useOrders,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
} from '@/data/queries'; // Replace with your actual React Query hooks path
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Mail,
  Shield,
  ShieldOff,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Calendar,
  Package,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Staff() {
  const { brand } = useBrand();
  const { getCurrentCompanyId } = useCompany();
  const companyId = getCurrentCompanyId();

  // React Query Data Hooks
  const {
    data: staff = [],
    isLoading: loadingStaff,
    error: staffError,
  } = useStaff(companyId);

  const {
    data: allOrders = [],
    isLoading: loadingOrders,
    error: ordersError,
  } = useOrders(companyId);

  // React Query Mutation Hooks
  const createStaffMutation = useCreateStaff();
  const updateStaffMutation = useUpdateStaff();
  const deleteStaffMutation = useDeleteStaff();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState<Partial<StaffMember>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('infinite');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Filter orders by date range
  const orders = useMemo(() => {
    if (dateRange === 'infinite') return allOrders;
    const { start, end } = getDateRangeFilter(dateRange, customStart, customEnd);
    return allOrders.filter((o) => {
      const d = new Date(o.orderDate);
      return d >= start && d <= end;
    });
  }, [allOrders, dateRange, customStart, customEnd]);

  const staffMetrics = useMemo(() => {
    return staff.map((s) => {
      const my = orders.filter((o) => o.createdBy === s.name);
      const delivered = my.filter((o) => o.orderStatus === 'delivered');
      const totalProductsDelivered = delivered.reduce(
        (sum, o) => sum + o.items.reduce((s2, i) => s2 + i.quantity, 0),
        0
      );
      return {
        id: s.id,
        total: my.length,
        delivered: delivered.length,
        pending: my.filter((o) => o.orderStatus === 'pending').length,
        failed: my.filter(
          (o) => o.orderStatus === 'rejected' || o.orderStatus === 'failed'
        ).length,
        revenue: delivered.reduce((sum, o) => sum + o.amountPaid, 0),
        profit: delivered.reduce((sum, o) => sum + o.grossProfit, 0),
        conversion: my.length > 0 ? (delivered.length / my.length) * 100 : 0,
        itemsSold: my.reduce(
          (sum, o) => sum + o.items.reduce((s2, i) => s2 + i.quantity, 0),
          0
        ),
        productsDelivered: totalProductsDelivered,
      };
    });
  }, [staff, orders]);

  const getM = (id: string) => staffMetrics.find((m) => m.id === id);

  const chartData = staff.map((s) => {
    const m = getM(s.id);
    return {
      name: s.name.split(' ')[0],
      orders: m?.total || 0,
      delivered: m?.delivered || 0,
      revenue: Math.round((m?.revenue || 0) / 1000),
    };
  });

  const filtered = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      permissions: {
        canAddEditInventory: false,
        canAddLogistics: false,
        canMarkDelivered: false,
      },
    });
    setShowModal(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditing(member);
    setForm({ ...member });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name || !form.email || !form.role || !form.department || !companyId)
      return;

    if (editing) {
      await updateStaffMutation.mutateAsync({
        companyId,
        id: editing.id,
        data: { ...(form as Partial<StaffMember>) },
      });
    } else {
      await createStaffMutation.mutateAsync({
        companyId,
        data: {
          name: form.name || '',
          email: form.email || '',
          password: form.password || 'staff123',
          role: form.role || '',
          department: form.department || '',
          status: form.status || 'active',
          joinDate: form.joinDate || '',
          phone: form.phone || '',
          salary: form.salary || 0,
          permissions: form.permissions || {
            canAddEditInventory: false,
            canAddLogistics: false,
            canMarkDelivered: false,
          },
        },
      });
    }
    setShowModal(false);
  };

  const remove = async (id: string) => {
    if (!companyId) return;
    if (!confirm('Remove this team member?')) return;
    await deleteStaffMutation.mutateAsync({ companyId, id });
  };

  const togglePermission = async (
    id: string,
    perm: 'canAddEditInventory' | 'canAddLogistics' | 'canMarkDelivered'
  ) => {
    if (!companyId) return;
    const member = staff.find((s) => s.id === id);
    if (!member) return;

    const updatedPerms = {
      ...member.permissions,
      [perm]: !member.permissions[perm],
    };

    await updateStaffMutation.mutateAsync({
      companyId,
      id,
      data: { permissions: updatedPerms },
    });
  };

  const rangeLabels: { value: DateRange; label: string }[] = [
    { value: 'weekly', label: 'Week' },
    { value: 'monthly', label: 'Month' },
    { value: 'yearly', label: 'Year' },
    { value: 'infinite', label: 'All Time' },
    { value: 'custom', label: 'Custom' },
  ];

  // Summary totals
  const totals = useMemo(
    () => ({
      orders: staffMetrics.reduce((s, m) => s + m.total, 0),
      delivered: staffMetrics.reduce((s, m) => s + m.delivered, 0),
      revenue: staffMetrics.reduce((s, m) => s + m.revenue, 0),
      profit: staffMetrics.reduce((s, m) => s + m.profit, 0),
      productsDelivered: staffMetrics.reduce((s, m) => s + m.productsDelivered, 0),
    }),
    [staffMetrics]
  );

  if (loadingStaff || loadingOrders) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-500">Loading team members...</p>
      </div>
    );
  }

  if (staffError || ordersError) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm text-red-600">
          Could not load staff data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Range Filter */}
      <div className="card p-3 flex flex-wrap items-center gap-2">
        <Calendar size={16} className="text-gray-400" />
        {rangeLabels.map((r) => (
          <button
            key={r.value}
            onClick={() => setDateRange(r.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              dateRange === r.value
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={
              dateRange === r.value ? { backgroundColor: brand.primaryColor } : {}
            }
          >
            {r.label}
          </button>
        ))}
        {dateRange === 'custom' && (
          <div className="flex items-center gap-2 ml-1">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="input-field w-auto text-xs py-1"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="input-field w-auto text-xs py-1"
            />
          </div>
        )}
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{totals.orders}</p>
          <p className="text-[10px] text-gray-500">Total Orders</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-green-600">{totals.delivered}</p>
          <p className="text-[10px] text-gray-500">Delivered</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-blue-600">
            {totals.productsDelivered}
          </p>
          <p className="text-[10px] text-gray-500">Products Delivered</p>
        </div>
        <div className="card p-3 text-center">
          <p
            className="text-xl font-bold"
            style={{ color: brand.primaryColor }}
          >
            {formatNaira(totals.revenue)}
          </p>
          <p className="text-[10px] text-gray-500">Revenue</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-purple-600">
            {formatNaira(totals.profit)}
          </p>
          <p className="text-[10px] text-gray-500">Profit</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp size={16} /> Team Performance
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B7280' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
            />
            <Tooltip
              formatter={(v: any, name: any) => [
                name === 'revenue' ? `₦${v}k` : v,
                name,
              ]}
            />
            <Bar
              dataKey="orders"
              fill={brand.primaryColor}
              name="Orders"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="delivered"
              fill="#10B981"
              name="Delivered"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="revenue"
              fill="#8B5CF6"
              name="Revenue (₦k)"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team..."
            className="input-field pl-9"
          />
        </div>
        <button
          onClick={openAdd}
          className="btn-primary flex items-center gap-2"
          style={{ backgroundColor: brand.primaryColor }}
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Team List */}
      <div className="space-y-3">
        {filtered.map((member) => {
          const m = getM(member.id);
          const isExpanded = expandedId === member.id;
          return (
            <div key={member.id} className="card overflow-hidden">
              <div
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() =>
                  setExpandedId(isExpanded ? null : member.id)
                }
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {member.role} • {member.department}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-center">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {m?.total || 0}
                    </p>
                    <p className="text-[9px] text-gray-400">Orders</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-600">
                      {m?.delivered || 0}
                    </p>
                    <p className="text-[9px] text-gray-400">Delivered</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600">
                      {m?.productsDelivered || 0}
                    </p>
                    <p className="text-[9px] text-gray-400">Products</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-purple-600">
                      {formatNaira(m?.revenue || 0)}
                    </p>
                    <p className="text-[9px] text-gray-400">Revenue</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`badge text-[10px] ${
                      member.status === 'active'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {member.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(member);
                    }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(member.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {isExpanded && m && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="grid grid-cols-3 sm:grid-cols-8 gap-2 mt-3">
                    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold">{m.total}</p>
                      <p className="text-[9px] text-gray-500">
                        <ShoppingCart size={9} className="inline" /> Orders
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-green-600">
                        {m.delivered}
                      </p>
                      <p className="text-[9px] text-gray-500">
                        <CheckCircle size={9} className="inline" /> Delivered
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-blue-600">
                        {m.productsDelivered}
                      </p>
                      <p className="text-[9px] text-gray-500">
                        <Package size={9} className="inline" /> Products
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-amber-600">
                        {m.pending}
                      </p>
                      <p className="text-[9px] text-gray-500">Pending</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-red-600">{m.failed}</p>
                      <p className="text-[9px] text-gray-500">
                        <XCircle size={9} className="inline" /> Failed
                      </p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-indigo-600">
                        {formatNaira(m.revenue)}
                      </p>
                      <p className="text-[9px] text-gray-500">Revenue</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-emerald-600">
                        {formatNaira(m.profit)}
                      </p>
                      <p className="text-[9px] text-gray-500">Profit</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-purple-600">
                        {m.conversion.toFixed(0)}%
                      </p>
                      <p className="text-[9px] text-gray-500">Conversion</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <span>
                      <Mail size={10} className="inline" /> {member.email}
                    </span>
                    <span>Salary: {formatNaira(member.salary)}</span>
                    <span>Joined: {member.joinDate}</span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() =>
                        togglePermission(member.id, 'canAddEditInventory')
                      }
                      className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                        member.permissions.canAddEditInventory
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {member.permissions.canAddEditInventory ? (
                        <Shield size={12} />
                      ) : (
                        <ShieldOff size={12} />)} Inventory
                    </button>
                    <button
                      onClick={() =>
                        togglePermission(member.id, 'canAddLogistics')
                      }
                      className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                        member.permissions.canAddLogistics
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {member.permissions.canAddLogistics ? (
                        <Shield size={12} />
                      ) : (
                        <ShieldOff size={12} />
                      )}{' '}
                      Agent
                    </button>
                    <button
                      onClick={() =>
                        togglePermission(member.id, 'canMarkDelivered')
                      }
                      className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                        member.permissions.canMarkDelivered
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {member.permissions.canMarkDelivered ? (
                        <Shield size={12} />
                      ) : (
                        <ShieldOff size={12} />
                      )}{' '}
                      Delivered
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold text-gray-900">
                {editing ? 'Edit Member' : 'Add Member'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  className="input-field"
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Login Email
                </label>
                <input
                  className="input-field"
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  className="input-field"
                  type="text"
                  value={form.password || ''}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    className="input-field"
                    value={form.role || ''}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    className="input-field"
                    value={form.department || ''}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    className="input-field"
                    value={form.phone || ''}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary (₦)
                  </label>
                  <input
                    className="input-field"
                    type="number"
                    value={form.salary || ''}
                    onChange={(e) =>
                      setForm({ ...form, salary: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="input-field"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as 'active' | 'inactive',
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        form.permissions?.canAddEditInventory || false
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          permissions: {
                            ...form.permissions!,
                            canAddEditInventory: e.target.checked,
                          },
                        })
                      }
                      className="rounded"
                    />{' '}
                    Can add/edit inventory
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.permissions?.canAddLogistics || false}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          permissions: {
                            ...form.permissions!,
                            canAddLogistics: e.target.checked,
                          },
                        })
                      }
                      className="rounded"
                    />{' '}
                    Can add agents
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.permissions?.canMarkDelivered || false}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          permissions: {
                            ...form.permissions!,
                            canMarkDelivered: e.target.checked,
                          },
                        })
                      }
                      className="rounded"
                    />{' '}
                    Can mark delivered
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={
                  createStaffMutation.isPending || updateStaffMutation.isPending
                }
                className="btn-primary flex-1 disabled:opacity-50"
                style={{ backgroundColor: brand.primaryColor }}
              >
                {editing ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
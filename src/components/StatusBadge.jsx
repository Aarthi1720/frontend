export default function StatusBadge({ status }) {
  const map = {
    booked: 'bg-[#ccfbf1] text-[#0D9488]',        // Teal background
    cancelled: 'bg-[#fee2e2] text-[#FB7185]',      // Coral for cancellation
    completed: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-[#d1fae5] text-[#0D9488]',           // Soft green, teal text
    failed: 'bg-[#ffe4e6] text-[#FB7185]',         // Lighter coral
    refunded: 'bg-gray-200 text-gray-700',
    active: 'bg-[#ccfbf1] text-[#0D9488]',         // Teal
    expired: 'bg-[#ffe4e6] text-[#FB7185]',        // Coral
    inactive: 'bg-gray-100 text-gray-700'
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {label}
    </span>
  );
}


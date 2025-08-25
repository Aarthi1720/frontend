export default function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white p-4 rounded-lg shadow space-y-2">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}

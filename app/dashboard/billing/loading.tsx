export default function BillingLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse mb-2" />
      <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse mb-8" />
      <div className="rounded-lg border border-border bg-white p-8 space-y-6">
        <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-4 w-36 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-4 w-40 bg-gray-200 rounded-md animate-pulse" />
        </div>
        <div className="h-11 w-40 bg-gray-200 rounded-md animate-pulse" />
      </div>
    </div>
  );
}

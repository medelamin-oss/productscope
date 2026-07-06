export default function SubscribeLoading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse mb-2" />
      <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse mb-8" />
      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-white p-8 space-y-4">
            <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-4 w-40 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-11 w-full bg-gray-200 rounded-md animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

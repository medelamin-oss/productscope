export default function NewAnalysisLoading() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse mb-2" />
      <div className="h-4 w-72 bg-gray-200 rounded-md animate-pulse mb-8" />
      <div className="rounded-lg border border-border bg-white p-8 space-y-6">
        <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
        <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
        <div className="h-11 w-full bg-gray-200 rounded-md animate-pulse" />
      </div>
    </div>
  );
}

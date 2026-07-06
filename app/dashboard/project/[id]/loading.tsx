export default function ProjectLoading() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse mb-6" />
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-4 w-96 bg-gray-200 rounded-md mt-2 animate-pulse" />
      </div>
      <div className="rounded-lg border border-border bg-white p-16 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse mx-auto" />
        <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mt-6 mx-auto" />
        <div className="h-4 w-72 bg-gray-200 rounded-md animate-pulse mt-2 mx-auto" />
      </div>
    </div>
  );
}

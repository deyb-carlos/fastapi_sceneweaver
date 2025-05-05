<div className="mb-8 pt-10 flex justify-between items-center">
  <h1 className="text-6xl font-bold text-gray-900">Storyboards</h1>
  <div className="flex space-x-2">
    <button
      onClick={() => {
        setStoryboards([...storyboards].sort((a, b) => a.name.localeCompare(b.name)));
      }}
      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      title="Sort A-Z"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    </button>

    <button
      onClick={() => {
        setStoryboards(
          [...storyboards].sort(
            (a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
          )
        );
      }}
      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      title="Sort by Date"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </button>
  </div>
</div>

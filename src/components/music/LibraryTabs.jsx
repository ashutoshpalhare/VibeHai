const tabs = ['Playlists', 'Songs', 'Albums', 'Artists']

function LibraryTabs({ activeTab, onChange }) {
  return (
    <div className="flex items-center gap-6 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
            activeTab === tab
              ? 'border-[var(--vh-violet)] text-white'
              : 'border-transparent text-[var(--vh-muted)] hover:text-white'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

export default LibraryTabs
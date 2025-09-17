const SearchableSelect = ({ label, options = [], value, onChange }) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = options.filter((opt) => {
    const lbl = opt.label || ""; // ensure string
    return lbl.toLowerCase().includes(search.toLowerCase());
  });

  const selectedLabel = options.find((opt) => opt.value === value)?.label || "";

  return (
    <div className="col-span-2 relative">
      <label className="block mb-1 font-semibold">{label}</label>
      <input
        type="text"
        className="w-full border rounded-lg p-2"
        placeholder={`Search ${label}`}
        value={open ? search : selectedLabel}
        onFocus={() => setOpen(true)}
        onChange={(e) => setSearch(e.target.value)}
      />
      {open && (
        <div className="absolute z-10 bg-white border rounded w-full max-h-40 overflow-y-auto shadow">
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <div
                key={opt.value}
                className="p-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => {
                  onChange(opt.value);
                  setSearch(opt.label || "");
                  setOpen(false);
                }}
              >
                {opt.label || "Unnamed"}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

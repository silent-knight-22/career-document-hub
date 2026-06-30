import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { VAULT_CATEGORIES } from '../../services/vaultService';

export default function VaultToolbar({
  items,
  filterCat,
  setFilterCat,
  search,
  setSearch,
  sortBy,
  setSortBy,
  catCounts
}) {
  return (
    <>
      <div className="vault-cat-strip animate-fade-in-up" style={{ animationDelay: '40ms' }}>
        <button
          className={`vault-cat-chip ${filterCat === 'all' ? 'active' : ''}`}
          onClick={() => setFilterCat('all')}
        >
          All <span className="chip-count">{items.length}</span>
        </button>
        {VAULT_CATEGORIES.map((cat) => (
          catCounts[cat.id] ? (
            <button
              key={cat.id}
              className={`vault-cat-chip ${filterCat === cat.id ? 'active' : ''}`}
              style={filterCat === cat.id ? { borderColor: cat.color, color: cat.color, background: `${cat.color}12` } : {}}
              onClick={() => setFilterCat(filterCat === cat.id ? 'all' : cat.id)}
            >
              {cat.emoji} {cat.label} <span className="chip-count">{catCounts[cat.id]}</span>
            </button>
          ) : null
        ))}
      </div>

      <div className="vault-toolbar animate-fade-in-up" style={{ animationDelay: '80ms' }}>
        <div className="vault-search">
          <Search size={15} />
          <input
            className="vault-search-input"
            placeholder="Search by name, tag, or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className="vault-clear-search" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>
        <div className="vault-sort">
          <Filter size={14} />
          <select
            className="vault-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="name">Name A–Z</option>
            <option value="starred">Starred first</option>
            <option value="expiry">Expiring soon</option>
          </select>
        </div>
      </div>
    </>
  );
}

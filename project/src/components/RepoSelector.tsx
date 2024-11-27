import React from 'react';
import { Search } from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  description: string;
  private: boolean;
}

interface RepoSelectorProps {
  repositories: Repository[];
  onSelect: (repo: Repository | null) => void;
  selectedRepo: Repository | null;
}

export function RepoSelector({ repositories, onSelect, selectedRepo }: RepoSelectorProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <button
          onClick={() => onSelect(null)}
          className={`w-full text-left px-4 py-2 rounded-md ${
            !selectedRepo
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : 'hover:bg-gray-50 text-gray-700'
          } border transition-colors`}
        >
          Create New Repository
        </button>

        {filteredRepos.map((repo) => (
          <button
            key={repo.id}
            onClick={() => onSelect(repo)}
            className={`w-full text-left px-4 py-2 rounded-md ${
              selectedRepo?.id === repo.id
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'hover:bg-gray-50 text-gray-700'
            } border transition-colors`}
          >
            <div className="font-medium">{repo.name}</div>
            {repo.description && (
              <div className="text-sm text-gray-500 truncate">{repo.description}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
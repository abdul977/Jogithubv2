import React from 'react';
import { FolderGit2, Star, GitFork } from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  description: string;
  private: boolean;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

interface RepoListProps {
  repositories: Repository[];
}

export function RepoList({ repositories }: RepoListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {repositories.map((repo) => (
        <div
          key={repo.id}
          className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <FolderGit2 className="w-5 h-5 text-indigo-600 mr-2" />
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
              >
                {repo.name}
              </a>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              repo.private ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
            }`}>
              {repo.private ? 'Private' : 'Public'}
            </span>
          </div>
          
          {repo.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {repo.description}
            </p>
          )}

          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              <span>{repo.stargazers_count}</span>
            </div>
            <div className="flex items-center">
              <GitFork className="w-4 h-4 mr-1" />
              <span>{repo.forks_count}</span>
            </div>
            <span className="text-xs">
              Updated {new Date(repo.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
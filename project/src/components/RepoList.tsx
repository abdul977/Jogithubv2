import React from 'react';
import { FolderGit2, Star, GitFork } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';

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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {repositories.map((repo, index) => (
        <Card key={repo.id} delay={index * 0.1}>
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center"
              >
                <FolderGit2 className="w-5 h-5 text-indigo-600 mr-2" />
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700"
                >
                  {repo.name}
                </a>
              </motion.div>
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                repo.private 
                  ? 'bg-gray-100 text-gray-800' 
                  : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
              }`}>
                {repo.private ? 'Private' : 'Public'}
              </span>
            </div>
            
            {repo.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {repo.description}
              </p>
            )}

            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.1 }}
              >
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                <span>{repo.stargazers_count}</span>
              </motion.div>
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.1 }}
              >
                <GitFork className="w-4 h-4 mr-1 text-indigo-500" />
                <span>{repo.forks_count}</span>
              </motion.div>
              <span className="text-xs text-gray-400">
                Updated {new Date(repo.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
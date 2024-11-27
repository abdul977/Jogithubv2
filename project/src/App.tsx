import React, { useState, useEffect } from 'react';
import { Github, FileArchive } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { RepoForm } from './components/RepoForm';
import { RepoList } from './components/RepoList';
import { RepoSelector } from './components/RepoSelector';
import { GithubAuth } from './components/GithubAuth';
import { createGitHubRepo, uploadToGitHub, listRepositories } from './utils/github';

interface Repository {
  id: number;
  name: string;
  description: string;
  private: boolean;
  html_url: string;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [githubToken, setGithubToken] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  useEffect(() => {
    if (githubToken) {
      fetchRepositories();
    }
  }, [githubToken]);

  const fetchRepositories = async () => {
    setIsLoading(true);
    try {
      const repos = await listRepositories(githubToken);
      setRepositories(repos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError('');
    setSuccess('');
  };

  const handleAuth = (token: string) => {
    setGithubToken(token);
    setError('');
    setSuccess('');
  };

  const handleRepoSubmit = async (data: {
    name: string;
    description: string;
    isPrivate: boolean;
    initReadme: boolean;
  }) => {
    if (!githubToken) {
      setError('Please connect your GitHub account first');
      return;
    }

    if (!selectedFile) {
      setError('Please select a ZIP file first');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      let repoName = selectedRepo?.name || data.name;
      let repoUrl = '';

      if (!selectedRepo) {
        // Create new repository
        const repo = await createGitHubRepo(githubToken, data);
        repoUrl = repo.html_url;
        await uploadToGitHub(githubToken, data.name, selectedFile);
      } else {
        // Update existing repository
        const prUrl = await uploadToGitHub(githubToken, repoName, selectedFile, true);
        repoUrl = prUrl || selectedRepo.html_url;
      }

      // Refresh repositories list
      await fetchRepositories();

      // Reset form and show success
      setSelectedFile(null);
      setSuccess(
        selectedRepo
          ? 'Pull request created successfully!'
          : 'Repository created successfully!'
      );
      
      // Open the repository/PR in a new tab
      window.open(repoUrl, '_blank');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileArchive className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Zip-to-Repo Manager
              </h1>
            </div>
            {!githubToken && <GithubAuth onAuth={handleAuth} />}
            {githubToken && (
              <span className="text-sm text-green-600 flex items-center">
                <Github className="w-4 h-4 mr-2" />
                Connected to GitHub
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Upload Your Project
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Convert your ZIP file into a GitHub repository in seconds
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            <FileUploader onFileSelect={handleFileSelect} />

            {selectedFile && githubToken && (
              <div className="bg-white shadow sm:rounded-lg p-6">
                <div className="mb-8">
                  <div className="flex items-center space-x-3">
                    <FileArchive className="w-6 h-6 text-indigo-600" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Selected File
                    </h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Select Repository
                    </h3>
                    <RepoSelector
                      repositories={repositories}
                      selectedRepo={selectedRepo}
                      onSelect={setSelectedRepo}
                    />
                  </div>

                  {(!selectedRepo || selectedRepo) && (
                    <RepoForm
                      onSubmit={handleRepoSubmit}
                      isSubmitting={isUploading}
                      initialData={selectedRepo}
                      mode={selectedRepo ? 'update' : 'create'}
                    />
                  )}
                </div>
              </div>
            )}

            {githubToken && (
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Repositories</h3>
                {isLoading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <RepoList repositories={repositories} />
                )}
              </div>
            )}

            {isUploading && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-center text-gray-700">
                    {selectedRepo ? 'Creating pull request...' : 'Creating repository and uploading files...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
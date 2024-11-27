import React from 'react';
import { Github, Lock, Globe } from 'lucide-react';

interface Repository {
  name: string;
  description: string;
  private: boolean;
}

interface RepoFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    isPrivate: boolean;
    initReadme: boolean;
  }) => void;
  isSubmitting?: boolean;
  initialData?: Repository | null;
  mode?: 'create' | 'update';
}

export function RepoForm({ onSubmit, isSubmitting = false, initialData, mode = 'create' }: RepoFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      isPrivate: formData.get('visibility') === 'private',
      initReadme: formData.get('readme') === 'true',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {mode === 'create' && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Repository Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="awesome-project"
              pattern="[A-Za-z0-9._-]+"
              title="Only letters, numbers, hyphens, dots, and underscores are allowed"
              disabled={isSubmitting}
              defaultValue={initialData?.name}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Only letters, numbers, hyphens, dots, and underscores are allowed
          </p>
        </div>
      )}

      {mode === 'create' && (
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="mt-1">
            <textarea
              name="description"
              id="description"
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="A brief description of your project"
              disabled={isSubmitting}
              defaultValue={initialData?.description}
            />
          </div>
        </div>
      )}

      {mode === 'create' && (
        <fieldset disabled={isSubmitting}>
          <legend className="text-sm font-medium text-gray-700">Visibility</legend>
          <div className="mt-2 space-y-4">
            <div className="flex items-center">
              <input
                type="radio"
                name="visibility"
                value="public"
                id="public"
                defaultChecked={!initialData?.private}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="public" className="ml-3 flex items-center">
                <Globe className="h-5 w-5 text-gray-400 mr-2" />
                <span className="block text-sm font-medium text-gray-700">
                  Public
                </span>
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                name="visibility"
                value="private"
                id="private"
                defaultChecked={initialData?.private}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="private" className="ml-3 flex items-center">
                <Lock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="block text-sm font-medium text-gray-700">
                  Private
                </span>
              </label>
            </div>
          </div>
        </fieldset>
      )}

      {mode === 'create' && (
        <div className="flex items-center">
          <input
            type="checkbox"
            name="readme"
            id="readme"
            value="true"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            disabled={isSubmitting}
          />
          <label htmlFor="readme" className="ml-3 block text-sm font-medium text-gray-700">
            Initialize with README
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Github className="w-5 h-5 mr-2" />
        {isSubmitting
          ? mode === 'update'
            ? 'Creating Pull Request...'
            : 'Creating Repository...'
          : mode === 'update'
          ? 'Create Pull Request'
          : 'Create Repository'}
      </button>
    </form>
  );
}
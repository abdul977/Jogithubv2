import { Octokit } from '@octokit/rest';
import JSZip from 'jszip';
import { RateLimiter } from './rateLimiter';

const rateLimiter = new RateLimiter({
  maxRequests: 5000,
  perMinute: 60,
});

export async function listRepositories(token: string) {
  if (!token) {
    throw new Error('GitHub token is required');
  }

  const octokit = new Octokit({ auth: token });

  try {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100
    });
    return data;
  } catch (error: any) {
    console.error('Error fetching repositories:', error);
    throw new Error(error.message || 'Failed to fetch repositories');
  }
}

export async function createGitHubRepo(
  token: string,
  repoData: {
    name: string;
    description: string;
    isPrivate: boolean;
    initReadme: boolean;
  }
) {
  if (!token) {
    throw new Error('GitHub token is required');
  }

  const octokit = new Octokit({ auth: token });

  try {
    const { data } = await octokit.repos.createForAuthenticatedUser({
      name: repoData.name,
      description: repoData.description,
      private: repoData.isPrivate,
      auto_init: repoData.initReadme,
    });

    return data;
  } catch (error: any) {
    console.error('Error creating repository:', error);
    if (error.status === 422) {
      throw new Error('Repository name already exists or is invalid');
    }
    throw new Error(error.message || 'Failed to create repository');
  }
}

export async function uploadToGitHub(
  token: string,
  repoName: string,
  zipFile: File,
  existingRepo: boolean = false
): Promise<void> {
  if (!token) {
    throw new Error('GitHub token is required');
  }

  const octokit = new Octokit({ auth: token });
  
  try {
    // Only wait for repository creation if it's a new repo
    if (!existingRepo) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const zip = await JSZip.loadAsync(zipFile);
    const { data: user } = await octokit.users.getAuthenticated();

    // If updating existing repo, create a new branch
    let branchName = '';
    if (existingRepo) {
      const timestamp = new Date().getTime();
      branchName = `update-${timestamp}`;
      
      // Get default branch
      const { data: repo } = await octokit.repos.get({
        owner: user.login,
        repo: repoName,
      });
      
      // Get reference to HEAD
      const { data: ref } = await octokit.git.getRef({
        owner: user.login,
        repo: repoName,
        ref: `heads/${repo.default_branch}`,
      });
      
      // Create new branch
      await octokit.git.createRef({
        owner: user.login,
        repo: repoName,
        ref: `refs/heads/${branchName}`,
        sha: ref.object.sha,
      });
    }

    for (const [path, file] of Object.entries(zip.files)) {
      if (file.dir) continue;

      try {
        await rateLimiter.waitForToken();

        const content = await file.async('base64');
        
        try {
          // Try to get existing file
          const { data: existingFile } = await octokit.repos.getContent({
            owner: user.login,
            repo: repoName,
            path,
            ...(existingRepo && { ref: branchName }),
          });

          // Update existing file
          await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: repoName,
            path,
            message: `Update ${path}`,
            content,
            sha: (existingFile as any).sha,
            ...(existingRepo && { branch: branchName }),
          });
        } catch (e) {
          // File doesn't exist, create new file
          await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: repoName,
            path,
            message: `Add ${path}`,
            content,
            ...(existingRepo && { branch: branchName }),
          });
        }
      } catch (error: any) {
        console.error(`Error uploading ${path}:`, error);
        throw new Error(`Failed to upload ${path}: ${error.message}`);
      }
    }

    // If updating existing repo, create a pull request
    if (existingRepo) {
      const { data: pr } = await octokit.pulls.create({
        owner: user.login,
        repo: repoName,
        title: `Update repository content`,
        head: branchName,
        base: 'main',
        body: 'Updated repository content via Zip-to-Repo Manager',
      });

      // Return the PR URL
      return pr.html_url;
    }
  } catch (error: any) {
    console.error('Error processing ZIP file:', error);
    throw new Error(error.message || 'Failed to process ZIP file');
  }
}
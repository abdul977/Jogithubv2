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
  files: File[],
  existingRepo: boolean = false
): Promise<string | void> {
  if (!token) {
    throw new Error('GitHub token is required');
  }

  const octokit = new Octokit({ auth: token });
  
  try {
    if (!existingRepo) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const { data: user } = await octokit.users.getAuthenticated();

    let branchName = '';
    if (existingRepo) {
      const timestamp = new Date().getTime();
      branchName = `update-${timestamp}`;
      
      const { data: repo } = await octokit.repos.get({
        owner: user.login,
        repo: repoName,
      });
      
      const { data: ref } = await octokit.git.getRef({
        owner: user.login,
        repo: repoName,
        ref: `heads/${repo.default_branch}`,
      });
      
      await octokit.git.createRef({
        owner: user.login,
        repo: repoName,
        ref: `refs/heads/${branchName}`,
        sha: ref.object.sha,
      });
    }

    for (const file of files) {
      try {
        await rateLimiter.waitForToken();

        const arrayBuffer = await file.arrayBuffer();
        const base64Content = await arrayBufferToBase64(arrayBuffer);
        const path = file.name;

        try {
          const { data: existingFile } = await octokit.repos.getContent({
            owner: user.login,
            repo: repoName,
            path,
            ...(existingRepo && { ref: branchName }),
          });

          await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: repoName,
            path,
            message: `Update ${path}`,
            content: base64Content,
            sha: (existingFile as any).sha,
            ...(existingRepo && { branch: branchName }),
          });
        } catch (e) {
          await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: repoName,
            path,
            message: `Add ${path}`,
            content: base64Content,
            ...(existingRepo && { branch: branchName }),
          });
        }
      } catch (error: any) {
        console.error(`Error uploading ${file.name}:`, error);
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    if (existingRepo) {
      const { data: pr } = await octokit.pulls.create({
        owner: user.login,
        repo: repoName,
        title: `Update repository content`,
        head: branchName,
        base: 'main',
        body: 'Updated repository content via Zip-to-Repo Manager',
      });

      return pr.html_url;
    }
  } catch (error: any) {
    console.error('Error processing files:', error);
    throw new Error(error.message || 'Failed to process files');
  }
}

async function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
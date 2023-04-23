import request from "request";
import { configService } from "./config";
import { secretService } from "./secret";

export interface GitlabProjectDto {
  id: number;
  name: string;
}

export interface GitlabMergeRequestDto {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  state: string;
  created_at: string;
  updated_at: string;
  target_branch: string;
  source_branch: string;
  author: {
    id: number,
    username: string;
    name: string;
  },
  draft: boolean;
  work_in_progress: boolean;
  web_url: string;
  has_conflicts: boolean;
  blocking_discussions_resolved: boolean;
}

export interface GitlabProjectUserDto {
  id: number;
  username: string;
  name: string;
  state: string;
  avatar_url: string;
  web_url: string;
}

export class GitlabService {
  async getProjectIds() {
    const projectIdsString = await configService.get('gitlab.projectIds');
    return projectIdsString
      ?.split(',')
      .map(v => parseInt(v))
      .filter(v => !isNaN(v))
      || [];
  }

  async setProjectIds(projectIds: number[]) {
    await configService.set('gitlab.projectIds', projectIds.join(','));
  }

  async getProjectById(id: number) {
    const { gitlab: { token } } = secretService.getSecrets();
    return new Promise<GitlabProjectDto | undefined>(resolve => {
      request({
        url: `https://tools.ages.pucrs.br/api/v4/projects/${id}`,
        json: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }, (err, response, body) => {
        if (err) return;
        return resolve(body);
      })
    });
  }

  async getOpenMrsByProjectId(projectId: number) {
    const { gitlab: { token } } = secretService.getSecrets();
    return new Promise<GitlabMergeRequestDto[] | undefined>(resolve => {
      request({
        url: `https://tools.ages.pucrs.br/api/v4/projects/${projectId}/merge_requests?state=opened`,
        json: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }, (err, response, body) => {
        if (err) return;
        return resolve(body);
      })
    });
  }

  async getUsersByProjectId(projectId: number) {
    const { gitlab: { token } } = secretService.getSecrets();
    return new Promise<GitlabProjectUserDto[] | undefined>(resolve => {
      request({
        url: `https://tools.ages.pucrs.br/api/v4/projects/${projectId}/users`,
        json: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }, (err, response, body) => {
        if (err) return;
        return resolve(body);
      })
    });
  }
}

export const gitlabService = new GitlabService();

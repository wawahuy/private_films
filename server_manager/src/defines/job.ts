import { IJobTypes, EJobTypes, EJobTypePriority } from '../models/job';

export const SystemJobTypes: IJobTypes[] = [
  {
    job_id: EJobTypes.GET_LINK_DROPBOX,
    name: 'Get Link Dropbox',
    priority: EJobTypePriority.HIGH
  }
];

export enum EJobTypes {
  GET_LINK_DROPBOX
}

export enum EJobTypePriority {
  VERY_HIGH,
  HIGH,
  MEDIUM,
  LOW,
  VERY_LOW
}

export interface IJobTypes {
  job_id: number | EJobTypes;
  name: string;
  priority: EJobTypePriority;
  jobs?: (number | EJobTypes)[];
}

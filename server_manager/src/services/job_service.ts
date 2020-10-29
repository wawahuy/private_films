import avl from 'avl';
import { log } from '../core/log';
import { EJobTypes } from '../models/job';
import ModelJobTypes from '../schemas/job_types';

class JobService {
  private static _instance: JobService;
  private avlJobTypes: avl<number, avl<number, undefined>>;

  constructor() {
    this.avlJobTypes = new avl();
  }

  static get instance() {
    if (!JobService._instance) {
      JobService._instance = new JobService();
    }
    return JobService._instance;
  }

  public async establish() {
    const jobDB = await ModelJobTypes.find();
  }

  private contains(job: number, job_types: EJobTypes) {}
}

export default JobService;

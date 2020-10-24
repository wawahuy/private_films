import PidUsage from 'pidusage';

export interface IPidInfo {
  cpu: number;
  memory: number;
  memoryMB?: number;
  ppid: number;
  pid: number;
  ctime: number;
  elapsed: number;
  timestamp: number;
}

class SystemService {
  private static _instance: SystemService;

  static get instance() {
    if (!SystemService._instance) {
      SystemService._instance = new SystemService();
    }
    return SystemService._instance;
  }

  async info() {
    return new Promise<IPidInfo>((resolve, reject) => {
      PidUsage(process.pid, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        const info = result as IPidInfo;
        info.memoryMB = info.memory / 1024 / 1024;
        resolve(info);
      });
    });
  }
}

export default SystemService;

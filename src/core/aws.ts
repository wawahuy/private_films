import AwsSdk from 'aws-sdk';
import { v4 as uuidV4 } from 'uuid';
import { Readable } from 'stream';
import { GetObjectOutput } from 'aws-sdk/clients/s3';

interface AWSPath {
  /// id as filename, if null auto general
  id?: string;
  prefix?: string;

  // extension 'mp4, txt, ...'
  ext?: string;
}

const s3 = new AwsSdk.S3({
  endpoint: process.env.AWS_ENDPOINT,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  apiVersion: '2006-03-01'
});

const awsPath2String = (p: AWSPath | string): string => {
  if (typeof p === 'string') {
    return p;
  }

  const { id = uuidV4(), prefix = '', ext = '' } = p;
  const filename = `${id}.${ext.trim()}`;

  if (prefix !== '') {
    return prefix + '-' + filename;
  }

  return filename;
};

const awsLocation2Key = (location: string): string => {
  const sp = location.split('/');
  return sp.pop() as string;
};

const upload = async (
  stream: Readable,
  path: AWSPath | string,
  grantRead = true
): Promise<AwsSdk.S3.ManagedUpload.SendData> => {
  return new Promise((resolve, reject) => {
    const pathStr = awsPath2String(path);
    const params: AwsSdk.S3.PutObjectRequest = {
      Key: pathStr,
      Bucket: process.env.AWS_BUCKET as string,
      Body: stream,
      ACL: grantRead ? 'public-read' : ''
    };

    s3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

const remove = async (key: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const params: AwsSdk.S3.PutObjectRequest = {
      Key: key,
      Bucket: process.env.AWS_BUCKET as string
    };

    s3.deleteObject(params, (err) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
};

const read = async (key: string): Promise<GetObjectOutput> => {
  return new Promise((resolve, reject) => {
    const params: AwsSdk.S3.PutObjectRequest = {
      Key: key,
      Bucket: process.env.AWS_BUCKET as string
    };

    s3.getObject(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

export default {
  s3,
  awsPath2String,
  awsLocation2Key,
  upload,
  remove,
  read
};

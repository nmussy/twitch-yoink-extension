import CloudFront from 'aws-sdk/clients/cloudfront';
import S3 from 'aws-sdk/clients/s3';
import {config} from 'dotenv';

config();
const {BUCKET_NAME, DISTRIBUTION_ID} = process.env;

export class S3Storage {
  private cache: {[key: string]: string};
  private s3 = new S3();
  private cloudFront = new CloudFront();
  constructor(public mapKey = 'map.json', public usersKey = 'users.txt') {}

  async init(): Promise<void> {
    if (this.cache) {
      return;
    }

    try {
      await this.s3
        .headObject({Bucket: BUCKET_NAME, Key: this.mapKey})
        .promise();
    } catch {
      await this.uploadMap({});
    }
    try {
      await this.s3
        .headObject({Bucket: BUCKET_NAME, Key: this.usersKey})
        .promise();
    } catch {
      await this.uploadUsers([]);
    }

    const object = await this.s3
      .getObject({Bucket: BUCKET_NAME, Key: this.mapKey})
      .promise();

    this.cache = JSON.parse(object.Body.toString('utf8'));
  }

  private async update(): Promise<void> {
    if (!this.cache) {
      throw new Error('Was not init()');
    }
    await this.uploadMap();
    await this.uploadUsers();
  }

  async getKey(discordUserId: string): Promise<string> {
    await this.init();
    return this.cache[discordUserId];
  }

  async deleteKey(discordUserId: string): Promise<void> {
    await this.init();
    if (!this.cache[discordUserId]) {
      return;
    }
    delete this.cache[discordUserId];
    await this.update();
  }

  async setKey(discordUserId: string, twitchUsername: string): Promise<void> {
    await this.init();
    this.cache[discordUserId] = twitchUsername;
    await this.update();
  }

  private async uploadMap(map = this.cache): Promise<void> {
    await this.s3
      .upload({
        Bucket: BUCKET_NAME,
        Key: this.mapKey,
        Body: JSON.stringify(map),
        ContentType: 'application/json',
        ACL: 'private',
      })
      .promise();
  }

  private async uploadUsers(users = Object.values(this.cache)): Promise<void> {
    await this.s3
      .upload({
        Bucket: BUCKET_NAME,
        Key: this.usersKey,
        Body: users.join('\n'),
        ContentType: 'text/plain',
        ACL: 'public-read',
      })
      .promise();

    if (!DISTRIBUTION_ID) return;

    await this.cloudFront
      .createInvalidation({
        DistributionId: DISTRIBUTION_ID,
        InvalidationBatch: {
          CallerReference: new Date().getTime().toString(),
          Paths: {
            Quantity: 1,
            Items: [`/${this.usersKey}`],
          },
        },
      })
      .promise();
  }
}

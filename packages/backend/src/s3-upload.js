import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

const upload = new Upload({
  client: new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
    },
    region: process.env.S3_REGION,
  }),
  params: {
    Bucket: process.env.S3_BUCKET,
    Key: process.argv[2],
    Body: process.stdin,
  },
})

await upload.done()

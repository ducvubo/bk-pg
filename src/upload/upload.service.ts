import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import cloudinary from 'src/config/cloudinary.config'
import { ServerError } from 'src/utils/errorResponse'
import { s3 } from 'src/config/s3.config'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  async uploadImageToS3(file: Express.Multer.File) {
    try {
      const randomImageName =
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + uuidv4()

      const command = new PutObjectCommand({
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: randomImageName,
        Body: file.buffer,
        ContentType: 'image/jpeg'
      })

      const result = await s3.send(command)

      console.log('result:::::::', result)

      const singedUrl = new GetObjectCommand({
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: randomImageName
      })
      const url = await getSignedUrl(s3, singedUrl, { expiresIn: 3600 })

      console.log('url:::::::', url)

      return url
    } catch (error) {
      console.error('upload s3 error:', error) // In toàn bộ thông tin lỗi
      throw new ServerError(`Error uploading image to S3: ${error.message || error}`)
    }
  }
  async uploadImageFromLocal({ path, folderName }) {
    try {
      const result = await cloudinary.uploader.upload(path, {
        folder: folderName
      })
      return {
        image_cloud: result.secure_url,
        image_custom: await cloudinary.url(result.public_id, {
          height: 100,
          width: 100,
          fetch_format: 'jpg'
        })
      }
    } catch (error) {
      console.log('upload error: ' + JSON.stringify(error))
      throw new ServerError('Error uploading image')
    }
  }

  async uploadImageToCloudinay(file: Express.Multer.File, folderName: string) {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: folderName }, (error, result) => {
            if (error) reject(error)
            resolve(result)
          })
          .end(file.buffer)
      })

      return {
        image_cloud: result.secure_url,
        image_custom: await cloudinary.url(result.public_id, {
          height: 100,
          width: 100,
          fetch_format: 'jpg'
        })
      }
    } catch (error) {
      console.log('upload error: ' + JSON.stringify(error))
      throw new ServerError('Error uploading image')
    }
  }
}

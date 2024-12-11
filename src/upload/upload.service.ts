import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import cloudinary from 'src/config/cloudinary.config'
import { ServerError } from 'src/utils/errorResponse'

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  async uploadImageFromLocal({ path, folderName }: { path: string; folderName: string }): Promise<{
    image_cloud: string
    image_custom: string
  }> {
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

  async uploadImageToCloudinay(
    file: Express.Multer.File,
    folderName: string
  ): Promise<{
    image_cloud: string
    image_custom: string
  }> {
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

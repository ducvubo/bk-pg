import { Controller, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common'
import { UploadService } from './upload.service'
import { ResponseMessage } from 'src/decorator/customize'
import { FileInterceptor } from '@nestjs/platform-express'
import { MulterConfigService } from 'src/config/multer.config'

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  // @Post()
  // @ResponseMessage('Upload image from local')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadImageFromLocal(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
  //   if (!file) {
  //     throw new Error('No file provided')
  //   }
  //   return await this.uploadService.uploadImageFromLocal({
  //     path: file.path,
  //     folderName: req.headers.folder_type,
  //     image_name: file.filename
  //   })
  // }

  @Post()
  @ResponseMessage('Upload image')
  @UseInterceptors(FileInterceptor('file', new MulterConfigService().createMulterOptions()))
  async uploadImageFromLocal(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ): Promise<{
    image_cloud: string
    image_custom: string
  }> {
    if (!file) {
      throw new Error('No file provided')
    }

    // Upload file to Cloudinary directly
    return await this.uploadService.uploadImageToCloudinay(file, req.headers.folder_type || 'default')
  }

  // @Post('/bucket')
  // @ResponseMessage('Upload image')
  // @UseInterceptors(FileInterceptor('file', new MulterConfigService().createMulterOptions()))
  // async uploadImageFromS3(@UploadedFile() file: Express.Multer.File) {
  //   if (!file) {
  //     throw new Error('No file provided')
  //   }
  //   return await this.uploadService.uploadImageToS3(file)
  // }

  // @Post('/blog')
  // @ResponseMessage('Upload image from local')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadImageBlog(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
  //   if (!file) {
  //     throw new Error('No file provided')
  //   }
  //   return await this.uploadService.uploadImageBlog({
  //     path: file.path,
  //     folderName: req.headers.folder_type,
  //     image_name: file.filename
  //   })
  // }
}

import { Module } from '@nestjs/common';
import { TagBlogService } from './tag-blog.service';
import { TagBlogController } from './tag-blog.controller';

@Module({
  controllers: [TagBlogController],
  providers: [TagBlogService],
})
export class TagBlogModule {}

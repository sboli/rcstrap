import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuid } from 'uuid';
import { DB_TOKEN, Db, files } from '../../db';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class FilesController {
  constructor(@Inject(DB_TOKEN) private db: Db) {}

  @Post('v1/files')
  createFromUrl(@Body() body: { fileUrl: string; contentType?: string }) {
    const id = uuid();
    this.db
      .insert(files)
      .values({
        id,
        name: `file-${id}`,
        contentType: body.contentType ?? 'application/octet-stream',
        url: body.fileUrl,
      })
      .run();

    return { name: `files/${id}` };
  }

  @Post('upload/v1/files')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    const id = uuid();
    const dataDir = process.env.DB_PATH
      ? path.dirname(process.env.DB_PATH)
      : './data';
    const uploadsDir = path.join(dataDir, 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, id);
    fs.writeFileSync(filePath, file.buffer);

    this.db
      .insert(files)
      .values({
        id,
        name: file.originalname,
        contentType: file.mimetype,
        localPath: filePath,
        sizeBytes: file.size,
      })
      .run();

    return { name: `files/${id}` };
  }
}

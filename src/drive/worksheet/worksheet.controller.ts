import { Body, Controller, Get, HttpCode, Post, Put, Query } from '@nestjs/common';
import { WorksheetService } from '@/drive/worksheet/worksheet.service';
import { CreateWorksheetDto, CreateWorksheetResponseDto } from '@/drive/worksheet/dto/create-worksheet.dto';
import { UpdateWorksheetDto } from '@/drive/worksheet/dto/update-worksheet.dto';
import asyncPipe from '@/utils/asyncPipe';
import { UserService } from '@/drive/user/services/user.service';
import { FindWorksheetDto } from '@/drive/worksheet/dto/find-worksheet.dto';
import { Serialize } from '@/interceptors/serialize.interceptor';

@Controller('worksheet')
export class WorksheetController {
  constructor(
    private readonly worksheetService: WorksheetService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @HttpCode(200)
  @Serialize(CreateWorksheetResponseDto)
  async create(@Body() createWorksheetDto: CreateWorksheetDto) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.worksheetService.createWorksheetAndDrive.bind(this.worksheetService, createWorksheetDto),
    );
    const res = await pipeline(createWorksheetDto);
    return res.worksheet;
  }

  @Get()
  async findWithFilter(@Query() query: FindWorksheetDto, @Body() body: { user_id: string }) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.worksheetService.findWithFilter.bind(this.worksheetService, { ...query }),
    );
    return await pipeline(body);
  }

  @Get('starred')
  async findStarredWithFilter(@Query() query: FindWorksheetDto, @Body() body: { user_id: string }) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.worksheetService.findWithFilter.bind(this.worksheetService, { ...query, is_starred: true }),
    );
    return await pipeline(body);
  }

  @Get('trash')
  async findTrashWithFilter(@Query() query: FindWorksheetDto, @Body() body: { user_id: string }) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.worksheetService.findWithFilter.bind(this.worksheetService, { ...query, is_trash: true }),
    );
    return await pipeline(body);
  }

  @Put()
  @HttpCode(200)
  async updateWorksheet(@Body() body: UpdateWorksheetDto) {
    const pipeline = await asyncPipe(
      this.worksheetService.getWorksheet.bind(this.worksheetService),
      this.worksheetService.checkWorksheetOwner.bind(this.worksheetService, body.userId),
      this.worksheetService.updateWorksheet.bind(this.worksheetService, body),
      this.worksheetService.saveWorksheet.bind(this.worksheetService),
    );

    return await pipeline(body.worksheetId);
  }
}

import {
  Controller,
  Post,
  Body,
  HttpCode,
  Inject,
  Req,
  Patch,
  UseInterceptors,
  UploadedFiles,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '@/drive/user/services/user.service';
import { Public } from '@/decorators/public.decorator';
import asyncPipe from '@/utils/asyncPipe';
import { CreateUserDto, CreateUserResponseDto } from '@/drive/user/dto/create-user.dto';
import { SignInDto, SignInResponseDto } from '@/drive/user/dto/sign-in.dto';
import { User } from '@/drive/user/entities/user.entity';
import { Request } from 'express';
import { parseDuration } from '@/utils/parseDuration';
import AppConfig from '@/drive/app.config';
import { ConfigType } from '@nestjs/config';
import { Serialize } from '@/interceptors/serialize.interceptor';
import { SignOutDto } from '@/drive/user/dto/sign-out.dto';
import { RefreshDto } from '@/drive/user/dto/refresh.dto';
import { TokenService } from '@/drive/user/services/token.service';
import {
  RequestResetPasswordDto,
  UpdatePasswordDto,
  UpdateUserDto,
  UpdateUserResponseDto,
  VerifyResetPasswordDto,
} from '@/drive/user/dto/update-user.dto';
import { MailService } from '@/drive/mail/mail.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { S3Service } from '@/drive/s3/s3.service';
import { DeleteUserDto } from '@/drive/user/dto/delete-user.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly uploadService: S3Service,
    @Inject(AppConfig.KEY) private readonly config: ConfigType<typeof AppConfig>,
  ) {}

  /**
   * 새로운 유저 생성
   * 1. 중복 이메일 확인
   * 2. 패스워드 암호화
   * 3. 사용자 등록
   * 이미 가입된 이메일에는 409 상태코드 반환
   * @param createUserDto
   */
  @Public()
  @HttpCode(200)
  @Post('sign-up')
  @Serialize(CreateUserResponseDto)
  async createNewUser(@Body() createUserDto: CreateUserDto) {
    await this.userService.isAlreadyRegisteredEmail({ email: createUserDto.email }); // 이미 가입된 이메일 여부 확인
    const pipeline = await asyncPipe(
      this.userService.checkEmailVerification.bind(this.userService), // 이메일 인증 여부 확인
      this.userService.createPasswordHash.bind(this.userService), // 패스워드 암호화
      this.userService.createUser.bind(this.userService), // 실제 사용자 등록
      this.userService.createRootDriveFolder.bind(this.userService), // 사용자 루트 폴더 생성
      this.userService.updateUser.bind(this.userService),
      this.tokenService.generateAccessToken.bind(this.tokenService), // 프로필 수정용 1회 성 토큰 발행
    );
    const { user, accessToken, accessTokenExpiresAt } = await pipeline(createUserDto);
    return { ...user, accessToken, accessTokenExpiresAt };
  }

  /**
   * 로그인
   * 1. 이메일 기반 사용자 검색
   * 2. 비밀번호 일치 여부 확인
   * 3. 새로운 RefreshToken 생성 및 DB 저장
   * 4. 새로운 AccessToken 생성 및 반환
   * 5. Cookie를 통해 RefreshToken 첨부
   * 6. 응답을 통해 사용자의 데이터, AccessToken 반환
   * @param signInDto
   * @param req
   */
  @Public()
  @HttpCode(200)
  @Post('sign-in')
  @Serialize(SignInResponseDto)
  async signIn(@Body() signInDto: SignInDto, @Req() req: Request) {
    const pipeline = await asyncPipe<{ user: User; accessToken: string; accessTokenExpiresAt: Date }>(
      this.userService.findUser.bind(this.userService),
      this.userService.comparePassword.bind(this.userService, signInDto.password),
      this.tokenService.generateRefreshToken.bind(this.tokenService),
      this.tokenService.generateAccessToken.bind(this.tokenService),
    );

    const { user, accessToken, accessTokenExpiresAt } = await pipeline(signInDto);
    req.res.cookie('refreshToken', user.token.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: parseDuration(this.config.jwt.refreshExpire),
    });
    return { ...user, accessToken, accessTokenExpiresAt };
  }

  /**
   * 로그아웃
   * DB에 저장된 RefreshToken 값 제거 후 쿠키 제거
   * @param signOutDto
   * @param req
   */
  @HttpCode(204)
  @Post('sign-out')
  async signOut(@Body() signOutDto: SignOutDto, @Req() req: Request) {
    await this.tokenService.resetRefreshToken(signOutDto);
    req.res.clearCookie('refreshToken');
  }

  /**
   * 토큰 재발급
   * 1. RefreshToken 검증
   * 2. 새로운 RefreshToken 발급과 DB 저장
   * 3. 새로운 AccessToken 발급
   * 4. cookie를 통해 RefreshToken 첨부
   * 5. 응답을 통해 사용자 정보 및 AccessToken 반환
   * @param req
   */
  @HttpCode(200)
  @Post('refresh')
  @Serialize(RefreshDto)
  @Public()
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refreshToken'];
    const pipeline = await asyncPipe(
      this.tokenService.validateRefresh.bind(this.tokenService),
      this.tokenService.generateRefreshToken.bind(this.tokenService),
      this.tokenService.generateAccessToken.bind(this.tokenService),
    );

    const { user, accessToken, accessTokenExpiresAt } = await pipeline(refreshToken);
    req.res.cookie('refreshToken', user.token.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: parseDuration(this.config.jwt.refreshExpire),
    });
    return { ...user, accessToken, accessTokenExpiresAt };
  }

  /**
   * 패스워드 변경 메일 요청
   * 1. 사용자 정보 검색
   * 2. 해당 유저가 패스워드 변경 메일 요청 기록이 있는지 확인
   * 3. 패스워드 변경 토큰 발행
   * 4. 메일 전송
   * @param requestResetPasswordDto
   */
  @Public()
  @HttpCode(204)
  @Post('request-reset-password')
  async requestResetPassword(@Body() requestResetPasswordDto: RequestResetPasswordDto) {
    const pipeline = await asyncPipe(
      this.userService.findUser.bind(this.userService),
      this.tokenService.isAlreadyExistResetPassword.bind(this.tokenService),
      this.tokenService.setPasswordResetState.bind(this.tokenService),
      this.mailService.resetPassword.bind(this.mailService, requestResetPasswordDto.email),
    );
    return await pipeline(requestResetPasswordDto);
  }

  /**
   * 패스워드 변경 토큰 검증
   * @param verifyResetPasswordDto
   */
  @Public()
  @HttpCode(204)
  @Post('verification-reset-password')
  async verifyResetPassword(@Body() verifyResetPasswordDto: VerifyResetPasswordDto) {
    await this.tokenService.verifyResetToken(verifyResetPasswordDto);
  }

  /**
   * 패스워드 변경
   * 1. 패스워드 변경 토큰 재검증
   * 2. 입력한 패스워드 해싱
   * 3. 사용자 패스워드 업데이트
   * 4. 패스워드 변경 요청 제거
   * @param updatePasswordDto
   */
  @Public()
  @HttpCode(204)
  @Patch('update-password')
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    await this.tokenService.verifyResetToken({
      userId: updatePasswordDto.userId,
      passwordResetToken: updatePasswordDto.passwordResetToken,
    });
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.userService.createPasswordHash.bind(this.userService, updatePasswordDto.password),
      this.userService.updateUser.bind(this.userService),
      this.tokenService.deleteResetPasswordState.bind(this.tokenService),
    );
    await pipeline(updatePasswordDto);
  }

  /**
   * 사용자 프로필 설정
   * 1. 유저 검색
   * 2. 검색된 유저 객체에 name 설정
   * 3. 검색된 유저 객체에 프로필 이미지 경로 설정 (있을 경우)
   * 4. 변경된 유저 객체 실제 DB에 저장
   * 5. 초기 설정 여부 true 설정
   * @param updateUserDto
   * @param files
   */
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(200)
  @Patch('update-user')
  @Serialize(UpdateUserResponseDto)
  async updateUser(@Body() updateUserDto: UpdateUserDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    let newProfileImage:
      | { success: true; originalName: string; size: number; filePath: string }
      | {
          success: false;
          originalName: string;
          error: any;
        };
    if (files.length >= 1) {
      const fixedFiles = files.map((file) => ({
        ...file,
        originalname: Buffer.from(file.originalname, 'latin1').toString('utf-8'),
      }));
      newProfileImage = (
        await this.uploadService.uploadHandler('tms-drive-user-profile', fixedFiles, updateUserDto.userId)
      )[0];
    }
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.userService.setUserName.bind(this.userService, updateUserDto.name),
      this.userService.setUserProfileImg.bind(
        this.userService,
        files.length >= 1 && newProfileImage?.success ? newProfileImage.filePath : null,
      ),
      this.userService.setIsInitializedToTrue.bind(this.userService),
      this.userService.updateUser.bind(this.userService),
    );

    return await pipeline({ userId: updateUserDto.userId });
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Body() body: DeleteUserDto) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
      this.userService.setDeleteSurvey.bind(this.userService, body.deleteSurvey),
      this.userService.updateUser.bind(this.userService),
      this.userService.softDeleteUser.bind(this.userService),
    );
    return await pipeline(body);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async destroyUser() {
    const targetUser = await this.userService.findDestroyTarget();
    const result = { success: 0, fail: 0 };
    for (const user of targetUser) {
      if (await this.userService.destroyUser(user)) result.success++;
      else result.fail++;
    }
    return result;
  }
}

import { Controller, Post, Body, HttpCode, Req, Patch, Delete, HttpStatus, Get } from '@nestjs/common';
import { UserService } from '@/time/user/services/user.service';
import { Public } from '@/decorators/public.decorator';
import asyncPipe from '@/utils/asyncPipe';
import { CreateUserDto, CreateUserResponseDto } from '@/time/user/dto/create-user.dto';
import { SignInDto, SignInResponseDto, TokenServiceDto } from '@/time/user/dto/sign-in.dto';
import { Request } from 'express';
import { Serialize } from '@/interceptors/serialize.interceptor';
import { SignOutDto } from '@/time/user/dto/sign-out.dto';
import { RefreshResponseDto } from '@/time/user/dto/refresh.dto';
import { TokenService } from '@/time/user/services/token.service';
import { RequestResetPasswordDto, UpdatePasswordDto, VerifyResetPasswordDto } from '@/time/user/dto/update-user.dto';
import { MailService } from '@/time/mail/mail.service';
import { DeleteUserDto } from '@/time/user/dto/delete-user.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserDto, UserResponseDto } from '@/time/dtos/user.dto';
import { PresentService } from '@/time/present/present.service';

@Controller('/time/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly presentService: PresentService,
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
    const pipeline = await asyncPipe<CreateUserDto, TokenServiceDto>(
      this.userService.checkEmailVerification.bind(this.userService), // 이메일 인증 여부 확인
      this.userService.createPasswordHash.bind(this.userService), // 패스워드 암호화
      this.userService.createUser.bind(this.userService), // 실제 사용자 등록
      this.presentService.createPresent.bind(this.presentService), // 새로운 present 생성
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
  async signIn(@Body() signInDto: SignInDto) {
    const pipeline = await asyncPipe<SignInDto, TokenServiceDto>(
      this.userService.findUser.bind(this.userService),
      this.userService.comparePassword.bind(this.userService, signInDto.password),
      this.tokenService.generateRefreshToken.bind(this.tokenService),
      this.tokenService.generateAccessToken.bind(this.tokenService),
    );

    const { user, accessToken, accessTokenExpiresAt } = await pipeline(signInDto);
    return { ...user, accessToken, accessTokenExpiresAt, refreshToken: user.token.refresh_token };
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
  @Serialize(RefreshResponseDto)
  @Public()
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refresh-token'];
    const pipeline = await asyncPipe<string, TokenServiceDto>(
      this.tokenService.validateRefresh.bind(this.tokenService),
      this.tokenService.generateRefreshToken.bind(this.tokenService),
      this.tokenService.generateAccessToken.bind(this.tokenService),
    );

    const { user, accessToken, accessTokenExpiresAt } = await pipeline(refreshToken);
    return { ...user, accessToken, accessTokenExpiresAt, refreshToken: user.token.refresh_token };
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

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Body() body: DeleteUserDto) {
    const pipeline = await asyncPipe(
      this.userService.findUserByUserId.bind(this.userService),
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

  @Serialize(UserResponseDto)
  @Get('me')
  async function(@Body() body: UserDto) {
    const { user } = await this.userService.findUserByUserId(body);
    return user;
  }
}

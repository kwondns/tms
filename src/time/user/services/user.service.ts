import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { EmailAuth } from '@/time/user/entities/email-auth.entity';
import { User } from '@/time/user/entities/user.entity';
import { CreateUserDto } from '@/time/user/dto/create-user.dto';
import { VerificationEmailDto } from '@/time/user/dto/verification-email.dto';
import { Token } from '@/time/user/entities/token.entity';
import { EmailAuthService } from '@/time/user/services/email-auth.service';
import AppConfig from '@/app.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(EmailAuth) private readonly emailAuthRepo: Repository<EmailAuth>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Token) private readonly tokenRepo: Repository<Token>,
    private readonly emailAuthService: EmailAuthService,
    @Inject(AppConfig.KEY) private readonly config: ConfigType<typeof AppConfig>,
  ) {}

  /**
   * 이미 등록된 이메일 여부 확인
   * @param verificationEmail
   */
  async isAlreadyRegisteredEmail(verificationEmail: VerificationEmailDto) {
    const user = await this.userRepo.findOne({ where: { email: verificationEmail.email }, withDeleted: true });
    if (user) {
      if (user.deleted_at) throw new ConflictException({ message: '탈퇴 후 14일 동안 다시 가입할 수 없습니다.' });
      throw new ConflictException({ message: '이미 가입된 이메일입니다.' });
    }
    return verificationEmail;
  }

  /**
   * 이메일 인증 여부 확인
   * @param createUserDto
   */
  async checkEmailVerification(createUserDto: CreateUserDto) {
    const isEmailVerified = await this.emailAuthRepo.findOne({ where: { email: createUserDto.email } });
    if (!isEmailVerified?.is_verified) throw new BadRequestException('이메일 인증을 완료해 주세요');
    return createUserDto;
  }

  /**
   * 사용자 입력 암호 해싱하여 반환
   * @param createUserDto
   * @param newPassword
   */
  async createPasswordHash(createUserDto: Partial<CreateUserDto>, newPassword?: string) {
    createUserDto.password = bcrypt.hashSync(newPassword || createUserDto.password, this.SALT_ROUNDS);
    return createUserDto;
  }

  /**
   * 새로운 사용자 생성
   * 이용약관, 토큰 Entity 객체와 같이 User 객체 생성
   * 사용자 생성 후 이메일 인증 데이터 제거
   * @param createUserDto
   */
  async createUser(createUserDto: CreateUserDto) {
    const token = this.tokenRepo.create();
    const newUser = this.userRepo.create(createUserDto);
    newUser.token = token;
    await this.emailAuthService.deleteVerificationEmail({ email: newUser.email });
    return await this.userRepo.save(newUser);
  }

  /**
   * Email을 통한 사용자 검색
   * @param dto
   */
  async findUser<T extends Record<'email', string>>(dto: T) {
    const { email } = dto;
    try {
      return await this.userRepo.findOneOrFail({
        where: { email },
        relations: ['token', 'password_reset_token'],
      });
    } catch (e) {
      throw new BadRequestException('이메일 또는 비밀번호가 틀립니다.');
    }
  }

  /**
   * UserId를 통한 사용자 검색
   * @param dto
   */
  async findUserByUserId<T extends Record<'userId', string>>(dto: T): Promise<{ user: User } & Record<string, any>> {
    try {
      const { userId, ...others } = dto;
      const user = await this.userRepo.findOneOrFail({
        where: { user_id: userId },
        relations: ['token', 'password_reset_token'],
      });
      return { user, ...others };
    } catch (e) {
      throw new BadRequestException('올바르지 않은 요청입니다.');
    }
  }

  /**
   * 사용자 입력 암호와 DB의 해시된 암호와 비교
   * @param password
   * @param user
   */
  async comparePassword(password: string, user: User) {
    if (await bcrypt.compare(password, user.password)) return user;
    throw new BadRequestException('이메일 또는 비밀번호가 틀립니다.');
  }

  /**
   * 사용자 이름 설정
   * @param name
   * @param user
   */
  async setUserName(name: string, user: User) {
    user.name = name;
    return user;
  }

  async setIsInitializedToTrue(user: User) {
    user.is_initialized = true;
    return user;
  }

  /**
   * 사용자 정보 업데이트
   * @param user
   */
  async updateUser(user: User) {
    return await this.userRepo.save(user);
  }

  async softDeleteUser(user: User) {
    return this.userRepo.softRemove(user);
  }

  async findDestroyTarget() {
    const now = new Date();
    const offsetDate = new Date(now.getTime() - Number(this.config.timeline.fileDestroyDelay));

    return this.userRepo.find({ where: { deleted_at: LessThan(offsetDate) }, withDeleted: true });
  }

  async destroyUser(user: User) {
    try {
      await this.userRepo.delete(user);
      return true;
    } catch (e) {
      return false;
    }
  }
}

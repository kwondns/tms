import { BadRequestException, ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { EmailAuth } from '@/drive/user/entities/email-auth.entity';
import { User } from '@/drive/user/entities/user.entity';
import { CreateOAuthUserDto, CreateUserDto } from '@/drive/user/dto/create-user.dto';
import { VerificationEmailDto } from '@/drive/user/dto/verification-email.dto';
import { Agreement } from '@/drive/user/entities/agreement.entity';
import { Token } from '@/drive/user/entities/token.entity';
import { EmailAuthService } from '@/drive/user/services/email-auth.service';
import { UserStorage } from '@/drive/user/entities/user-storage.entity';
import { DriveCreateService } from '@/drive/drive/services/drive.create.service';
import AppConfig from '@/drive/app.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(EmailAuth) private readonly emailAuthRepo: Repository<EmailAuth>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Agreement) private readonly agreementRepo: Repository<Agreement>,
    @InjectRepository(Token) private readonly tokenRepo: Repository<Token>,
    @InjectRepository(UserStorage) private readonly userStorageRepo: Repository<UserStorage>,
    private readonly emailAuthService: EmailAuthService,
    @Inject(AppConfig.KEY) private readonly config: ConfigType<typeof AppConfig>,
    @Inject(forwardRef(() => DriveCreateService)) private readonly driveCreateService: DriveCreateService,
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
    const { serviceAgreement, userAgreement, ...user } = createUserDto;
    const agreement = this.agreementRepo.create({ service_agreement: serviceAgreement, user_agreement: userAgreement });
    const token = this.tokenRepo.create();
    const userStorage = this.userStorageRepo.create();
    const newUser = this.userRepo.create({ ...user, social: 0 });
    newUser.agreement = agreement;
    newUser.token = token;
    newUser.user_storage = userStorage;
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
        relations: ['token', 'password_reset_token', 'user_storage', 'file_system'],
      });
    } catch (e) {
      throw new BadRequestException('이메일 또는 비밀번호가 틀립니다.');
    }
  }

  /**
   * UserId를 통한 사용자 검색
   * @param dto
   */
  async findUserByUserId<T extends Record<'userId', string>>(dto: T): Promise<User> {
    try {
      return await this.userRepo.findOneOrFail({
        where: { user_id: dto.userId },
        relations: ['token', 'password_reset_token', 'worksheet', 'user_storage'],
      });
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

  /**
   * 사용자 프로필 이미지 변경
   * @param profileImg
   * @param user
   */
  async setUserProfileImg(profileImg: string, user: User) {
    if (profileImg) user.profile_img = profileImg;
    return user;
  }

  async setIsInitializedToTrue(user: User) {
    user.is_initialized = true;
    return user;
  }

  async setDeleteSurvey(deleteSurvey: string, user: User) {
    if (deleteSurvey) user.delete_survey = deleteSurvey;
    return user;
  }

  /**
   * 사용자 정보 업데이트
   * @param user
   */
  async updateUser(user: User) {
    return await this.userRepo.save(user);
  }

  /**
   * 소셜 로그인 회원가입 시 사용
   * 필수 값만 이용하여 저장
   * @param createOAuthUserDto
   */
  async createOAuthUser(createOAuthUserDto: CreateOAuthUserDto) {
    const token = this.tokenRepo.create();
    const userStorage = this.userStorageRepo.create();
    const newUser = this.userRepo.create(createOAuthUserDto);
    newUser.token = token;
    newUser.user_storage = userStorage;
    return await this.userRepo.save(newUser);
  }

  async createRootDriveFolder(user: User) {
    const rootFolder = await this.driveCreateService.saveFileSystemWithPermissions(
      {
        userId: user.user_id,
        name: user.user_id,
        parentId: null,
        is_root: true,
      },
      'folder',
    );
    user.root_folder = rootFolder.id;
    return user;
  }

  async updateUserStorage(user: User, size: number) {
    user.user_storage.storage_used = size;
    return await this.userRepo.save(user);
  }

  async softDeleteUser(user: User) {
    return this.userRepo.softRemove(user);
  }

  async findDestroyTarget() {
    const now = new Date();
    const offsetDate = new Date(now.getTime() - Number(this.config.fileDestroyDelay));

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

import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { Repository } from 'typeorm';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { TokenService } from './token.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private repo: Repository<Admin>,
    @Inject(forwardRef(() => TokenService))
    private tokenService: TokenService,
  ) {}

  async signUp(username: string, password: string) {
    const isExist = await this.repo.findOneBy({ username });
    if (isExist) throw new BadRequestException('Exist User!');
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const hashedPassword = `${salt}.${hash.toString('hex')}`;
    const admin = this.repo.create({ username, password: hashedPassword });
    return this.repo.save(admin);
  }

  findOne(adminId: string) {
    const admin = this.repo.findOneBy({ admin_id: adminId });
    if (!admin) throw new NotFoundException('Not Found User!');
    return admin;
  }

  update(admin: Admin) {
    return this.repo.save(admin);
  }

  async signIn(username: string, password: string) {
    const [admin] = await this.repo.find({ where: { username } });
    if (!admin) throw new NotFoundException('Not Found User!');

    const [salt, hashedPassword] = admin.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (hashedPassword !== hash.toString('hex')) throw new BadRequestException('Wrong Credential!');
    const payload = { sub: admin.admin_id, username: admin.username, v: admin.refresh_version + 1 };
    const result = await this.tokenService.generateRefresh(payload);
    const accessToken = await this.tokenService.generateAccess(payload);

    return { ...result, accessToken };
  }

  async refresh(refreshToken: string) {
    const payload = await this.tokenService.validateRefresh(refreshToken);
    payload.v += 1;
    const newRefreshToken = await this.tokenService.generateRefresh(payload);
    const newAccessToken = await this.tokenService.generateAccess(payload);
    return { newRefreshToken, newAccessToken };
  }

  async signOut(adminId: string) {
    const admin = await this.repo.findOneBy({ admin_id: adminId });
    if (!admin) throw new BadRequestException();
    admin.refresh_version += 1;
    return;
  }
}

import { CanActivate, Injectable } from '@nestjs/common';

// TODO 퍼미션 추가
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor() {}
  async canActivate() {
    return true;
  }
}

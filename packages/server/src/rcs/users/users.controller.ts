import { Controller, Post, Body } from '@nestjs/common';
import { ConfigService } from '../../config';

@Controller('v1')
export class UsersController {
  constructor(private readonly config: ConfigService) {}

  @Post('users:batchGet')
  batchGet(@Body() body: { users: string[] }) {
    const caps = this.config.get('defaultCapabilities');
    const features: string[] = Object.entries(caps)
      .filter(([, v]) => v)
      .map(([k]) => k);

    return {
      reachableUsers: (body.users ?? []).map((phone: string) => ({
        name: `phones/${phone}`,
        features,
      })),
    };
  }
}

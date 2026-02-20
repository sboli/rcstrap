import { Controller, Get, Param } from '@nestjs/common';
import { ConfigService } from '../../config';
import { RcsCapabilities } from '../../common/types';

@Controller('v1/phones/:phone/capabilities')
export class CapabilitiesController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  get(@Param('phone') phone: string) {
    const caps: RcsCapabilities = this.config.get('defaultCapabilities');

    const features: string[] = [];
    if (caps.RICHCARD_STANDALONE) features.push('RICHCARD_STANDALONE');
    if (caps.RICHCARD_CAROUSEL) features.push('RICHCARD_CAROUSEL');
    if (caps.ACTION_CREATE_CALENDAR_EVENT) features.push('ACTION_CREATE_CALENDAR_EVENT');
    if (caps.ACTION_DIAL) features.push('ACTION_DIAL');
    if (caps.ACTION_OPEN_URL) features.push('ACTION_OPEN_URL');
    if (caps.ACTION_SHARE_LOCATION) features.push('ACTION_SHARE_LOCATION');
    if (caps.ACTION_VIEW_LOCATION) features.push('ACTION_VIEW_LOCATION');

    return { features };
  }
}

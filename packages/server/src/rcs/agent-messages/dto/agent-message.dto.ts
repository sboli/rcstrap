import {
  IsString,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsArray,
  ArrayMaxSize,
  MaxLength,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Suggestion } from './suggestions.dto';
import { RichCard } from './rich-card.dto';
import {
  ExactlyOneContentTypeConstraint,
  TtlExpireMutuallyExclusiveConstraint,
  MaxPayloadSizeConstraint,
} from '../../validation/rcs-validators';

export enum TrafficType {
  AUTHENTICATION = 'AUTHENTICATION',
  TRANSACTION = 'TRANSACTION',
  PROMOTION = 'PROMOTION',
  SERVICEREQUEST = 'SERVICEREQUEST',
  ACKNOWLEDGEMENT = 'ACKNOWLEDGEMENT',
}

export class ContentInfo {
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  forceRefresh?: boolean;
}

export class CreateAgentMessageDto {
  @IsOptional()
  @IsString()
  messageId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3072)
  text?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => RichCard)
  richCard?: RichCard;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContentInfo)
  contentInfo?: ContentInfo;

  @IsOptional()
  @IsString()
  uploadedRbmFile?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(11)
  @ValidateNested({ each: true })
  @Type(() => Suggestion)
  suggestions?: Suggestion[];

  @IsOptional()
  @IsEnum(TrafficType)
  trafficType?: TrafficType;

  @IsOptional()
  @IsString()
  ttl?: string;

  @IsOptional()
  @IsString()
  expireTime?: string;

  @Validate(ExactlyOneContentTypeConstraint)
  _contentCheck?: any;

  @Validate(TtlExpireMutuallyExclusiveConstraint)
  _ttlCheck?: any;

  @Validate(MaxPayloadSizeConstraint)
  _sizeCheck?: any;
}

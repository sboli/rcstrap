import {
  IsString,
  MaxLength,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsUrl,
  IsDateString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DialAction {
  @IsString()
  phoneNumber: string;
}

export class LatLong {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class ViewLocationAction {
  @IsOptional()
  @ValidateNested()
  @Type(() => LatLong)
  latLong?: LatLong;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  query?: string;
}

export class CreateCalendarEventAction {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}

export class OpenUrlAction {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  application?: string;

  @IsOptional()
  @IsString()
  webviewViewMode?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ShareLocationAction {}

@ValidatorConstraint({ name: 'exactlyOneAction', async: false })
class ExactlyOneActionConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    const actions = [
      'dialAction',
      'viewLocationAction',
      'createCalendarEventAction',
      'openUrlAction',
      'shareLocationAction',
    ];
    return actions.filter((a) => obj[a] !== undefined).length <= 1;
  }
  defaultMessage() {
    return 'At most one action type must be specified per suggested action';
  }
}

export class SuggestedAction {
  @IsString()
  @MaxLength(25)
  text: string;

  @IsString()
  postbackData: string;

  @IsOptional()
  @IsString()
  fallbackUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DialAction)
  dialAction?: DialAction;

  @IsOptional()
  @ValidateNested()
  @Type(() => ViewLocationAction)
  viewLocationAction?: ViewLocationAction;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCalendarEventAction)
  createCalendarEventAction?: CreateCalendarEventAction;

  @IsOptional()
  @ValidateNested()
  @Type(() => OpenUrlAction)
  openUrlAction?: OpenUrlAction;

  @IsOptional()
  @ValidateNested()
  @Type(() => ShareLocationAction)
  shareLocationAction?: ShareLocationAction;

  @Validate(ExactlyOneActionConstraint)
  _actionCheck?: any;
}

export class SuggestedReply {
  @IsString()
  @MaxLength(25)
  text: string;

  @IsString()
  postbackData: string;
}

@ValidatorConstraint({ name: 'exactlyOneOfReplyOrAction', async: false })
class ExactlyOneOfReplyOrActionConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    const hasReply = obj.reply !== undefined;
    const hasAction = obj.action !== undefined;
    return (hasReply || hasAction) && !(hasReply && hasAction);
  }
  defaultMessage() {
    return 'Each suggestion must have exactly one of reply or action';
  }
}

export class Suggestion {
  @IsOptional()
  @ValidateNested()
  @Type(() => SuggestedReply)
  reply?: SuggestedReply;

  @IsOptional()
  @ValidateNested()
  @Type(() => SuggestedAction)
  action?: SuggestedAction;

  @Validate(ExactlyOneOfReplyOrActionConstraint)
  _check?: any;
}

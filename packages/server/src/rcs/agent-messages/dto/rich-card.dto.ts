import {
  IsString,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  MaxLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Suggestion } from './suggestions.dto';

export enum MediaHeight {
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  TALL = 'TALL',
}

export enum CardOrientation {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL',
}

export enum CardWidth {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
}

export enum ThumbnailImageAlignment {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export class MediaContentInfo {
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  forceRefresh?: boolean;
}

export class Media {
  @IsEnum(MediaHeight)
  height: MediaHeight;

  @ValidateNested()
  @Type(() => MediaContentInfo)
  contentInfo: MediaContentInfo;
}

@ValidatorConstraint({ name: 'cardContentRequired', async: false })
class CardContentRequiredConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    return !!(obj.title || obj.description || obj.media);
  }
  defaultMessage() {
    return 'CardContent requires at least one of: title, description, media';
  }
}

export class CardContent {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Media)
  media?: Media;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => Suggestion)
  suggestions?: Suggestion[];

  @Validate(CardContentRequiredConstraint)
  _contentCheck?: any;
}

@ValidatorConstraint({ name: 'horizontalRequiresMedia', async: false })
class HorizontalRequiresMediaConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    if (obj.orientation === CardOrientation.HORIZONTAL) {
      return !!obj.cardContent?.media;
    }
    return true;
  }
  defaultMessage() {
    return 'Horizontal cards require media';
  }
}

export class StandaloneCard {
  @IsEnum(CardOrientation)
  cardOrientation: CardOrientation;

  @IsOptional()
  @IsEnum(ThumbnailImageAlignment)
  thumbnailImageAlignment?: ThumbnailImageAlignment;

  @ValidateNested()
  @Type(() => CardContent)
  cardContent: CardContent;

  @Validate(HorizontalRequiresMediaConstraint)
  _orientationCheck?: any;
}

@ValidatorConstraint({ name: 'carouselCardCount', async: false })
class CarouselCardCountConstraint implements ValidatorConstraintInterface {
  validate(cards: CardContent[]) {
    return cards && cards.length >= 2 && cards.length <= 10;
  }
  defaultMessage() {
    return 'Carousel must have between 2 and 10 cards';
  }
}

@ValidatorConstraint({ name: 'totalSuggestionsMax11', async: false })
class TotalSuggestionsMax11Constraint implements ValidatorConstraintInterface {
  validate(cards: CardContent[]) {
    if (!cards) return true;
    const total = cards.reduce(
      (sum, c) => sum + (c.suggestions?.length ?? 0),
      0,
    );
    return total <= 11;
  }
  defaultMessage() {
    return 'Total suggestions across all carousel cards must not exceed 11';
  }
}

export class CarouselCard {
  @IsEnum(CardWidth)
  cardWidth: CardWidth;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardContent)
  @Validate(CarouselCardCountConstraint)
  @Validate(TotalSuggestionsMax11Constraint)
  cardContents: CardContent[];
}

export class RichCard {
  @IsOptional()
  @ValidateNested()
  @Type(() => StandaloneCard)
  standaloneCard?: StandaloneCard;

  @IsOptional()
  @ValidateNested()
  @Type(() => CarouselCard)
  carouselCard?: CarouselCard;
}

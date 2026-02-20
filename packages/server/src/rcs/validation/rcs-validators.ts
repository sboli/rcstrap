import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isE164Phone', async: false })
export class IsE164PhoneConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    return /^\+[1-9]\d{1,14}$/.test(value);
  }
  defaultMessage() {
    return 'Phone number must be in E.164 format (e.g., +15551234567)';
  }
}

export function IsE164Phone(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsE164PhoneConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'maxPayloadSize', async: false })
export class MaxPayloadSizeConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const size = Buffer.byteLength(JSON.stringify(args.object), 'utf8');
    return size <= 250 * 1024;
  }
  defaultMessage() {
    return 'Message payload must not exceed 250KB';
  }
}

export function MaxPayloadSize(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: MaxPayloadSizeConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'exactlyOneContentType', async: false })
export class ExactlyOneContentTypeConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    const fields = ['text', 'richCard', 'contentInfo', 'uploadedRbmFile'];
    const set = fields.filter((f) => obj[f] !== undefined && obj[f] !== null);
    return set.length === 1;
  }
  defaultMessage() {
    return 'Exactly one of text, richCard, contentInfo, or uploadedRbmFile must be provided';
  }
}

@ValidatorConstraint({ name: 'ttlExpireMutuallyExclusive', async: false })
export class TtlExpireMutuallyExclusiveConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as any;
    const hasTtl = obj.ttl !== undefined && obj.ttl !== null;
    const hasExpire = obj.expireTime !== undefined && obj.expireTime !== null;
    return !(hasTtl && hasExpire);
  }
  defaultMessage() {
    return 'ttl and expireTime are mutually exclusive';
  }
}

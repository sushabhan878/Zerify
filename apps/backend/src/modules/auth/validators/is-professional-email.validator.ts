import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { isProfessionalEmail } from '../../../common/utils/email-domain.util';

export function IsProfessionalEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isProfessionalEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'Brands must register with an official business email (e.g. name@company.com). Public mail domains such as @gmail.com or @yahoo.com are not permitted.',
        ...validationOptions,
      },
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return isProfessionalEmail(value);
        },
      },
    });
  };
}

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { toMinor } from '../money.util';

/**
 * Validates that a value is a positive monetary amount expressible in the
 * currency's minor unit (TRD §30). Accepts numbers or decimal strings.
 */
@ValidatorConstraint({ name: 'positiveMoney', async: false })
export class PositiveMoneyConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value !== 'number' && typeof value !== 'string') return false;

    try {
      const minor = toMinor(value, 'INR');
      return minor > 0;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a positive monetary amount`;
  }
}

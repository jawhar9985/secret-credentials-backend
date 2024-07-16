import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsArrayStartsWithAZConstraint implements ValidatorConstraintInterface {
  validate(array: any[], args: ValidationArguments) {
    if (!Array.isArray(array)) return false;
    const regex = /^[A-Za-z]/;
    return array.every(value => typeof value === 'string' && regex.test(value));
  }

  defaultMessage(args: ValidationArguments) {
    return 'Each value in the array must start with a letter (A-Z, a-z)';
  }
}

export function IsArrayStartsWithAZ(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsArrayStartsWithAZConstraint,
    });
  };
}

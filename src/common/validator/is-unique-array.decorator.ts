import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsUniqueArrayConstraint implements ValidatorConstraintInterface {
  validate(array: any[], args: ValidationArguments) {
    if (!Array.isArray(array)) return false;
    const uniqueValues = new Set(array);
    return uniqueValues.size === array.length;
  }

  defaultMessage(args: ValidationArguments) {
    return 'All values in the array must be unique';
  }
}

export function IsUniqueArray(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueArrayConstraint,
    });
  };
}

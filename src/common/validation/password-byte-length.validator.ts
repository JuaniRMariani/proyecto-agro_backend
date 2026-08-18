import { BadRequestException } from '@nestjs/common';
import { registerDecorator, type ValidationOptions } from 'class-validator';

export const BCRYPT_MAX_PASSWORD_BYTES = 72;

export function isBcryptPasswordLengthValid(value: string): boolean {
  return Buffer.byteLength(value, 'utf8') <= BCRYPT_MAX_PASSWORD_BYTES;
}

export function assertBcryptPasswordLength(value: string): void {
  if (!isBcryptPasswordLengthValid(value)) {
    throw new BadRequestException(
      `La contrasena no puede superar ${BCRYPT_MAX_PASSWORD_BYTES} bytes UTF-8`,
    );
  }
}

export function MaxBcryptPasswordBytes(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    registerDecorator({
      name: 'maxBcryptPasswordBytes',
      target: target.constructor,
      propertyName: String(propertyKey),
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return (
            typeof value === 'string' && isBcryptPasswordLengthValid(value)
          );
        },
        defaultMessage(): string {
          return `La contrasena no puede superar ${BCRYPT_MAX_PASSWORD_BYTES} bytes UTF-8`;
        },
      },
    });
  };
}

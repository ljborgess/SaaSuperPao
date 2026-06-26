import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { isValidCpf, isValidCnpj } from '@superpao/shared-utils'

@ValidatorConstraint({ name: 'isCpfCnpj', async: false })
export class IsCpfCnpjConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value === null || value === undefined || value === '') return true
    if (typeof value !== 'string') return false
    const digits = value.replace(/\D/g, '')
    if (digits.length === 11) return isValidCpf(value)
    if (digits.length === 14) return isValidCnpj(value)
    return false
  }

  defaultMessage(): string {
    return 'CPF ou CNPJ inválido'
  }
}

export function IsCpfCnpj(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsCpfCnpjConstraint,
    })
  }
}

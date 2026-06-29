// shared/domain/value-objects/phone.vo.spec.ts
import { Phone } from './phone.vo';
import { InvalidPhoneException } from '../exceptions/invalid-phone.exception';

describe('Phone', () => {
  it('should accept valid phone numbers', () => {
    expect(Phone.isValid('04141234567')).toBe(true);
    expect(Phone.isValid('+584141234567')).toBe(true);
    expect(Phone.isValid('4141234567')).toBe(true);
    expect(Phone.isValid('04241234567')).toBe(true);
    expect(Phone.isValid('04161234567')).toBe(true);
    expect(Phone.isValid('04261234567')).toBe(true);
    expect(Phone.isValid('04121234567')).toBe(true);
    expect(Phone.isValid('04221234567')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(Phone.isValid('1234')).toBe(false);
    expect(Phone.isValid('+581234567890')).toBe(false);
    expect(Phone.isValid('0414123456')).toBe(false); // 9 dígitos
    expect(Phone.isValid('041412345678')).toBe(false); // 11 dígitos
    expect(Phone.isValid('04131234567')).toBe(false); // prefijo inválido
  });

  it('should normalize to E.164 format', () => {
    const phone = Phone.create('04141234567');
    expect(phone.toString()).toBe('+584141234567');
  });

  it('should throw InvalidPhoneException for bad format', () => {
    expect(() => Phone.create('1234')).toThrow(InvalidPhoneException);
  });
});

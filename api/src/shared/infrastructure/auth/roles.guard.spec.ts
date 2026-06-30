// src/shared/infrastructure/auth/roles.guard.spec.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * RolesGuard — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el guardia de roles restrinja el acceso
 * según los roles requeridos.
 *
 * @module test/roles.guard.spec
 */
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const mockContext = (user: any, handlerRoles: string[]): ExecutionContext => {
    const handler = jest.fn();
    const cls = jest.fn();
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(handlerRoles.length ? handlerRoles : undefined);
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => handler,
      getClass: () => cls,
    } as any;
  };

  it('should allow if no roles required', () => {
    const ctx = mockContext({ role: 'passenger' }, []);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow if user role matches', () => {
    const ctx = mockContext({ role: 'super_admin' }, ['super_admin']);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should deny if user role does not match', () => {
    const ctx = mockContext({ role: 'passenger' }, ['super_admin']);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('should deny if user is undefined', () => {
    const ctx = mockContext(undefined, ['super_admin']);
    expect(guard.canActivate(ctx)).toBe(false);
  });
});

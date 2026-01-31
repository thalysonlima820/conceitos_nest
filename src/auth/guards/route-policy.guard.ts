import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUEST_TOKEN_PAYLOAD_KEY, ROUTE_POLICY_KEY } from '../auth.constants';
import { RoutePolicy } from '../enum/route-policy.enum';

@Injectable()
export class RoutePolicyGuard implements CanActivate {
  constructor(private readonly refector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const routePolicyRequireed = this.refector.get<RoutePolicy | undefined>(
      ROUTE_POLICY_KEY,
      context.getHandler(),
    );

    if (!routePolicyRequireed) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tokenPauyoad = request[REQUEST_TOKEN_PAYLOAD_KEY];

    if (!tokenPauyoad) {
      throw new UnauthorizedException(
        `rota requer permissao ${routePolicyRequireed}`,
      );
    }

    const { pessoa } = tokenPauyoad;

    const policies: string[] = pessoa?.RoutePolicies ?? [];

    if (!policies.includes(routePolicyRequireed)) {
      throw new UnauthorizedException(
        `rota requer permissao ${routePolicyRequireed}`,
      );
    }

    return true;
  }
}

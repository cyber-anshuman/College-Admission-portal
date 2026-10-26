import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import * as crypto from 'crypto';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, throttler } = requestProps;
    const { req } = this.getRequestResponse(context);
    const isLogin = req.method === 'POST' && req.path?.endsWith('/auth/login');

    // Restrict login_ip and login_ip_email throttlers strictly to POST /auth/login
    if ((throttler.name === 'login_ip' || throttler.name === 'login_ip_email') && !isLogin) {
      return true;
    }

    return super.handleRequest(requestProps);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ips?.length ? req.ips[0] : req.ip;
  }

  protected generateKey(context: ExecutionContext, suffix: string, name: string): string {
    const { req } = this.getRequestResponse(context);
    if (name === 'login_ip_email') {
      const email =
        typeof req.body?.email === 'string'
          ? req.body.email.slice(0, 254).toLowerCase().trim()
          : 'anonymous';
      const hash = crypto.createHash('sha256').update(`${suffix}_${email}`).digest('hex');
      return super.generateKey(context, hash, name);
    }
    return super.generateKey(context, suffix, name);
  }
}

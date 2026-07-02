// api/src/shared/interfaces/pipes/sanitize.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import xss from 'xss';

@Injectable()
export class SanitizePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: any, _metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return xss(value, {
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script', 'style'],
      });
    }
    if (typeof value === 'object' && value !== null) {
      for (const key of Object.keys(value)) {
        if (typeof value[key] === 'string') {
          value[key] = xss(value[key], {
            whiteList: {},
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script', 'style'],
          });
        }
      }
    }
    return value;
  }
}

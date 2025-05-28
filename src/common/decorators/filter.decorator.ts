import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Filter = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const filterParam = request.query.filter;
    return data ? filterParam?.[data] : filterParam;
  },
);

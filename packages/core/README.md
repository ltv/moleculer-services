# @ltv/moleculer-services-core

## Dependencies

| name      | version | description | requires install |
| :-------- | :------ | :---------- | :--------------- |
| moleculer | 0.14.8  | moleculer   | YES              |

## Modules

### errors

- BaseError
- AppError

#### Usage

```ts
import { BaseError, AppError } from '@ltv/moleculer-core';

return AppError.invalidRequest().reject();
```

#### Built-in Errors

- invalidRequest
- invalidRequestError
- invalidResponseType
- forbidden
- badRequest
- notFound
- rateLimitExceeded

#### Extends Error

```ts
import { BaseError, IError } from '@ltv/moleculer-core';

const DbErrorMap: { [key: string]: IError } = {
  NOT_FOUND_ENTITY: {
    type: 'NOT_FOUND_ENTITY',
    message: 'Could not found entity with provided id',
  },
};

export class DatabaseError extends BaseError {
  constructor(message: string, code: number, type: string) {
    super(message, code, type);
    this.name = 'DatabaseError';
  }

  public static notFoundEntity(message?: IError): DatabaseError {
    return this.createError(DbErrorMap.NOT_FOUND_ENTITY, message);
  }
}
```

### middlewares

#### check-permissions

> Used for checking permissions of each action Ex: `permissions: ['post.create']`

- Apply middlewares in `moleculer.config.(ts|js)`

```ts
import { CheckPermissionsMiddleware } from '@ltv/moleculer-core';

const brokerConfig: BrokerOptions = {
  // ...
  // Register custom middlewares
  const options = { acl, roles }; // options is optional
  middlewares: [CheckPermissionsMiddleware(options)],
  // ...
};

export = brokerConfig;
```

- Use in actions

```javascript
module.exports = {
  name: 'post',
  actions: {
    create: {
      permissions: ['post.create']
      handler(ctx) {}
    }
  }
}
```

#### find-entity

> Used for pre-fetch entity by `id`

- Apply middlewares in `moleculer.config.(ts|js)`

```ts
import { FindEntityMiddleware } from '@ltv/moleculer-core';

const brokerConfig: BrokerOptions = {
  // ...
  // Register custom middlewares
  middlewares: [FindEntityMiddleware()],
  // ...
};

export = brokerConfig;
```

- Use in actions

```javascript
module.exports = {
  name: 'post',
  actions: {
    update: {
      needEntity: true,
      params: {
        id: 'string',
        toBeUpdate: 'object'
      }
      handler(ctx) {
        const { entity } = ctx.locals;
        const { id, toBeUpdate } = ctx.params;
        entity = { ...toBeUpdate };
        return this.adapter.updateById(id, entity);
      }
    }
  }
}
```

#### heath-check

> Used for checking heath of service

- Apply middlewares in `moleculer.config.(ts|js)`

```ts
import { CreateHealthCheckMiddleware } from '@ltv/moleculer-core';

const {
  HEALTH_CHECK_READINESS_PATH,
  HEALTH_CHECK_LIVENESS_PATH,
  HEALTH_CHECK_PORT,
} = process.env;
const healthCheckOpts = {
  port: +HEALTH_CHECK_PORT || 3001,
  readiness: {
    path: HEALTH_CHECK_READINESS_PATH || '/ready',
  },
  liveness: {
    path: HEALTH_CHECK_LIVENESS_PATH || '/live',
  },
};

const brokerConfig: BrokerOptions = {
  // ...
  // Register custom middlewares
  middlewares: [CreateHealthCheckMiddleware(healthCheckOpts)],
  // ...
};

export = brokerConfig;
```

### mixins

> // TODO: Update later

### utils

> // TODO: Update later

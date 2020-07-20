# Moleculer Auth Service

## Features

- [ ] Login with Username / Password
- [ ] JWT Token (with short-expired time)
- [ ] Renew JWT Token by old one

## Dependencies

| Name      | Version | Description                         |
| --------- | ------- | ----------------------------------- |
| moleculer | 0.14.8  | MoleculerJS Micro-service Framework |

## APIs

- [ ] Swagger (NEED SUPPORTED)

| name     | version | description                             | request body                                                            | response body |
| -------- | ------- | --------------------------------------- | ----------------------------------------------------------------------- | ------------- |
| register | 1       | Register new user with email & password | `{ "email": "you@domain.com", "password": "AtLeast8Chars" }`            | { }           |
| login    | 1       | login with username & password          | `{ "username": "your username or email", "password": "AtLeast8Chars" }` | { }           |

## Events

```ts
const SERVICE_AUTH = '@auth-auth';
[`${SERVICE_AUTH}.registered`](user: User) {
  // do whatever with registered `user`
}
```

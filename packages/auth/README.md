# Moleculer Auth Service

## Features

- [ ] Login with Username / Password
- [ ] JWT Token (with short-expired time)
- [ ] Renew JWT Token by old one

## Dependencies

| Name      | Version | Description                                |
| --------- | ------- | ------------------------------------------ |
| moleculer | 0.14.3  | MoleculerJS Micro-service Framework        |
| redlock   | 4.1.0   | Cache Lock -> moleculer framework required |

## Error Codes

| Code / Type  | Status Code | Error Message         | Description                                                                                                                               | Actions                                                                                                     |
| ------------ | ----------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| AUTH_ERR_001 | 400         | Authentication failed | This is the generic error message displayed in the default login failed template. The most common cause is invalid/incorrect credentials. | Enter valid and correct user name/password (the credentials required by the invoked authentication module.) |
| AUTH_ERR_002 | 400         |

# Authentication Service

| Status        | (Proposed / Accepted / Implemented / Obsolete)  |
| :------------ | :---------------------------------------------- |
| **Author(s)** | Luc Duong (luc@ltv.vn), Tin Luong (tin@ltv.vvn) |
| **Sponsor**   | Luc Duong (luc@ltv.vn)                          |
| **Created**   | 2020-03-16                                      |
| **Updated**   | 2020-03-25                                      |

## Configuration

- name: `auth`

## Objective

`auth` service is using for handle authentication & authorization business.

## Motivation

- Only issue resource to authenticated user

## Design Proposal

- Provide Authentication diagram

### Alternatives Considered

- Make sure to discuss the relative merits of alternatives to your proposal.

### Performance Implications

- Do you expect any (speed / memory)? How will you confirm?
- There should be microbenchmarks. Are there?
- There should be end-to-end tests and benchmarks. If there are not (since this is still a design), how will you track that these will be created?

### Dependencies

| Name         | Version | Description                             | Author | Repository                                                          |
| ------------ | ------- | --------------------------------------- | ------ | ------------------------------------------------------------------- |
| jsonwebtoken | 8.5.1   | JsonWebToken implementation for node.js | auth0  | [Github - jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) |

### Platforms and Environments

- Platforms: does this work on all platforms supported by Project? If not, why is that ok? Will it work on embedded/mobile? Does it impact automatic code generation or mobile stripping tooling? Will it work with transformation tools?
- Execution environments (Cloud services, accelerator hardware): what impact do you expect and how will you confirm?

### Best Practices

- Does this proposal change best practices for some aspect of using/developing Project? How will these changes be communicated/enforced?

### Tutorials and Examples

- If design changes existing API or creates new ones, the design owner should create end-to-end examples (ideally, a tutorial) which reflects how new feature will be used. Some things to consider related to the tutorial:
  - This should be written as if it is documentation of the new feature, i.e., consumable by a user, not a Project developer.
  - The code does not need to work (since the feature is not implemented yet) but the expectation is that the code does work before the feature can be merged.

## Detailed Design

### Actions

#### login

> Login to system by using `username` and `password`.
>
> Return `token: string` after login successfully.
>
> Errors:
>
> - XXX
> - XXX

- name: `login`
- params:
  - username: string
  - password: string

## Questions and Discussion Topics

### References

- [IETF OAuth JSON Web Token](http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html)

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Backend API for agricultural management system built with [NestJS](https://github.com/nestjs/nest) framework.

### Features

- User authentication and management
- Cow (cattle) management with tracking
- Body Condition Score (BCS) tracking
- Cow ownership transfer history
- Data synchronization for offline-first mobile apps

### API Documentation

Once the application is running, you can access the interactive Swagger API documentation at:
- Local: `http://localhost:3000/api/docs`

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

---

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/password-reset/request` - Request password recovery without revealing account existence
- `POST /auth/password-reset/verify` - Verify the six-digit challenge and obtain a one-use reset token
- `POST /auth/password-reset/confirm` - Change the password and revoke existing JWTs

Password recovery uses a PostgreSQL-backed cooldown and attempt counter as the
authoritative protection across replicas. HTTP throttling is in-memory per
instance; distributed deployments should add a shared Throttler storage. Set
`TRUST_PROXY_HOPS` to the exact reverse-proxy hop count (secure default `0`;
set `1` only when there is exactly one trusted proxy). The fixed response delay reduces timing
differences, but a durable email outbox is the recommended next step for
stronger timing uniformity and delivery retries.
Expired and consumed challenge rows should be removed by the deployment's
scheduled retention job.

### Users
- `GET /user` - Get the authenticated profile
- `GET /user/:id` - Get the profile only when `id` is the authenticated user
- `PUT /user` - Update the authenticated profile (account role is immutable)
- `DELETE /user/:id` - Delete only the authenticated profile

### Cows
- `GET /cows` - Get all cows for authenticated user
- `GET /cows/:id` - Get cow by ID
- `GET /cows/tag/:tagNumber` - Get cow by tag number
- `POST /cows` - Create new cow
- `PUT /cows/:id` - Update cow
- `DELETE /cows/:id` - Delete cow
- `POST /cows/synchronize` - Synchronize cows data (offline-first)
- `POST /cows/:id/transfer` - Transfer cow ownership
- `GET /cows/:id/history` - Get ownership history
- `POST /cows/:id/bcs` - Add body condition score
- `GET /cows/:id/bcs` - Get body condition score history
- `DELETE /cows/bcs/:bcsId` - Delete body condition score
- `PATCH /cows/bcs/:bcsId/override` - Override the effective score while preserving the model score
- `DELETE /cows/bcs/:bcsId/override` - Restore the immutable model score

### Professional access

- `POST /professional-access/requests` - Producer requests access by professional email
- `GET /professional-access` - Producer lists professional relationships
- `GET /professional-access/requests` - Professional lists pending requests
- `POST /professional-access/:id/accept` - Professional accepts a request
- `POST /professional-access/:id/reject` - Professional rejects a request
- `DELETE /professional-access/:id` - Producer revokes a relationship
- `GET /professional-access/clients` - Professional lists active clients
- `GET /professional-access/clients/:producerId/cows` - Read-only client cows and BCS results

### Professional reviews

- `POST /professional-reviews` - Professional creates a draft or published review for an accessible result
- `GET /professional-reviews` - Producer lists own published reviews; professional lists own authored reviews
- `PATCH /professional-reviews/:id` - Author edits or publishes a review
- `POST /professional-reviews/:id/apply-score` - Producer applies a published suggested score

### Current tenancy boundary

Until farms are introduced as first-class tenants, each `producer` account represents one field/tenant. Cows and BCS results remain owned by that producer's `userId`. A veterinarian or professional can only read another producer's data through an `active` professional-access relationship. Access never transfers ownership and never enables edits to client cattle or results. All cross-account lookups return a not-found response when the relationship or ownership check fails.

### Cow Data Structure

```json
{
  "id": "uuid",
  "tagNumber": "string",
  "breed": "string (optional)",
  "weight": "number",
  "userId": "uuid",
  "bodyConditionScores": [],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Note**: The `breed` field was added to store the cattle breed/race (e.g., "Holstein", "Angus", "Jersey"). It's optional and supports up to 100 characters.

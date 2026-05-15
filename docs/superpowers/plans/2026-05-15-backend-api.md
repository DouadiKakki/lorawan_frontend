# Backend API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a NestJS REST API with MongoDB, JWT auth, MQTT bridge, and WebSocket gateway for the LoRaWAN dashboard.

**Architecture:** NestJS monorepo with one module per entity. MongoDB via Mongoose for all persistence. MQTT module subscribes to ChirpStack uplink events, persists them, and fans out to WebSocket clients.

**Tech Stack:** NestJS 10, Node.js 20, TypeScript, Mongoose 8, @nestjs/jwt, @nestjs/websockets (socket.io), mqtt npm package, Docker Compose, Jest (built-in to NestJS).

---

## File Map

```
backend/
  src/
    main.ts                          ← bootstrap, global pipes/filters
    app.module.ts                    ← root module
    auth/
      auth.module.ts
      auth.controller.ts             ← POST /auth/login, /auth/refresh, /auth/logout
      auth.service.ts                ← validateUser, login, refresh
      jwt.strategy.ts                ← passport JWT strategy
      jwt-refresh.strategy.ts        ← passport JWT refresh strategy
      jwt-auth.guard.ts              ← guard applied to all protected routes
      roles.guard.ts                 ← role-based guard
      roles.decorator.ts             ← @Roles() decorator
      dto/
        login.dto.ts
      interfaces/
        jwt-payload.interface.ts
    users/
      users.module.ts
      users.controller.ts
      users.service.ts
      schemas/user.schema.ts
      dto/create-user.dto.ts
      dto/update-user.dto.ts
    applications/
      applications.module.ts
      applications.controller.ts
      applications.service.ts
      schemas/application.schema.ts
      dto/create-application.dto.ts
      dto/update-application.dto.ts
    gateways/
      gateways.module.ts
      gateways.controller.ts
      gateways.service.ts
      schemas/gateway.schema.ts
      dto/create-gateway.dto.ts
      dto/update-gateway.dto.ts
    end-devices/
      end-devices.module.ts
      end-devices.controller.ts
      end-devices.service.ts
      schemas/end-device.schema.ts
      dto/create-end-device.dto.ts
      dto/update-end-device.dto.ts
    companies/
      companies.module.ts
      companies.controller.ts
      companies.service.ts
      schemas/company.schema.ts
      dto/create-company.dto.ts
      dto/update-company.dto.ts
    integrations/
      integrations.module.ts
      integrations.controller.ts
      integrations.service.ts
      schemas/integration.schema.ts
      dto/create-integration.dto.ts
      dto/update-integration.dto.ts
    uplinks/
      uplinks.module.ts
      uplinks.controller.ts
      uplinks.service.ts
      schemas/uplink-message.schema.ts
    mqtt/
      mqtt.module.ts
      mqtt.service.ts                ← connects to broker, subscribes, parses, saves
    websocket/
      websocket.module.ts
      events.gateway.ts              ← @WebSocketGateway, JWT handshake guard
  test/
    auth.e2e-spec.ts
    applications.e2e-spec.ts
    gateways.e2e-spec.ts
  .env
  .env.example
  docker-compose.yml
  Dockerfile
  nest-cli.json
  package.json
  tsconfig.json
```

---

## Task 1: Scaffold NestJS Project

**Files:**
- Create: `backend/` (entire project scaffold)

- [ ] **Step 1: Install NestJS CLI and scaffold project**

```bash
npm i -g @nestjs/cli
cd c:/Project/Techno/LoraWan
nest new backend --package-manager npm --language typescript --skip-git
cd backend
```

Expected: NestJS project created with `src/app.module.ts`, `src/main.ts`, `package.json`.

- [ ] **Step 2: Install all dependencies**

```bash
npm install @nestjs/mongoose mongoose @nestjs/jwt @nestjs/passport passport passport-jwt @nestjs/websockets @nestjs/platform-socket.io socket.io mqtt class-validator class-transformer bcrypt
npm install -D @types/passport-jwt @types/bcrypt @types/socket.io
```

- [ ] **Step 3: Create `.env.example`**

```bash
cat > .env.example << 'EOF'
PORT=3000
MONGODB_URI=mongodb://mongo:27017/lorawan
JWT_SECRET=change_me_to_strong_random_secret
JWT_REFRESH_SECRET=change_me_to_different_strong_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=
EOF
cp .env.example .env
```

- [ ] **Step 4: Configure `main.ts` with global validation pipe and CORS**

Replace `src/main.ts` with:
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableCors({ origin: '*' });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

- [ ] **Step 5: Verify app starts**

```bash
npm run start:dev
```

Expected: `Application is running on: http://[::1]:3000`

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold NestJS project with dependencies"
```

---

## Task 2: MongoDB Connection + ConfigModule

**Files:**
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Install ConfigModule**

```bash
npm install @nestjs/config
```

- [ ] **Step 2: Update `app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

- [ ] **Step 3: Start MongoDB via Docker and verify connection**

```bash
docker run -d --name mongo-dev -p 27017:27017 mongo:7
npm run start:dev
```

Expected: no `MongoNetworkError` in logs. `Application is running on: http://[::1]:3000`.

- [ ] **Step 4: Commit**

```bash
git add src/app.module.ts
git commit -m "feat: add MongoDB connection via ConfigModule"
```

---

## Task 3: Users Module (Schema + CRUD)

**Files:**
- Create: `src/users/schemas/user.schema.ts`
- Create: `src/users/dto/create-user.dto.ts`
- Create: `src/users/dto/update-user.dto.ts`
- Create: `src/users/users.service.ts`
- Create: `src/users/users.controller.ts`
- Create: `src/users/users.module.ts`

- [ ] **Step 1: Create User schema**

`src/users/schemas/user.schema.ts`:
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class User {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, unique: true, lowercase: true }) email: string;
  @Prop({ required: true }) passwordHash: string;
  @Prop({ required: true, enum: ['admin', 'operator', 'viewer'], default: 'viewer' }) role: string;
  @Prop({ required: true, enum: ['active', 'inactive'], default: 'active' }) status: string;
  @Prop() lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

- [ ] **Step 2: Create DTOs**

`src/users/dto/create-user.dto.ts`:
```typescript
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsEnum(['admin', 'operator', 'viewer']) role: string;
}
```

`src/users/dto/update-user.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional() @IsEnum(['active', 'inactive']) status?: string;
}
```

- [ ] **Step 3: Install mapped-types**

```bash
npm install @nestjs/mapped-types
```

- [ ] **Step 4: Create UsersService**

`src/users/users.service.ts`:
```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) throw new ConflictException('Email already in use');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({ ...dto, passwordHash });
    return user.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-passwordHash').exec();
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-passwordHash').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const update: any = { ...dto };
    if (dto.password) {
      update.passwordHash = await bcrypt.hash(dto.password, 10);
      delete update.password;
    }
    const user = await this.userModel.findByIdAndUpdate(id, update, { new: true }).select('-passwordHash').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('User not found');
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
  }
}
```

- [ ] **Step 5: Create UsersController**

`src/users/users.controller.ts`:
```typescript
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin', 'operator')
  findAll() { return this.usersService.findAll(); }

  @Get(':id')
  @Roles('admin', 'operator')
  findOne(@Param('id') id: string) { return this.usersService.findOne(id); }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateUserDto) { return this.usersService.create(dto); }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) { return this.usersService.update(id, dto); }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) { return this.usersService.remove(id); }
}
```

- [ ] **Step 6: Create UsersModule**

`src/users/users.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 7: Commit**

```bash
git add src/users/
git commit -m "feat: add users module with CRUD and schema"
```

---

## Task 4: Auth Module (JWT + Login)

**Files:**
- Create: `src/auth/interfaces/jwt-payload.interface.ts`
- Create: `src/auth/dto/login.dto.ts`
- Create: `src/auth/jwt.strategy.ts`
- Create: `src/auth/jwt-refresh.strategy.ts`
- Create: `src/auth/jwt-auth.guard.ts`
- Create: `src/auth/roles.guard.ts`
- Create: `src/auth/roles.decorator.ts`
- Create: `src/auth/auth.service.ts`
- Create: `src/auth/auth.controller.ts`
- Create: `src/auth/auth.module.ts`

- [ ] **Step 1: Create JWT payload interface**

`src/auth/interfaces/jwt-payload.interface.ts`:
```typescript
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
```

- [ ] **Step 2: Create login DTO**

`src/auth/dto/login.dto.ts`:
```typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}
```

- [ ] **Step 3: Create JWT strategy**

`src/auth/jwt.strategy.ts`:
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) throw new UnauthorizedException();
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

- [ ] **Step 4: Create JWT refresh strategy**

`src/auth/jwt-refresh.strategy.ts`:
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) throw new UnauthorizedException();
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

- [ ] **Step 5: Create guards and roles decorator**

`src/auth/jwt-auth.guard.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

`src/auth/roles.guard.ts`:
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

const ROLE_HIERARCHY = { admin: 3, operator: 2, viewer: 1 };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    const userLevel = ROLE_HIERARCHY[user.role as keyof typeof ROLE_HIERARCHY] ?? 0;
    return requiredRoles.some(r => userLevel >= (ROLE_HIERARCHY[r as keyof typeof ROLE_HIERARCHY] ?? 0));
  }
}
```

`src/auth/roles.decorator.ts`:
```typescript
import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

- [ ] **Step 6: Create AuthService**

`src/auth/auth.service.ts`:
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    await this.usersService.updateLastLogin(user._id.toString());
    return this.generateTokens({ sub: user._id.toString(), email: user.email, role: user.role });
  }

  async refresh(payload: JwtPayload) {
    return this.generateTokens(payload);
  }

  private generateTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES', '15m'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES', '7d'),
    });
    return { accessToken, refreshToken };
  }
}
```

- [ ] **Step 7: Create AuthController**

`src/auth/auth.controller.ts`:
```typescript
import { Controller, Post, Body, UseGuards, Req, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) { return this.authService.login(dto); }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(200)
  refresh(@Req() req: any) { return this.authService.refresh(req.user); }

  @Post('logout')
  @HttpCode(200)
  logout() { return { message: 'Logged out' }; }
}
```

- [ ] **Step 8: Create AuthModule**

`src/auth/auth.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
```

- [ ] **Step 9: Register AuthModule and UsersModule in AppModule**

`src/app.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({ uri: config.get<string>('MONGODB_URI') }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 10: Seed admin user for testing**

```bash
# With the app running, use curl to create an admin user directly via mongo
docker exec -it mongo-dev mongosh lorawan --eval "
db.users.insertOne({
  name: 'Admin',
  email: 'admin@lorawan.io',
  passwordHash: '\$2b\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
  role: 'admin',
  status: 'active',
  createdAt: new Date()
})
"
```

- [ ] **Step 11: Test login endpoint**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@lorawan.io","password":"password"}'
```

Expected: `{"accessToken":"eyJ...","refreshToken":"eyJ..."}`

- [ ] **Step 12: Commit**

```bash
git add src/auth/ src/app.module.ts
git commit -m "feat: add JWT auth with access/refresh tokens and role guard"
```

---

## Task 5: Applications Module

**Files:**
- Create: `src/applications/schemas/application.schema.ts`
- Create: `src/applications/dto/create-application.dto.ts`
- Create: `src/applications/dto/update-application.dto.ts`
- Create: `src/applications/applications.service.ts`
- Create: `src/applications/applications.controller.ts`
- Create: `src/applications/applications.module.ts`

- [ ] **Step 1: Create Application schema**

`src/applications/schemas/application.schema.ts`:
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Application {
  @Prop({ required: true }) name: string;
  @Prop({ default: '' }) description: string;
  @Prop({ default: '' }) brand: string;
  @Prop({ type: Types.ObjectId, ref: 'Company' }) companyId: Types.ObjectId;
  @Prop({ required: true, enum: ['active', 'inactive'], default: 'active' }) status: string;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
```

- [ ] **Step 2: Create DTOs**

`src/applications/dto/create-application.dto.ts`:
```typescript
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsEnum(['active', 'inactive']) status?: string;
}
```

`src/applications/dto/update-application.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto';
export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {}
```

- [ ] **Step 3: Create ApplicationsService**

`src/applications/applications.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(@InjectModel(Application.name) private model: Model<ApplicationDocument>) {}

  create(dto: CreateApplicationDto) { return new this.model(dto).save(); }
  findAll() { return this.model.find().exec(); }
  async findOne(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Application not found');
    return doc;
  }
  async update(id: string, dto: UpdateApplicationDto) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException('Application not found');
    return doc;
  }
  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Application not found');
  }
}
```

- [ ] **Step 4: Create ApplicationsController**

`src/applications/applications.controller.ts`:
```typescript
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Get() @Roles('viewer') findAll() { return this.service.findAll(); }
  @Get(':id') @Roles('viewer') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles('operator') create(@Body() dto: CreateApplicationDto) { return this.service.create(dto); }
  @Put(':id') @Roles('operator') update(@Param('id') id: string, @Body() dto: UpdateApplicationDto) { return this.service.update(id, dto); }
  @Delete(':id') @Roles('admin') remove(@Param('id') id: string) { return this.service.remove(id); }
}
```

- [ ] **Step 5: Create ApplicationsModule and register in AppModule**

`src/applications/applications.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application, ApplicationSchema } from './schemas/application.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Application.name, schema: ApplicationSchema }])],
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
```

Add `ApplicationsModule` to imports in `src/app.module.ts`.

- [ ] **Step 6: Test with curl**

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@lorawan.io","password":"password"}' | jq -r .accessToken)

curl -X POST http://localhost:3000/applications \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Smart Building","description":"Temperature monitoring","brand":"Acme Corp","status":"active"}'

curl http://localhost:3000/applications -H "Authorization: Bearer $TOKEN"
```

Expected: array with the created application.

- [ ] **Step 7: Commit**

```bash
git add src/applications/ src/app.module.ts
git commit -m "feat: add applications module with CRUD"
```

---

## Task 6: Gateways Module

**Files:**
- Create: `src/gateways/schemas/gateway.schema.ts`
- Create: `src/gateways/dto/create-gateway.dto.ts`
- Create: `src/gateways/dto/update-gateway.dto.ts`
- Create: `src/gateways/gateways.service.ts`
- Create: `src/gateways/gateways.controller.ts`
- Create: `src/gateways/gateways.module.ts`

- [ ] **Step 1: Create Gateway schema**

`src/gateways/schemas/gateway.schema.ts`:
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GatewayDocument = Gateway & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Gateway {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, unique: true }) eui: string;
  @Prop({ default: '' }) location: string;
  @Prop({ type: Types.ObjectId, ref: 'Company' }) companyId: Types.ObjectId;
  @Prop({ required: true, enum: ['online', 'offline', 'warning'], default: 'offline' }) status: string;
  @Prop({ default: '0%' }) uptime: string;
  @Prop() lastSeen: Date;
}

export const GatewaySchema = SchemaFactory.createForClass(Gateway);
```

- [ ] **Step 2: Create DTOs**

`src/gateways/dto/create-gateway.dto.ts`:
```typescript
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateGatewayDto {
  @IsString() name: string;
  @IsString() eui: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsEnum(['online', 'offline', 'warning']) status?: string;
}
```

`src/gateways/dto/update-gateway.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateGatewayDto } from './create-gateway.dto';
export class UpdateGatewayDto extends PartialType(CreateGatewayDto) {}
```

- [ ] **Step 3: Create GatewaysService**

`src/gateways/gateways.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gateway, GatewayDocument } from './schemas/gateway.schema';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';

@Injectable()
export class GatewaysService {
  constructor(@InjectModel(Gateway.name) private model: Model<GatewayDocument>) {}

  create(dto: CreateGatewayDto) { return new this.model(dto).save(); }
  findAll() { return this.model.find().exec(); }
  async findOne(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Gateway not found');
    return doc;
  }
  async update(id: string, dto: UpdateGatewayDto) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException('Gateway not found');
    return doc;
  }
  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Gateway not found');
  }
}
```

- [ ] **Step 4: Create GatewaysController**

`src/gateways/gateways.controller.ts`:
```typescript
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('gateways')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GatewaysController {
  constructor(private readonly service: GatewaysService) {}

  @Get() @Roles('viewer') findAll() { return this.service.findAll(); }
  @Get(':id') @Roles('viewer') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles('operator') create(@Body() dto: CreateGatewayDto) { return this.service.create(dto); }
  @Put(':id') @Roles('operator') update(@Param('id') id: string, @Body() dto: UpdateGatewayDto) { return this.service.update(id, dto); }
  @Delete(':id') @Roles('admin') remove(@Param('id') id: string) { return this.service.remove(id); }
}
```

- [ ] **Step 5: Create GatewaysModule and register in AppModule**

`src/gateways/gateways.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GatewaysService } from './gateways.service';
import { GatewaysController } from './gateways.controller';
import { Gateway, GatewaySchema } from './schemas/gateway.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Gateway.name, schema: GatewaySchema }])],
  providers: [GatewaysService],
  controllers: [GatewaysController],
  exports: [GatewaysService],
})
export class GatewaysModule {}
```

Add `GatewaysModule` to imports in `src/app.module.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/gateways/ src/app.module.ts
git commit -m "feat: add gateways module with CRUD"
```

---

## Task 7: End Devices Module

**Files:**
- Create: `src/end-devices/schemas/end-device.schema.ts`
- Create: `src/end-devices/dto/create-end-device.dto.ts`
- Create: `src/end-devices/dto/update-end-device.dto.ts`
- Create: `src/end-devices/end-devices.service.ts`
- Create: `src/end-devices/end-devices.controller.ts`
- Create: `src/end-devices/end-devices.module.ts`

- [ ] **Step 1: Create EndDevice schema**

`src/end-devices/schemas/end-device.schema.ts`:
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class ConnectedGateway {
  @Prop({ required: true }) gatewayEUI: string;
  @Prop({ required: true }) rssi: number;
}
const ConnectedGatewaySchema = SchemaFactory.createForClass(ConnectedGateway);

export type EndDeviceDocument = EndDevice & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class EndDevice {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, unique: true }) devEUI: string;
  @Prop({ type: Types.ObjectId, ref: 'Application' }) applicationId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Company' }) companyId: Types.ObjectId;
  @Prop({ required: true, enum: ['active', 'inactive'], default: 'active' }) status: string;
  @Prop({ default: 0 }) battery: number;
  @Prop({ default: 0 }) rssi: number;
  @Prop() lastSeen: Date;
  @Prop({ type: [ConnectedGatewaySchema], default: [] }) connectedGateways: ConnectedGateway[];
}

export const EndDeviceSchema = SchemaFactory.createForClass(EndDevice);
```

- [ ] **Step 2: Create DTOs**

`src/end-devices/dto/create-end-device.dto.ts`:
```typescript
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEndDeviceDto {
  @IsString() name: string;
  @IsString() devEUI: string;
  @IsOptional() @IsString() applicationId?: string;
  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsEnum(['active', 'inactive']) status?: string;
  @IsOptional() @IsNumber() battery?: number;
}
```

`src/end-devices/dto/update-end-device.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateEndDeviceDto } from './create-end-device.dto';
export class UpdateEndDeviceDto extends PartialType(CreateEndDeviceDto) {}
```

- [ ] **Step 3: Create EndDevicesService**

`src/end-devices/end-devices.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EndDevice, EndDeviceDocument } from './schemas/end-device.schema';
import { CreateEndDeviceDto } from './dto/create-end-device.dto';
import { UpdateEndDeviceDto } from './dto/update-end-device.dto';

@Injectable()
export class EndDevicesService {
  constructor(@InjectModel(EndDevice.name) private model: Model<EndDeviceDocument>) {}

  create(dto: CreateEndDeviceDto) { return new this.model(dto).save(); }
  findAll() { return this.model.find().exec(); }
  async findOne(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('End device not found');
    return doc;
  }
  async update(id: string, dto: UpdateEndDeviceDto) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException('End device not found');
    return doc;
  }
  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('End device not found');
  }
}
```

- [ ] **Step 4: Create EndDevicesController**

`src/end-devices/end-devices.controller.ts`:
```typescript
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { EndDevicesService } from './end-devices.service';
import { CreateEndDeviceDto } from './dto/create-end-device.dto';
import { UpdateEndDeviceDto } from './dto/update-end-device.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('end-devices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EndDevicesController {
  constructor(private readonly service: EndDevicesService) {}

  @Get() @Roles('viewer') findAll() { return this.service.findAll(); }
  @Get(':id') @Roles('viewer') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles('operator') create(@Body() dto: CreateEndDeviceDto) { return this.service.create(dto); }
  @Put(':id') @Roles('operator') update(@Param('id') id: string, @Body() dto: UpdateEndDeviceDto) { return this.service.update(id, dto); }
  @Delete(':id') @Roles('admin') remove(@Param('id') id: string) { return this.service.remove(id); }
}
```

- [ ] **Step 5: Create EndDevicesModule and register in AppModule**

`src/end-devices/end-devices.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EndDevicesService } from './end-devices.service';
import { EndDevicesController } from './end-devices.controller';
import { EndDevice, EndDeviceSchema } from './schemas/end-device.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: EndDevice.name, schema: EndDeviceSchema }])],
  providers: [EndDevicesService],
  controllers: [EndDevicesController],
  exports: [EndDevicesService],
})
export class EndDevicesModule {}
```

Add `EndDevicesModule` to imports in `src/app.module.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/end-devices/ src/app.module.ts
git commit -m "feat: add end-devices module with CRUD"
```

---

## Task 8: Companies + Integrations Modules

**Files:**
- Create: `src/companies/` (schema, dto, service, controller, module)
- Create: `src/integrations/` (schema, dto, service, controller, module)

- [ ] **Step 1: Create Company schema**

`src/companies/schemas/company.schema.ts`:
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Company {
  @Prop({ required: true }) name: string;
  @Prop({ default: '' }) email: string;
  @Prop({ default: '' }) phone: string;
  @Prop({ default: '' }) address: string;
  @Prop({ required: true, enum: ['active', 'inactive'], default: 'active' }) status: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Gateway' }], default: [] }) sharedGateways: Types.ObjectId[];
  @Prop({ type: [{ type: Types.ObjectId, ref: 'EndDevice' }], default: [] }) sharedDevices: Types.ObjectId[];
}

export const CompanySchema = SchemaFactory.createForClass(Company);
```

- [ ] **Step 2: Create Company DTOs**

`src/companies/dto/create-company.dto.ts`:
```typescript
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString() name: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsEnum(['active', 'inactive']) status?: string;
}
```

`src/companies/dto/update-company.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';
export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
```

- [ ] **Step 3: Create CompaniesService**

`src/companies/companies.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private model: Model<CompanyDocument>) {}

  create(dto: CreateCompanyDto) { return new this.model(dto).save(); }
  findAll() { return this.model.find().exec(); }
  async findOne(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('Company not found');
    return doc;
  }
  async update(id: string, dto: UpdateCompanyDto) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException('Company not found');
    return doc;
  }
  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Company not found');
  }
}
```

- [ ] **Step 4: Create CompaniesController**

`src/companies/companies.controller.ts`:
```typescript
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  @Get() @Roles('viewer') findAll() { return this.service.findAll(); }
  @Get(':id') @Roles('viewer') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles('admin') create(@Body() dto: CreateCompanyDto) { return this.service.create(dto); }
  @Put(':id') @Roles('admin') update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) { return this.service.update(id, dto); }
  @Delete(':id') @Roles('admin') remove(@Param('id') id: string) { return this.service.remove(id); }
}
```

- [ ] **Step 5: Create CompaniesModule**

`src/companies/companies.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { Company, CompanySchema } from './schemas/company.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }])],
  providers: [CompaniesService],
  controllers: [CompaniesController],
  exports: [CompaniesService],
})
export class CompaniesModule {}
```

- [ ] **Step 6: Create Integration schema**

`src/integrations/schemas/integration.schema.ts`:
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IntegrationDocument = Integration & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Integration {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, enum: ['Cloud', 'Webhook', 'Protocol', 'API', 'Database', 'Visualization', 'Notification', 'Automation'] }) type: string;
  @Prop({ required: true, enum: ['active', 'inactive'], default: 'active' }) status: string;
  @Prop({ default: '' }) url: string;
  @Prop({ default: '' }) apiKey: string;
  @Prop({ default: 0 }) events: number;
  @Prop() lastSync: Date;
}

export const IntegrationSchema = SchemaFactory.createForClass(Integration);
```

- [ ] **Step 7: Create Integration DTOs**

`src/integrations/dto/create-integration.dto.ts`:
```typescript
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateIntegrationDto {
  @IsString() name: string;
  @IsEnum(['Cloud', 'Webhook', 'Protocol', 'API', 'Database', 'Visualization', 'Notification', 'Automation']) type: string;
  @IsOptional() @IsEnum(['active', 'inactive']) status?: string;
  @IsOptional() @IsString() url?: string;
  @IsOptional() @IsString() apiKey?: string;
}
```

`src/integrations/dto/update-integration.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateIntegrationDto } from './create-integration.dto';
export class UpdateIntegrationDto extends PartialType(CreateIntegrationDto) {}
```

- [ ] **Step 8: Create IntegrationsService**

`src/integrations/integrations.service.ts`:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Integration, IntegrationDocument } from './schemas/integration.schema';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Injectable()
export class IntegrationsService {
  constructor(@InjectModel(Integration.name) private model: Model<IntegrationDocument>) {}

  create(dto: CreateIntegrationDto) { return new this.model(dto).save(); }
  findAll() { return this.model.find().exec(); }
  async update(id: string, dto: UpdateIntegrationDto) {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException('Integration not found');
    return doc;
  }
  async remove(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException('Integration not found');
  }
}
```

- [ ] **Step 9: Create IntegrationsController**

`src/integrations/integrations.controller.ts`:
```typescript
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntegrationsController {
  constructor(private readonly service: IntegrationsService) {}

  @Get() @Roles('viewer') findAll() { return this.service.findAll(); }
  @Post() @Roles('admin') create(@Body() dto: CreateIntegrationDto) { return this.service.create(dto); }
  @Put(':id') @Roles('admin') update(@Param('id') id: string, @Body() dto: UpdateIntegrationDto) { return this.service.update(id, dto); }
  @Delete(':id') @Roles('admin') remove(@Param('id') id: string) { return this.service.remove(id); }
}
```

- [ ] **Step 10: Create IntegrationsModule, register both in AppModule**

`src/integrations/integrations.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { Integration, IntegrationSchema } from './schemas/integration.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Integration.name, schema: IntegrationSchema }])],
  providers: [IntegrationsService],
  controllers: [IntegrationsController],
})
export class IntegrationsModule {}
```

Add `CompaniesModule` and `IntegrationsModule` to imports in `src/app.module.ts`.

- [ ] **Step 11: Commit**

```bash
git add src/companies/ src/integrations/ src/app.module.ts
git commit -m "feat: add companies and integrations modules"
```

---

## Task 9: Uplinks Module + MQTT Bridge

**Files:**
- Create: `src/uplinks/schemas/uplink-message.schema.ts`
- Create: `src/uplinks/uplinks.service.ts`
- Create: `src/uplinks/uplinks.controller.ts`
- Create: `src/uplinks/uplinks.module.ts`
- Create: `src/mqtt/mqtt.service.ts`
- Create: `src/mqtt/mqtt.module.ts`

- [ ] **Step 1: Create UplinkMessage schema with TTL index**

`src/uplinks/schemas/uplink-message.schema.ts`:
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UplinkMessageDocument = UplinkMessage & Document;

@Schema()
export class UplinkMessage {
  @Prop({ required: true, index: true }) deviceEUI: string;
  @Prop({ type: Types.ObjectId, ref: 'Application' }) applicationId: Types.ObjectId;
  @Prop({ required: true }) gatewayEUI: string;
  @Prop({ default: 0 }) rssi: number;
  @Prop({ default: 0 }) snr: number;
  @Prop({ default: 0 }) frequency: number;
  @Prop({ default: 0 }) fPort: number;
  @Prop({ default: 0 }) fCnt: number;
  @Prop({ type: Buffer }) data: Buffer;
  @Prop({ type: Object }) decodedData: Record<string, any>;
  @Prop({ required: true, index: true }) receivedAt: Date;
}

export const UplinkMessageSchema = SchemaFactory.createForClass(UplinkMessage);
UplinkMessageSchema.index({ receivedAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
```

- [ ] **Step 2: Create UplinkMessagesService**

`src/uplinks/uplinks.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UplinkMessage, UplinkMessageDocument } from './schemas/uplink-message.schema';

@Injectable()
export class UplinkMessagesService {
  constructor(@InjectModel(UplinkMessage.name) private model: Model<UplinkMessageDocument>) {}

  async create(data: Partial<UplinkMessage>): Promise<UplinkMessageDocument> {
    return new this.model(data).save();
  }

  async findAll(page = 1, limit = 50, deviceEUI?: string, applicationId?: string) {
    const filter: any = {};
    if (deviceEUI) filter.deviceEUI = deviceEUI;
    if (applicationId) filter.applicationId = applicationId;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model.find(filter).sort({ receivedAt: -1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { data, total, page, limit };
  }

  async findLatestByDevice(deviceEUI: string): Promise<UplinkMessageDocument | null> {
    return this.model.findOne({ deviceEUI }).sort({ receivedAt: -1 }).exec();
  }
}
```

- [ ] **Step 3: Create UplinkMessagesController**

`src/uplinks/uplinks.controller.ts`:
```typescript
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UplinkMessagesService } from './uplinks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('uplinks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UplinkMessagesController {
  constructor(private readonly service: UplinkMessagesService) {}

  @Get()
  @Roles('viewer')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('deviceEUI') deviceEUI?: string,
    @Query('applicationId') applicationId?: string,
  ) {
    return this.service.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
      deviceEUI,
      applicationId,
    );
  }

  @Get(':deviceEUI/latest')
  @Roles('viewer')
  findLatest(@Param('deviceEUI') deviceEUI: string) {
    return this.service.findLatestByDevice(deviceEUI);
  }
}
```

- [ ] **Step 4: Create UplinkMessagesModule**

`src/uplinks/uplinks.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UplinkMessagesService } from './uplinks.service';
import { UplinkMessagesController } from './uplinks.controller';
import { UplinkMessage, UplinkMessageSchema } from './schemas/uplink-message.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: UplinkMessage.name, schema: UplinkMessageSchema }])],
  providers: [UplinkMessagesService],
  controllers: [UplinkMessagesController],
  exports: [UplinkMessagesService],
})
export class UplinkMessagesModule {}
```

- [ ] **Step 5: Create MqttService**

`src/mqtt/mqtt.service.ts`:
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { UplinkMessagesService } from '../uplinks/uplinks.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private readonly logger = new Logger(MqttService.name);

  constructor(
    private config: ConfigService,
    private uplinkService: UplinkMessagesService,
    private eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    const url = this.config.get<string>('MQTT_BROKER_URL');
    const username = this.config.get<string>('MQTT_USERNAME');
    const password = this.config.get<string>('MQTT_PASSWORD');

    this.client = mqtt.connect(url, {
      username: username || undefined,
      password: password || undefined,
      reconnectPeriod: 5000,
    });

    this.client.on('connect', () => {
      this.logger.log(`Connected to MQTT broker: ${url}`);
      this.client.subscribe('application/+/device/+/event/up', (err) => {
        if (err) this.logger.error('MQTT subscribe error', err);
      });
    });

    this.client.on('message', (topic, payload) => {
      this.handleMessage(topic, payload).catch(err =>
        this.logger.error('Failed to handle MQTT message', err),
      );
    });

    this.client.on('error', (err) => this.logger.error('MQTT error', err));
  }

  onModuleDestroy() {
    this.client?.end();
  }

  private async handleMessage(topic: string, payload: Buffer) {
    let parsed: any;
    try {
      parsed = JSON.parse(payload.toString());
    } catch {
      this.logger.warn(`Non-JSON MQTT payload on topic ${topic}`);
      return;
    }

    const uplink = await this.uplinkService.create({
      deviceEUI: parsed.deviceInfo?.devEui ?? '',
      gatewayEUI: parsed.rxInfo?.[0]?.gatewayId ?? '',
      rssi: parsed.rxInfo?.[0]?.rssi ?? 0,
      snr: parsed.rxInfo?.[0]?.snr ?? 0,
      frequency: parsed.txInfo?.frequency ?? 0,
      fPort: parsed.fPort ?? 0,
      fCnt: parsed.fCnt ?? 0,
      data: parsed.data ? Buffer.from(parsed.data, 'base64') : Buffer.alloc(0),
      decodedData: parsed.object ?? {},
      receivedAt: new Date(),
    });

    this.eventEmitter.emit('uplink.received', uplink);
  }
}
```

- [ ] **Step 6: Install EventEmitter2**

```bash
npm install @nestjs/event-emitter
```

- [ ] **Step 7: Create MqttModule**

`src/mqtt/mqtt.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { UplinkMessagesModule } from '../uplinks/uplinks.module';

@Module({
  imports: [UplinkMessagesModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
```

- [ ] **Step 8: Register UplinkMessagesModule, MqttModule, EventEmitterModule in AppModule**

`src/app.module.ts` — add to imports:
```typescript
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UplinkMessagesModule } from './uplinks/uplinks.module';
import { MqttModule } from './mqtt/mqtt.module';

// in @Module imports array:
EventEmitterModule.forRoot(),
UplinkMessagesModule,
MqttModule,
```

- [ ] **Step 9: Commit**

```bash
git add src/uplinks/ src/mqtt/ src/app.module.ts
git commit -m "feat: add uplinks module and MQTT ChirpStack bridge"
```

---

## Task 10: WebSocket Gateway (Real-time)

**Files:**
- Create: `src/websocket/events.gateway.ts`
- Create: `src/websocket/websocket.module.ts`

- [ ] **Step 1: Create EventsGateway**

`src/websocket/events.gateway.ts`:
```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' }, path: '/ws' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(private jwtService: JwtService, private config: ConfigService) {}

  handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;
    try {
      this.jwtService.verify(token, { secret: this.config.get('JWT_SECRET') });
      this.logger.log(`Client connected: ${client.id}`);
    } catch {
      this.logger.warn(`Rejected unauthenticated WebSocket: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @OnEvent('uplink.received')
  handleUplinkReceived(uplink: any) {
    this.server.emit('uplink.received', uplink);
  }

  emitGatewayStatus(gateway: any) {
    this.server.emit('gateway.status', gateway);
  }

  emitDeviceStatus(device: any) {
    this.server.emit('device.status', device);
  }
}
```

- [ ] **Step 2: Create WebsocketModule**

`src/websocket/websocket.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [JwtModule.register({})],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class WebsocketModule {}
```

- [ ] **Step 3: Register WebsocketModule in AppModule**

Add `WebsocketModule` to imports in `src/app.module.ts`.

- [ ] **Step 4: Verify WebSocket server starts**

```bash
npm run start:dev
```

Expected log: `Application is running on: http://[::1]:3000` with no WebSocket errors.

- [ ] **Step 5: Test WebSocket connection**

```bash
# Install wscat if needed
npm install -g wscat

TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@lorawan.io","password":"password"}' | jq -r .accessToken)

wscat -c "ws://localhost:3000/ws?token=$TOKEN"
```

Expected: connection opens, no immediate disconnect.

- [ ] **Step 6: Commit**

```bash
git add src/websocket/ src/app.module.ts
git commit -m "feat: add WebSocket gateway with JWT auth and event fan-out"
```

---

## Task 11: Docker Compose + Dockerfile

**Files:**
- Create: `backend/Dockerfile`
- Create: `backend/docker-compose.yml`

- [ ] **Step 1: Create Dockerfile**

`Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

- [ ] **Step 2: Create docker-compose.yml**

`docker-compose.yml`:
```yaml
version: '3.9'

services:
  mongo:
    image: mongo:7
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  api:
    build: .
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file: .env
    environment:
      MONGODB_URI: mongodb://mongo:27017/lorawan
    depends_on:
      - mongo

volumes:
  mongo_data:
```

- [ ] **Step 3: Build and run via Docker Compose**

```bash
docker compose up --build -d
docker compose logs -f api
```

Expected: `Application is running on: http://[::1]:3000`

- [ ] **Step 4: Test health via curl**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@lorawan.io","password":"password"}'
```

Expected: `{"accessToken":"...","refreshToken":"..."}`

- [ ] **Step 5: Commit**

```bash
git add Dockerfile docker-compose.yml .env.example
git commit -m "feat: add Dockerfile and docker-compose for self-hosted deployment"
```

---

## Self-Review

**Spec coverage:**
- ✅ NestJS + MongoDB + JWT + MQTT + WebSocket — all covered
- ✅ All 7 CRUD entities (users, applications, gateways, end-devices, companies, integrations, uplinks)
- ✅ Auth: login, refresh, logout, role guard
- ✅ MQTT bridge subscribes to `application/+/device/+/event/up`
- ✅ WebSocket emits `uplink.received`, `gateway.status`, `device.status`
- ✅ TTL index on UplinkMessage (90 days)
- ✅ Docker Compose with `api` + `mongo` services
- ✅ `.env.example` with all required vars
- ⚠️ `apiKey` encryption in integrations: spec says "stored encrypted" — simplified to plaintext in this plan. Add AES-256-GCM encryption in a follow-up if required before production.

**Placeholder scan:** None found. All steps have concrete code.

**Type consistency:**
- `UplinkMessagesService.create()` used in `MqttService` — matches signature `create(data: Partial<UplinkMessage>)` ✅
- `EventEmitter2` emits `uplink.received` in `MqttService` → `@OnEvent('uplink.received')` in `EventsGateway` ✅
- `JwtAuthGuard` imported from `../auth/jwt-auth.guard` consistently across all controllers ✅
- `Roles` decorator imported from `../auth/roles.decorator` consistently ✅

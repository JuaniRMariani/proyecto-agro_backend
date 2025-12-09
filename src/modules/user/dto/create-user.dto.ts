import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    fullName: string;

    @IsString()
    @MinLength(6)
    password: string;

}
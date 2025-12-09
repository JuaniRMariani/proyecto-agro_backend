
export class UserResponseDto {
    id: string;
    fullName: string;
    email: string;

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}
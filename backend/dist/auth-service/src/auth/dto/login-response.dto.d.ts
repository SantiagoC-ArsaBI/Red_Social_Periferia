export declare class UserPayloadDto {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    alias: string;
}
export declare class LoginResponseDto {
    access_token: string;
    user: UserPayloadDto;
}

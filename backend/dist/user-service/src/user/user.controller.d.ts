import { ProfileResponseDto } from './dto/profile-response.dto';
import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: {
        user: {
            id: number;
        };
    }): Promise<ProfileResponseDto>;
}

import { CreatePostDto } from './dto/create-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { PostService } from './post.service';
export declare class PostController {
    private readonly postService;
    constructor(postService: PostService);
    create(req: {
        user: {
            id: number;
        };
    }, dto: CreatePostDto): Promise<PostResponseDto>;
    findAll(req: {
        user: {
            id: number;
        };
    }): Promise<PostResponseDto[]>;
    like(req: {
        user: {
            id: number;
        };
    }, postId: number): Promise<{
        postId: number;
        likesCount: number;
    }>;
}

export declare class PostAuthorDto {
    id: number;
    firstName: string;
    lastName: string;
    alias: string;
}
export declare class PostResponseDto {
    id: number;
    message: string;
    createdAt: string;
    authorId: number;
    author: PostAuthorDto;
    likesCount: number;
}

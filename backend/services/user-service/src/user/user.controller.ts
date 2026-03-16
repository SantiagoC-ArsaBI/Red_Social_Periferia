import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('Users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Nombres, Apellidos, Fecha de nacimiento, Alias', type: ProfileResponseDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getProfile(@Req() req: { user: { id: number } }): Promise<ProfileResponseDto> {
    return this.userService.getProfile(req.user.id);
  }
}

import { BadRequestException, PipeTransform } from '@nestjs/common';

export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 1) {
      throw new BadRequestException('El id de la publicación debe ser un entero positivo');
    }
    return num;
  }
}

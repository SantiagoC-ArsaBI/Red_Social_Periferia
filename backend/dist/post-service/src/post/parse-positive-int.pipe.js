"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsePositiveIntPipe = void 0;
const common_1 = require("@nestjs/common");
class ParsePositiveIntPipe {
    transform(value) {
        const num = parseInt(value, 10);
        if (Number.isNaN(num) || num < 1) {
            throw new common_1.BadRequestException('El id de la publicación debe ser un entero positivo');
        }
        return num;
    }
}
exports.ParsePositiveIntPipe = ParsePositiveIntPipe;
//# sourceMappingURL=parse-positive-int.pipe.js.map
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';
export declare const PERMISSION_KEY = "permission";
export declare const Permission: (moduleKey: string, action: PermissionAction) => import("@nestjs/common").CustomDecorator<string>;

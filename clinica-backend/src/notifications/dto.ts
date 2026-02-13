import { IsString } from 'class-validator';

export class SendTestMessageDto {
  @IsString()
  phone!: string;

  @IsString()
  message!: string;
}

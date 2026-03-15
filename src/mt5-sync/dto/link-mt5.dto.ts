import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class LinkMt5Dto {
  @IsNotEmpty()
  @IsString()
  mt5Login: string;

  @IsNotEmpty()
  @IsString()
  mt5Password: string;

  @IsNotEmpty()
  @IsString()
  mt5Server: string;
}

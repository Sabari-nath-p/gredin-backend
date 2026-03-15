import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkMt5Dto {
  @ApiProperty({
    description: 'MT5 Login ID',
    example: '12345678'
  })
  @IsNotEmpty()
  @IsString()
  mt5Login: string;

  @ApiProperty({
    description: 'MT5 Password',
    example: 'mysecretpass'
  })
  @IsNotEmpty()
  @IsString()
  mt5Password: string;

  @ApiProperty({
    description: 'MT5 Server Name',
    example: 'MetaQuotes-Demo'
  })
  @IsNotEmpty()
  @IsString()
  mt5Server: string;
}

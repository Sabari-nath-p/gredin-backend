import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send OTP to email',
    description: 'Sends a one-time password to the provided email. If user does not exist, creates a new account automatically with a random name. Default OTP is 759409 for all users.',
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email format' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify OTP and login',
    description: 'Verifies the OTP and returns JWT access token. Default OTP is 759409.',
  })
  @ApiResponse({ status: 200, description: 'OTP verified successfully, JWT token returned' })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Initiate Google OAuth login',
    description: 'Redirects to Google OAuth consent screen',
  })
  @ApiResponse({ status: 302, description: 'Redirect to Google OAuth' })
  async googleAuth() {
    // This route initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handles Google OAuth callback and returns JWT token',
  })
  @ApiResponse({ status: 200, description: 'Google login successful, JWT token returned' })
  @ApiResponse({ status: 401, description: 'Google authentication failed' })
  async googleAuthCallback(@Req() req) {
    return this.authService.googleLogin(req.user);
  }
}

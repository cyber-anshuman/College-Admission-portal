export interface OtpSender {
  send(identifier: string, otp: string): Promise<void>;
}

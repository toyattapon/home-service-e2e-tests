import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput = this.page.getByTestId('login-email-input');
  readonly passwordInput = this.page.getByTestId('login-password-input');
  readonly submitButton = this.page.getByTestId('login-submit-button');
  readonly errorMessage = this.page.getByTestId('login-error-message');

  async goto(): Promise<void> {
    await super.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

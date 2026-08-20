import type { Locator, Page } from '@playwright/test';
import { env } from '../config/env';

/**
 * Shared behavior for every page object: navigation relative to the web
 * app's base URL, the generic feedback/error banner (FeedbackBanner in the
 * SUT), and the shared ConfirmDialog used by every destructive/irreversible
 * action (cancel job, start job, complete job, mark invoice paid).
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected async goto(path: string): Promise<void> {
    await this.page.goto(new URL(path, env.webBaseUrl).toString());
  }

  /** The FeedbackBanner error/success alert region (role="alert"), when shown. */
  get feedbackBanner(): Locator {
    return this.page.getByRole('alert');
  }

  /** The shared ConfirmDialog (role="dialog") shown before irreversible actions. */
  get confirmDialog(): Locator {
    return this.page.getByRole('dialog');
  }

  async confirm(confirmLabel: string): Promise<void> {
    await this.confirmDialog.getByRole('button', { name: confirmLabel, exact: true }).click();
  }

  async dismissDialog(): Promise<void> {
    await this.confirmDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  }
}

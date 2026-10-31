import { Request, Response } from 'express';

import { ContactInquiry } from '../models/ContactInquiry';
import { DemoRequest } from '../models/DemoRequest';
import { NewsletterSubscriber } from '../models/NewsletterSubscriber';
import {
  ContactInquiryInput,
  DemoRequestInput,
  NewsletterInput,
} from '../types';

/** MongoDB duplicate-key errors carry code 11000. */
function isDuplicateKeyError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false;
  }
  return (error as { code?: unknown }).code === 11000;
}

/** POST /api/demo-requests (contract §2.5). */
export async function createDemoRequest(req: Request, res: Response): Promise<void> {
  const input = req.body as DemoRequestInput;

  const request = await DemoRequest.create({
    productId: input.productId,
    fullName: input.fullName,
    workEmail: input.workEmail,
    companyName: input.companyName?.trim() || undefined,
    message: input.message,
  });

  res.status(201).json({
    id: request._id,
    receivedAt: request.createdAt.toISOString(),
  });
}

/** POST /api/contact-inquiries (contract §2.5). */
export async function createContactInquiry(req: Request, res: Response): Promise<void> {
  const input = req.body as ContactInquiryInput;

  const inquiry = await ContactInquiry.create({
    fullName: input.fullName,
    email: input.email,
    company: input.company?.trim() || undefined,
    industry: input.industry?.trim() || undefined,
    message: input.message,
  });

  res.status(201).json({
    id: inquiry._id,
    receivedAt: inquiry.createdAt.toISOString(),
  });
}

/** POST /api/newsletter/subscriptions — duplicate email answers 409 (contract §2.5). */
export async function subscribeNewsletter(req: Request, res: Response): Promise<void> {
  const input = req.body as NewsletterInput;

  try {
    const subscriber = await NewsletterSubscriber.create({ email: input.email });
    res.status(201).json({ id: subscriber._id });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'This email is already subscribed to the newsletter.',
          fields: { email: 'This email is already subscribed.' },
        },
      });
      return;
    }
    throw error;
  }
}

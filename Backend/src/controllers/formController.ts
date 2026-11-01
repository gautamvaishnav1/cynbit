import { Request, Response } from 'express';

import { ContactInquiry } from '../models/ContactInquiry';
import { DemoRequest } from '../models/DemoRequest';
import { NewsletterSubscriber } from '../models/NewsletterSubscriber';
import {
  ContactInquiryInput,
  DemoRequestInput,
  NewsletterInput,
} from '../types';
import { isDBConnected } from '../config/db';
import { ApiError } from '../utils/ApiError';

/** ISO timestamp for a date. */
function toIso(value: Date): string {
  return value.toISOString();
}

/** 503 when MongoDB is not reachable. */
function requireDB(): void {
  if (!isDBConnected) {
    throw new ApiError(
      503,
      'INTERNAL',
      'Database is temporarily unavailable. Please try again later.',
    );
  }
}

/** POST /api/demo-requests (contract §2.5). */
export async function createDemoRequest(req: Request, res: Response): Promise<void> {
  requireDB();
  const input = req.body as DemoRequestInput;

  const request = await DemoRequest.create({
    productId: input.productId,
    fullName: input.fullName,
    workEmail: input.workEmail,
    companyName: input.companyName?.trim() || undefined,
    message: input.message,
  });

  res.status(201).json({
    id: request._id.toString(),
    receivedAt: toIso(request.createdAt),
  });
}

/** POST /api/contact-inquiries (contract §2.5). */
export async function createContactInquiry(req: Request, res: Response): Promise<void> {
  requireDB();
  const input = req.body as ContactInquiryInput;

  const inquiry = await ContactInquiry.create({
    fullName: input.fullName,
    email: input.email,
    company: input.company?.trim() || undefined,
    industry: input.industry?.trim() || undefined,
    message: input.message,
  });

  res.status(201).json({
    id: inquiry._id.toString(),
    receivedAt: toIso(inquiry.createdAt),
  });
}

/** POST /api/newsletter/subscriptions — duplicate email answers 409 (contract §2.5). */
export async function subscribeNewsletter(req: Request, res: Response): Promise<void> {
  requireDB();
  const input = req.body as NewsletterInput;

  try {
    const subscriber = await NewsletterSubscriber.create({
      email: input.email.toLowerCase(),
    });
    res.status(201).json({ id: subscriber._id.toString() });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 11000
    ) {
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

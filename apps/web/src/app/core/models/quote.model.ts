import { DoorConfiguration } from './configurator.model';

export type QuoteStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Quote {
  id: string;
  configurationSnapshot: DoorConfiguration;
  totalPrice: number;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientComment?: string;
  status: QuoteStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuoteRequest {
  configuration: DoorConfiguration;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientComment?: string;
}

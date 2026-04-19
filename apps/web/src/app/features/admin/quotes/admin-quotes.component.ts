import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Quote, QuoteStatus } from '../../../core/models/quote.model';

@Component({
  selector: 'app-admin-quotes',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="admin-page__header">
        <h1>{{ 'admin.quotes.title' | translate }}</h1>
        <div class="filter-bar">
          <select class="form-select form-select--sm" [(ngModel)]="filterStatus" (ngModelChange)="loadQuotes()">
            <option value="">All</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-center"><div class="spinner"></div></div>
      } @else {
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>{{ 'admin.quotes.client' | translate }}</th>
                <th>{{ 'admin.quotes.phone' | translate }}</th>
                <th>{{ 'admin.quotes.total' | translate }}</th>
                <th>{{ 'admin.quotes.status' | translate }}</th>
                <th>{{ 'admin.quotes.date' | translate }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (quote of quotes(); track quote.id) {
                <tr>
                  <td><strong>{{ quote.clientName }}</strong></td>
                  <td>{{ quote.clientPhone }}</td>
                  <td>{{ quote.totalPrice | number:'1.0-0' }} €</td>
                  <td>
                    <span class="badge" [class]="getStatusClass(quote.status)">
                      {{ quote.status }}
                    </span>
                  </td>
                  <td>{{ quote.createdAt | date:'dd.MM.yyyy' }}</td>
                  <td>
                    <button class="btn btn--ghost btn--sm" (click)="openQuote(quote)">
                      {{ 'admin.quotes.view' | translate }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    @if (selectedQuote()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <button class="modal__close" (click)="closeModal()">✕</button>
          <h2>Quote #{{ selectedQuote()!.id.slice(-6) }}</h2>
          <div class="modal-grid">
            <div><strong>Client:</strong> {{ selectedQuote()!.clientName }}</div>
            <div><strong>Phone:</strong> {{ selectedQuote()!.clientPhone }}</div>
            @if (selectedQuote()!.clientEmail) {
              <div><strong>Email:</strong> {{ selectedQuote()!.clientEmail }}</div>
            }
            @if (selectedQuote()!.clientComment) {
              <div class="modal-grid--full"><strong>Comment:</strong> {{ selectedQuote()!.clientComment }}</div>
            }
            <div><strong>Total:</strong> {{ selectedQuote()!.totalPrice }} €</div>
            <div><strong>Opening:</strong> {{ selectedQuote()!.configurationSnapshot.openingWidth }} × {{ selectedQuote()!.configurationSnapshot.openingHeight }} mm</div>
          </div>
          <div class="modal-status">
            <label class="form-label">Update Status:</label>
            <select class="form-select" [(ngModel)]="newStatus">
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button class="btn btn--primary" (click)="updateStatus()">Save</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-page { padding: var(--space-xl); &__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xl); h1 { font-family: var(--font-display); font-size: 28px; } } }
    .loading-center { display: flex; justify-content: center; padding: var(--space-3xl); }
    .filter-bar { display: flex; gap: var(--space-sm); }
    .form-select--sm { padding: 8px 12px; font-size: 14px; }
    .admin-table-wrap { overflow-x: auto; background: var(--color-white); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
    .admin-table { width: 100%; border-collapse: collapse; th { padding: var(--space-md) var(--space-lg); text-align: left; font-size: 13px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--color-border); background: var(--color-off-white); } td { padding: var(--space-md) var(--space-lg); font-size: 14px; border-bottom: 1px solid var(--color-border); } tr:last-child td { border-bottom: none; } tr:hover td { background: var(--color-off-white); } }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: var(--space-lg); }
    .modal { background: var(--color-white); border-radius: var(--radius-xl); padding: var(--space-2xl); width: 100%; max-width: 560px; position: relative; max-height: 80vh; overflow-y: auto; h2 { font-family: var(--font-display); font-size: 22px; margin-bottom: var(--space-xl); } &__close { position: absolute; top: var(--space-lg); right: var(--space-lg); font-size: 18px; background: none; border: none; color: var(--color-text-muted); cursor: pointer; } }
    .modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-bottom: var(--space-xl); font-size: 15px; &--full { grid-column: 1/-1; } }
    .modal-status { display: flex; gap: var(--space-md); align-items: flex-end; flex-wrap: wrap; }
  `],
})
export class AdminQuotesComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly quotes = signal<Quote[]>([]);
  readonly loading = signal(true);
  readonly selectedQuote = signal<Quote | null>(null);
  filterStatus = '';
  newStatus: QuoteStatus = 'NEW';

  ngOnInit(): void {
    this.loadQuotes();
  }

  loadQuotes(): void {
    this.loading.set(true);
    this.api
      .getAdminQuotes(1, 50, this.filterStatus as QuoteStatus || undefined)
      .subscribe({
        next: (res) => {
          this.quotes.set(res.data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  openQuote(quote: Quote): void {
    this.selectedQuote.set(quote);
    this.newStatus = quote.status;
  }

  closeModal(): void {
    this.selectedQuote.set(null);
  }

  updateStatus(): void {
    const quote = this.selectedQuote();
    if (!quote) return;
    this.api.updateQuoteStatus(quote.id, this.newStatus).subscribe({
      next: (updated) => {
        this.quotes.update((qs) =>
          qs.map((q) => (q.id === updated.id ? updated : q)),
        );
        this.closeModal();
      },
    });
  }

  getStatusClass(status: QuoteStatus): string {
    const map: Record<QuoteStatus, string> = {
      NEW: 'badge--new',
      IN_PROGRESS: 'badge--in-progress',
      COMPLETED: 'badge--completed',
      CANCELLED: 'badge--cancelled',
    };
    return map[status] ?? '';
  }
}

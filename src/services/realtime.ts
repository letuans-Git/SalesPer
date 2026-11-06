/**
 * Real-Time Service: Listens to Instant Google Sheets Change Notifications
 * Uses Server-Sent Events (SSE) to receive real-time push alerts from Google Sheets onEdit/onChange
 */

export interface WebhookInfo {
  webhookUrl: string;
  activeSubscribers: number;
  gasTriggerCode: string;
}

export type SheetChangeCallback = (event: {
  type: string;
  timestamp: string;
  source: string;
  details?: any;
}) => void;

class RealtimeSheetService {
  private eventSource: EventSource | null = null;
  private listeners: Set<SheetChangeCallback> = new Set();
  private isConnecting: boolean = false;
  private reconnectTimer: any = null;

  public subscribe(cb: SheetChangeCallback): () => void {
    this.listeners.add(cb);
    if (!this.eventSource && !this.isConnecting) {
      this.connect();
    }
    return () => {
      this.listeners.delete(cb);
      if (this.listeners.size === 0 && this.eventSource) {
        this.disconnect();
      }
    };
  }

  public connect(): void {
    if (this.eventSource || typeof window === 'undefined') return;

    this.isConnecting = true;
    try {
      this.eventSource = new EventSource('/api/sheets/stream');

      this.eventSource.onopen = () => {
        this.isConnecting = false;
        console.log('[SSE] Connected to real-time Google Sheets stream');
      };

      this.eventSource.onmessage = (event) => {
        try {
          if (!event.data || event.data.startsWith(':')) return; // heartbeat
          const parsed = JSON.parse(event.data);

          if (parsed.type === 'SHEET_EDITED_INSTANT') {
            console.log('[SSE] Instant sheet change detected:', parsed);
            this.listeners.forEach((listener) => {
              try {
                listener(parsed);
              } catch (e) {
                console.error('Listener callback error:', e);
              }
            });
          }
        } catch (err) {
          console.warn('[SSE] Failed to parse event data:', event.data, err);
        }
      };

      this.eventSource.onerror = () => {
        console.warn('[SSE] Connection interrupted, attempting reconnect in 5s...');
        this.disconnect();
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          if (this.listeners.size > 0) {
            this.connect();
          }
        }, 5000);
      };
    } catch (e) {
      this.isConnecting = false;
      console.error('[SSE] Failed to initialize EventSource:', e);
    }
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnecting = false;
  }
}

export const realtimeSheetService = new RealtimeSheetService();

export async function fetchWebhookInfo(): Promise<WebhookInfo | null> {
  try {
    const res = await fetch('/api/sheets/webhook-info');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch webhook info:', err);
    return null;
  }
}

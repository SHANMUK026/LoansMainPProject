import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  show: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toasts.asObservable();
  private toastId = 0;

  constructor() {}

  showSuccess(title: string, message: string, duration = 5000): void {
    this.showToast('success', title, message, duration);
  }

  showError(title: string, message: string, duration = 7000): void {
    this.showToast('error', title, message, duration);
  }

  showWarning(title: string, message: string, duration = 6000): void {
    this.showToast('warning', title, message, duration);
  }

  showInfo(title: string, message: string, duration = 5000): void {
    this.showToast('info', title, message, duration);
  }

  private showToast(type: Toast['type'], title: string, message: string, duration: number): void {
    const toast: Toast = {
      id: ++this.toastId,
      type,
      title,
      message,
      duration,
      show: true
    };

    const currentToasts = this.toasts.value;
    this.toasts.next([...currentToasts, toast]);

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }
  }

  removeToast(id: number): void {
    const currentToasts = this.toasts.value;
    const updatedToasts = currentToasts.map(toast => 
      toast.id === id ? { ...toast, show: false } : toast
    );
    
    this.toasts.next(updatedToasts);

    // Remove from array after animation
    setTimeout(() => {
      const finalToasts = this.toasts.value.filter(toast => toast.id !== id);
      this.toasts.next(finalToasts);
    }, 300);
  }

  clearAll(): void {
    this.toasts.next([]);
  }
}

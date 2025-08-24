import { TestBed } from '@angular/core/testing';
import { ToastService, Toast } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService]
    });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success toast', () => {
    spyOn(service, 'showToast');
    
    service.showSuccess('Success Title', 'Success Message', 5000);
    
    expect(service.showToast).toHaveBeenCalledWith('success', 'Success Title', 'Success Message', 5000);
  });

  it('should show error toast', () => {
    spyOn(service, 'showToast');
    
    service.showError('Error Title', 'Error Message', 7000);
    
    expect(service.showToast).toHaveBeenCalledWith('error', 'Error Title', 'Error Message', 7000);
  });

  it('should show warning toast', () => {
    spyOn(service, 'showToast');
    
    service.showWarning('Warning Title', 'Warning Message', 6000);
    
    expect(service.showToast).toHaveBeenCalledWith('warning', 'Warning Title', 'Warning Message', 6000);
  });

  it('should show info toast', () => {
    spyOn(service, 'showToast');
    
    service.showInfo('Info Title', 'Info Message', 5000);
    
    expect(service.showToast).toHaveBeenCalledWith('info', 'Info Title', 'Info Message', 5000);
  });

  it('should use default duration for success toast', () => {
    spyOn(service, 'showToast');
    
    service.showSuccess('Title', 'Message');
    
    expect(service.showToast).toHaveBeenCalledWith('success', 'Title', 'Message', 5000);
  });

  it('should use default duration for error toast', () => {
    spyOn(service, 'showToast');
    
    service.showError('Title', 'Message');
    
    expect(service.showToast).toHaveBeenCalledWith('error', 'Title', 'Message', 7000);
  });

  it('should use default duration for warning toast', () => {
    spyOn(service, 'showToast');
    
    service.showWarning('Title', 'Message');
    
    expect(service.showToast).toHaveBeenCalledWith('warning', 'Title', 'Message', 6000);
  });

  it('should use default duration for info toast', () => {
    spyOn(service, 'showToast');
    
    service.showInfo('Title', 'Message');
    
    expect(service.showToast).toHaveBeenCalledWith('info', 'Title', 'Message', 5000);
  });

  it('should create toast with correct properties', () => {
    const title = 'Test Title';
    const message = 'Test Message';
    const duration = 3000;
    
    service.showSuccess(title, message, duration);
    
    service.toasts$.subscribe(toasts => {
      expect(toasts.length).toBe(1);
      const toast = toasts[0];
      expect(toast.type).toBe('success');
      expect(toast.title).toBe(title);
      expect(toast.message).toBe(message);
      expect(toast.duration).toBe(duration);
      expect(toast.show).toBe(true);
      expect(toast.id).toBeGreaterThan(0);
    });
  });

  it('should increment toast ID for each new toast', () => {
    service.showSuccess('Title 1', 'Message 1');
    service.showSuccess('Title 2', 'Message 2');
    
    service.toasts$.subscribe(toasts => {
      expect(toasts.length).toBe(2);
      expect(toasts[0].id).toBe(1);
      expect(toasts[1].id).toBe(2);
    });
  });

  it('should remove toast after duration', (done) => {
    const shortDuration = 100; // 100ms for testing
    
    service.showSuccess('Title', 'Message', shortDuration);
    
    setTimeout(() => {
      service.toasts$.subscribe(toasts => {
        expect(toasts.length).toBe(0);
        done();
      });
    }, shortDuration + 50);
  });

  it('should not auto-remove toast with zero duration', (done) => {
    service.showSuccess('Title', 'Message', 0);
    
    setTimeout(() => {
      service.toasts$.subscribe(toasts => {
        expect(toasts.length).toBe(1);
        done();
      });
    }, 100);
  });

  it('should remove toast when removeToast is called', () => {
    service.showSuccess('Title', 'Message');
    
    service.toasts$.subscribe(toasts => {
      if (toasts.length > 0) {
        const toastId = toasts[0].id;
        service.removeToast(toastId);
        
        // Should mark as hidden first
        expect(toasts.find(t => t.id === toastId)?.show).toBe(false);
        
        // Then remove after animation delay
        setTimeout(() => {
          service.toasts$.subscribe(updatedToasts => {
            expect(updatedToasts.find(t => t.id === toastId)).toBeUndefined();
          });
        }, 350);
      }
    });
  });

  it('should clear all toasts', () => {
    service.showSuccess('Title 1', 'Message 1');
    service.showError('Title 2', 'Message 2');
    service.showWarning('Title 3', 'Message 3');
    
    service.clearAll();
    
    service.toasts$.subscribe(toasts => {
      expect(toasts.length).toBe(0);
    });
  });

  it('should handle multiple toasts correctly', () => {
    service.showSuccess('Success', 'Message 1');
    service.showError('Error', 'Message 2');
    service.showWarning('Warning', 'Message 3');
    
    service.toasts$.subscribe(toasts => {
      expect(toasts.length).toBe(3);
      expect(toasts[0].type).toBe('success');
      expect(toasts[1].type).toBe('error');
      expect(toasts[2].type).toBe('warning');
    });
  });

  it('should maintain toast order', () => {
    service.showSuccess('First', 'Message 1');
    service.showError('Second', 'Message 2');
    
    service.toasts$.subscribe(toasts => {
      expect(toasts[0].title).toBe('First');
      expect(toasts[1].title).toBe('Second');
    });
  });

  it('should handle rapid toast creation', () => {
    for (let i = 0; i < 5; i++) {
      service.showSuccess(`Title ${i}`, `Message ${i}`);
    }
    
    service.toasts$.subscribe(toasts => {
      expect(toasts.length).toBe(5);
      expect(toasts[4].id).toBe(5);
    });
  });

  it('should handle toast removal during animation', () => {
    service.showSuccess('Title', 'Message');
    
    service.toasts$.subscribe(toasts => {
      if (toasts.length > 0) {
        const toastId = toasts[0].id;
        
        // Remove immediately
        service.removeToast(toastId);
        
        // Should still be in array but marked as hidden
        const toast = toasts.find(t => t.id === toastId);
        expect(toast?.show).toBe(false);
      }
    });
  });

  it('should emit toast updates to subscribers', (done) => {
    let updateCount = 0;
    
    service.toasts$.subscribe(() => {
      updateCount++;
      if (updateCount === 2) { // Initial + after adding toast
        expect(updateCount).toBe(2);
        done();
      }
    });
    
    service.showSuccess('Title', 'Message');
  });

  it('should handle edge case of removing non-existent toast', () => {
    service.showSuccess('Title', 'Message');
    
    // Try to remove non-existent toast
    service.removeToast(999);
    
    service.toasts$.subscribe(toasts => {
      // Should not affect existing toasts
      expect(toasts.length).toBe(1);
    });
  });

  it('should handle edge case of clearing empty toast list', () => {
    service.clearAll();
    
    service.toasts$.subscribe(toasts => {
      expect(toasts.length).toBe(0);
    });
  });
});

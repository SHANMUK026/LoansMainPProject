import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { of } from 'rxjs';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  const mockToasts: Toast[] = [
    {
      id: 1,
      type: 'success',
      title: 'Success',
      message: 'Operation completed successfully',
      duration: 5000,
      show: true
    },
    {
      id: 2,
      type: 'error',
      title: 'Error',
      message: 'Something went wrong',
      duration: 7000,
      show: true
    },
    {
      id: 3,
      type: 'warning',
      title: 'Warning',
      message: 'Please check your input',
      duration: 6000,
      show: true
    },
    {
      id: 4,
      type: 'info',
      title: 'Info',
      message: 'Here is some information',
      duration: 5000,
      show: true
    }
  ];

  beforeEach(async () => {
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['removeToast'], {
      toasts$: of(mockToasts)
    });

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    mockToastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with toasts from service', () => {
    fixture.detectChanges();
    
    expect(component.toasts).toEqual(mockToasts);
    expect(component.toasts.length).toBe(4);
  });

  it('should call removeToast when close button is clicked', () => {
    fixture.detectChanges();
    
    const toastId = 1;
    component.removeToast(toastId);
    
    expect(mockToastService.removeToast).toHaveBeenCalledWith(toastId);
  });

  it('should get correct toast icon for success type', () => {
    const icon = component.getToastIcon('success');
    expect(icon).toBe('✅');
  });

  it('should get correct toast icon for error type', () => {
    const icon = component.getToastIcon('error');
    expect(icon).toBe('❌');
  });

  it('should get correct toast icon for warning type', () => {
    const icon = component.getToastIcon('warning');
    expect(icon).toBe('⚠️');
  });

  it('should get correct toast icon for info type', () => {
    const icon = component.getToastIcon('info');
    expect(icon).toBe('ℹ️');
  });

  it('should get correct toast icon for unknown type', () => {
    const icon = component.getToastIcon('unknown');
    expect(icon).toBe('📢');
  });

  it('should get correct toast class for success type', () => {
    const className = component.getToastClass('success');
    expect(className).toBe('toast-success');
  });

  it('should get correct toast class for error type', () => {
    const className = component.getToastClass('error');
    expect(className).toBe('toast-error');
  });

  it('should get correct toast class for warning type', () => {
    const className = component.getToastClass('warning');
    expect(className).toBe('toast-warning');
  });

  it('should get correct toast class for info type', () => {
    const className = component.getToastClass('info');
    expect(className).toBe('toast-info');
  });

  it('should display all toast types correctly', () => {
    fixture.detectChanges();
    
    const toastElements = fixture.nativeElement.querySelectorAll('.toast');
    expect(toastElements.length).toBe(4);
    
    // Check if each toast type is displayed
    const successToast = fixture.nativeElement.querySelector('.toast-success');
    const errorToast = fixture.nativeElement.querySelector('.toast-error');
    const warningToast = fixture.nativeElement.querySelector('.toast-warning');
    const infoToast = fixture.nativeElement.querySelector('.toast-info');
    
    expect(successToast).toBeTruthy();
    expect(errorToast).toBeTruthy();
    expect(warningToast).toBeTruthy();
    expect(infoToast).toBeTruthy();
  });

  it('should display toast title and message correctly', () => {
    fixture.detectChanges();
    
    const firstToast = mockToasts[0];
    const titleElement = fixture.nativeElement.querySelector('.toast-title');
    const messageElement = fixture.nativeElement.querySelector('.toast-message');
    
    expect(titleElement.textContent).toContain(firstToast.title);
    expect(messageElement.textContent).toContain(firstToast.message);
  });

  it('should display toast icon correctly', () => {
    fixture.detectChanges();
    
    const iconElements = fixture.nativeElement.querySelectorAll('.toast-icon');
    expect(iconElements.length).toBe(4);
    
    // Check if icons are displayed
    iconElements.forEach((icon: Element, index: number) => {
      expect(icon.textContent).toBeTruthy();
    });
  });

  it('should display close button for each toast', () => {
    fixture.detectChanges();
    
    const closeButtons = fixture.nativeElement.querySelectorAll('.toast-close');
    expect(closeButtons.length).toBe(4);
    
    closeButtons.forEach((button: Element) => {
      expect(button).toBeTruthy();
      expect(button.querySelector('.close-icon')).toBeTruthy();
    });
  });

  it('should display progress bar for toasts with duration', () => {
    fixture.detectChanges();
    
    const progressBars = fixture.nativeElement.querySelectorAll('.toast-progress');
    expect(progressBars.length).toBe(4); // All toasts have duration
    
    progressBars.forEach((progress: Element) => {
      expect(progress.querySelector('.progress-bar')).toBeTruthy();
    });
  });

  it('should handle empty toast list', () => {
    mockToastService.toasts$ = of([]);
    fixture.detectChanges();
    
    expect(component.toasts.length).toBe(0);
    
    const toastElements = fixture.nativeElement.querySelectorAll('.toast');
    expect(toastElements.length).toBe(0);
  });

  it('should handle toasts without duration', () => {
    const toastsWithoutDuration = mockToasts.map(toast => ({ ...toast, duration: 0 }));
    mockToastService.toasts$ = of(toastsWithoutDuration);
    fixture.detectChanges();
    
    const progressBars = fixture.nativeElement.querySelectorAll('.toast-progress');
    expect(progressBars.length).toBe(0); // No progress bars for toasts without duration
  });

  it('should handle toasts with undefined duration', () => {
    const toastsWithUndefinedDuration = mockToasts.map(toast => ({ ...toast, duration: undefined }));
    mockToastService.toasts$ = of(toastsWithUndefinedDuration);
    fixture.detectChanges();
    
    const progressBars = fixture.nativeElement.querySelectorAll('.toast-progress');
    expect(progressBars.length).toBe(0); // No progress bars for toasts without duration
  });

  it('should update toasts when service emits new values', () => {
    const newToasts = [
      {
        id: 5,
        type: 'success' as const,
        title: 'New Toast',
        message: 'This is a new toast',
        duration: 5000,
        show: true
      }
    ];
    
    mockToastService.toasts$ = of(newToasts);
    fixture.detectChanges();
    
    expect(component.toasts).toEqual(newToasts);
    expect(component.toasts.length).toBe(1);
  });

  it('should handle toasts with show: false', () => {
    const hiddenToasts = mockToasts.map(toast => ({ ...toast, show: false }));
    mockToastService.toasts$ = of(hiddenToasts);
    fixture.detectChanges();
    
    expect(component.toasts).toEqual(hiddenToasts);
    
    // All toasts should have show: false
    component.toasts.forEach(toast => {
      expect(toast.show).toBe(false);
    });
  });

  it('should handle mixed show states', () => {
    const mixedToasts = [
      { ...mockToasts[0], show: true },
      { ...mockToasts[1], show: false },
      { ...mockToasts[2], show: true },
      { ...mockToasts[3], show: false }
    ];
    
    mockToastService.toasts$ = of(mixedToasts);
    fixture.detectChanges();
    
    expect(component.toasts).toEqual(mixedToasts);
    
    const visibleToasts = component.toasts.filter(toast => toast.show);
    const hiddenToasts = component.toasts.filter(toast => !toast.show);
    
    expect(visibleToasts.length).toBe(2);
    expect(hiddenToasts.length).toBe(2);
  });

  it('should handle edge case of null toasts', () => {
    mockToastService.toasts$ = of(null as any);
    fixture.detectChanges();
    
    expect(component.toasts).toBeNull();
  });

  it('should handle edge case of undefined toasts', () => {
    mockToastService.toasts$ = of(undefined as any);
    fixture.detectChanges();
    
    expect(component.toasts).toBeUndefined();
  });

  it('should maintain toast order from service', () => {
    fixture.detectChanges();
    
    for (let i = 0; i < component.toasts.length; i++) {
      expect(component.toasts[i].id).toBe(mockToasts[i].id);
      expect(component.toasts[i].type).toBe(mockToasts[i].type);
    }
  });

  it('should handle rapid toast updates', () => {
    const updateCount = 0;
    const rapidToasts = [
      { id: 1, type: 'success' as const, title: 'Toast 1', message: 'Message 1', show: true },
      { id: 2, type: 'error' as const, title: 'Toast 2', message: 'Message 2', show: true },
      { id: 3, type: 'warning' as const, title: 'Toast 3', message: 'Message 3', show: true }
    ];
    
    mockToastService.toasts$ = of(rapidToasts);
    fixture.detectChanges();
    
    expect(component.toasts.length).toBe(3);
    expect(component.toasts[0].id).toBe(1);
    expect(component.toasts[1].id).toBe(2);
    expect(component.toasts[2].id).toBe(3);
  });
});

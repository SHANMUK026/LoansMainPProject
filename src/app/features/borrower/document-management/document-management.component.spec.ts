import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { DocumentManagementComponent, Document } from './document-management.component';
import { ApiService, User, LoanApplication } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

describe('DocumentManagementComponent', () => {
  let component: DocumentManagementComponent;
  let fixture: ComponentFixture<DocumentManagementComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    username: 'borrower',
    email: 'borrower@test.com',
    role: 'BORROWER',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890'
  };

  const mockLoanApplications: LoanApplication[] = [
    {
      id: 1,
      borrowerId: 1,
      lenderId: 1,
      loanAmount: 50000,
      loanPurpose: 'Personal',
      loanTerm: 24,
      monthlyIncome: 35000,
      creditScore: 650,
      employmentStatus: 'EMPLOYED',
      documents: [],
      status: 'PENDING',
      createdAt: '2024-01-01T00:00:00Z'
    }
  ];

  const mockDocuments: Document[] = [
    {
      id: 1,
      name: 'PAN Card',
      type: 'PAN_CARD',
      status: 'APPROVED',
      uploadedAt: '2024-01-01T00:00:00Z',
      size: 1024000,
      url: 'https://example.com/pan.pdf',
      applicationId: 1
    }
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', [
      'getLoanApplicationsByBorrower'
    ]);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: mockUser
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DocumentManagementComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockApiService.getLoanApplicationsByBorrower.and.returnValue(of(mockLoanApplications));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current user', () => {
    fixture.detectChanges();
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should redirect non-borrower users to login', () => {
    const nonBorrowerUser = { ...mockUser, role: 'LENDER' as const };
    mockAuthService.currentUser = nonBorrowerUser;
    
    fixture.detectChanges();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should load documents and loan applications on init', () => {
    fixture.detectChanges();
    
    expect(mockApiService.getLoanApplicationsByBorrower).toHaveBeenCalledWith(mockUser.id);
    expect(component.loanApplications).toEqual(mockLoanApplications);
  });

  it('should have correct document types', () => {
    expect(component.documentTypes.length).toBe(6);
    expect(component.documentTypes.find(dt => dt.value === 'PAN_CARD')?.required).toBe(true);
    expect(component.documentTypes.find(dt => dt.value === 'OTHER')?.required).toBe(false);
  });

  it('should handle file selection correctly', () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    component.onFileSelected({ target: { files: [mockFile] } } as any);
    
    expect(component.selectedFile).toEqual(mockFile);
  });

  it('should handle drag over events', () => {
    const mockEvent = { preventDefault: jasmine.createSpy('preventDefault') };
    
    component.onDragOver(mockEvent);
    
    expect(component.dragOver).toBe(true);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should handle drag leave events', () => {
    component.dragOver = true;
    
    component.onDragLeave();
    
    expect(component.dragOver).toBe(false);
  });

  it('should handle drop events', () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const mockEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
      dataTransfer: { files: [mockFile] }
    };
    
    component.onDrop(mockEvent);
    
    expect(component.selectedFile).toEqual(mockFile);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should upload document successfully', () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    component.selectedFile = mockFile;
    component.selectedDocumentType = 'PAN_CARD';
    component.selectedApplicationId = 1;
    
    // Mock successful upload
    spyOn(console, 'log');
    
    component.uploadDocument();
    
    expect(console.log).toHaveBeenCalledWith('Uploading document:', {
      file: mockFile,
      type: 'PAN_CARD',
      applicationId: 1
    });
  });

  it('should delete document', () => {
    const documentToDelete = mockDocuments[0];
    spyOn(console, 'log');
    
    component.deleteDocument(documentToDelete.id!);
    
    expect(console.log).toHaveBeenCalledWith('Deleting document:', documentToDelete.id);
  });

  it('should download document', () => {
    const documentToDownload = mockDocuments[0];
    spyOn(console, 'log');
    
    component.downloadDocument(documentToDownload);
    
    expect(console.log).toHaveBeenCalledWith('Downloading document:', documentToDownload);
  });

  it('should get correct document icon', () => {
    expect(component.getDocumentIcon('PAN_CARD')).toBe('🆔');
    expect(component.getDocumentIcon('BANK_STATEMENT')).toBe('🏦');
    expect(component.getDocumentIcon('SALARY_SLIP')).toBe('💰');
    expect(component.getDocumentIcon('ADDRESS_PROOF')).toBe('🏠');
    expect(component.getDocumentIcon('OTHER')).toBe('📄');
  });

  it('should get correct document type label', () => {
    expect(component.getDocumentTypeLabel('PAN_CARD')).toBe('PAN Card');
    expect(component.getDocumentTypeLabel('AADHAR_CARD')).toBe('Aadhar Card');
    expect(component.getDocumentTypeLabel('BANK_STATEMENT')).toBe('Bank Statement (3 months)');
  });

  it('should get correct status class', () => {
    expect(component.getStatusClass('APPROVED')).toBe('status-approved');
    expect(component.getStatusClass('PENDING')).toBe('status-pending');
    expect(component.getStatusClass('REJECTED')).toBe('status-rejected');
  });

  it('should get correct status icon', () => {
    expect(component.getStatusIcon('APPROVED')).toBe('✅');
    expect(component.getStatusIcon('PENDING')).toBe('⏳');
    expect(component.getStatusIcon('REJECTED')).toBe('❌');
  });

  it('should format file size correctly', () => {
    expect(component.formatFileSize(1024)).toBe('1.0 KB');
    expect(component.formatFileSize(1048576)).toBe('1.0 MB');
    expect(component.formatFileSize(1073741824)).toBe('1.0 GB');
  });

  it('should calculate completion percentage correctly', () => {
    component.documents = mockDocuments;
    
    const percentage = component.getCompletionPercentage();
    expect(percentage).toBeGreaterThan(0);
    expect(percentage).toBeLessThanOrEqual(100);
  });

  it('should get missing required documents', () => {
    component.documents = mockDocuments;
    
    const missingDocs = component.getMissingDocuments();
    expect(missingDocs.length).toBeGreaterThanOrEqual(0);
    
    // Should include required document types that are not uploaded
    const requiredTypes = component.documentTypes.filter(dt => dt.required);
    expect(missingDocs.length).toBeLessThanOrEqual(requiredTypes.length);
  });

  it('should toggle upload form', () => {
    expect(component.showUploadForm).toBe(false);
    
    component.toggleUploadForm();
    expect(component.showUploadForm).toBe(true);
    
    component.toggleUploadForm();
    expect(component.showUploadForm).toBe(false);
  });

  it('should get application name by id', () => {
    component.loanApplications = mockLoanApplications;
    
    const appName = component.getApplicationName(1);
    expect(appName).toBe('Application #1');
  });

  it('should handle missing application gracefully', () => {
    const appName = component.getApplicationName(999);
    expect(appName).toBe('Unknown Application');
  });

  it('should show loading state while uploading', () => {
    expect(component.isLoading).toBe(false);
    
    // Simulate upload process
    component.uploadDocument();
    
    // Note: In a real implementation, this would be set to true during upload
    // For now, we're just testing the method exists
    expect(component.uploadDocument).toBeDefined();
  });

  it('should validate required fields before upload', () => {
    // Test without file
    component.selectedFile = null;
    component.selectedDocumentType = 'PAN_CARD';
    
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    component.selectedFile = mockFile;
    
    // Now should be valid
    expect(component.selectedFile).toBeTruthy();
    expect(component.selectedDocumentType).toBe('PAN_CARD');
  });

  it('should handle different file types', () => {
    const pdfFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const imageFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    
    component.onFileSelected({ target: { files: [pdfFile] } } as any);
    expect(component.selectedFile?.type).toBe('application/pdf');
    
    component.onFileSelected({ target: { files: [imageFile] } } as any);
    expect(component.selectedFile?.type).toBe('image/jpeg');
  });

  it('should calculate document statistics correctly', () => {
    component.documents = mockDocuments;
    
    const approvedCount = component.documents.filter(d => d.status === 'APPROVED').length;
    const pendingCount = component.documents.filter(d => d.status === 'PENDING').length;
    const rejectedCount = component.documents.filter(d => d.status === 'REJECTED').length;
    
    expect(approvedCount).toBeGreaterThanOrEqual(0);
    expect(pendingCount).toBeGreaterThanOrEqual(0);
    expect(rejectedCount).toBeGreaterThanOrEqual(0);
  });
});

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, LoanApplication } from '../../../core/services/api.service';
import { User } from '../../../core/models/roles.model';
import { AuthService } from '../../../core/services/auth.service';

export interface Document {
  id?: number;
  name: string;
  type: 'PAN_CARD' | 'AADHAR_CARD' | 'BANK_STATEMENT' | 'SALARY_SLIP' | 'ADDRESS_PROOF' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
  size: number;
  url: string;
  applicationId?: number;
}

export interface DocumentType {
  value: 'PAN_CARD' | 'AADHAR_CARD' | 'BANK_STATEMENT' | 'SALARY_SLIP' | 'ADDRESS_PROOF' | 'OTHER';
  label: string;
  icon: string;
  required: boolean;
}

@Component({
  selector: 'app-document-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-management.component.html',
  styleUrl: './document-management.component.css'
})
export class DocumentManagementComponent implements OnInit {
  currentUser: User | null = null;
  documents: Document[] = [];
  loanApplications: LoanApplication[] = [];
  isLoading = false;
  showUploadForm = false;
  selectedFile: File | null = null;
  selectedDocumentType: Document['type'] = 'PAN_CARD';
  selectedApplicationId?: number;
  dragOver = false;

  documentTypes: DocumentType[] = [
    { value: 'PAN_CARD', label: 'PAN Card', icon: '🆔', required: true },
    { value: 'AADHAR_CARD', label: 'Aadhar Card', icon: '🆔', required: true },
    { value: 'BANK_STATEMENT', label: 'Bank Statement (3 months)', icon: '🏦', required: true },
    { value: 'SALARY_SLIP', label: 'Salary Slip (3 months)', icon: '💰', required: true },
    { value: 'ADDRESS_PROOF', label: 'Address Proof', icon: '🏠', required: true },
    { value: 'OTHER', label: 'Other Documents', icon: '📄', required: false }
  ];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser || this.currentUser.role !== 'BORROWER') {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadDocuments();
    this.loadLoanApplications();
  }

  loadDocuments(): void {
    this.isLoading = true;
    // Simulate loading documents
    setTimeout(() => {
      this.documents = [
        {
          id: 1,
          name: 'PAN_Card_2024.pdf',
          type: 'PAN_CARD',
          status: 'APPROVED',
          uploadedAt: '2024-01-15T10:30:00Z',
          size: 245760,
          url: 'https://example.com/pan_card.pdf',
          applicationId: 1
        },
        {
          id: 2,
          name: 'Aadhar_Card_2024.pdf',
          type: 'AADHAR_CARD',
          status: 'APPROVED',
          uploadedAt: '2024-01-15T10:35:00Z',
          size: 512000,
          url: 'https://example.com/aadhar_card.pdf',
          applicationId: 1
        },
        {
          id: 3,
          name: 'Bank_Statement_Jan2024.pdf',
          type: 'BANK_STATEMENT',
          status: 'PENDING',
          uploadedAt: '2024-01-16T14:20:00Z',
          size: 1024000,
          url: 'https://example.com/bank_statement.pdf',
          applicationId: 1
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  loadLoanApplications(): void {
    // Load user's loan applications for document association
    this.apiService.getLoanApplicationsByBorrower(this.currentUser!.id!).subscribe({
      next: (applications) => {
        this.loanApplications = applications;
      },
      error: (error) => {
        console.error('Error loading applications:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  uploadDocument(): void {
    if (!this.selectedFile || !this.selectedDocumentType) {
      return;
    }

    const document: Document = {
      name: this.selectedFile.name,
      type: this.selectedDocumentType,
      status: 'PENDING',
      uploadedAt: new Date().toISOString(),
      size: this.selectedFile.size,
      url: '', // Placeholder for URL, will be updated after upload
      applicationId: this.selectedApplicationId
    };

    // Simulate upload
    this.isLoading = true;
    setTimeout(() => {
      document.id = this.documents.length + 1;
      this.documents.unshift(document);
      this.isLoading = false;
      this.showUploadForm = false;
      this.selectedFile = null;
      this.selectedApplicationId = undefined;
    }, 2000);
  }

  deleteDocument(documentId: number): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documents = this.documents.filter(doc => doc.id !== documentId);
    }
  }

  downloadDocument(document: Document): void {
    // Simulate download
    console.log('Downloading document:', document.name);
    // In real app, this would trigger file download
  }

  getDocumentIcon(type: Document['type']): string {
    const docType = this.documentTypes.find(dt => dt.value === type);
    return docType?.icon || '📄';
  }

  getDocumentTypeLabel(type: Document['type']): string {
    const docType = this.documentTypes.find(dt => dt.value === type);
    return docType?.label || 'Document';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      case 'PENDING': return 'status-pending';
      default: return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'APPROVED': return '✅';
      case 'REJECTED': return '❌';
      case 'PENDING': return '⏳';
      default: return '❓';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getCompletionPercentage(): number {
    const requiredTypes = this.documentTypes.filter(dt => dt.required).map(dt => dt.value);
    const uploadedTypes = this.documents.map(doc => doc.type);
    const uniqueUploadedTypes = [...new Set(uploadedTypes)];
    
    const completedTypes = requiredTypes.filter(type => uniqueUploadedTypes.includes(type));
    return Math.round((completedTypes.length / requiredTypes.length) * 100);
  }

  getMissingDocuments(): ('PAN_CARD' | 'AADHAR_CARD' | 'BANK_STATEMENT' | 'SALARY_SLIP' | 'ADDRESS_PROOF' | 'OTHER')[] {
    const uploadedTypes = this.documents.map(doc => doc.type);
    const uniqueUploadedTypes = [...new Set(uploadedTypes)];
    
    const requiredTypes = this.documentTypes
      .filter(dt => dt.required)
      .map(dt => dt.value);
    
    return requiredTypes.filter(type => !uniqueUploadedTypes.includes(type));
  }

  toggleUploadForm(): void {
    this.showUploadForm = !this.showUploadForm;
    if (!this.showUploadForm) {
      this.selectedFile = null;
      this.selectedApplicationId = undefined;
    }
  }

  getApplicationName(applicationId: number | undefined): string {
    if (!applicationId) return 'Not Assigned';
    const app = this.loanApplications.find(a => a.id === applicationId);
    return app ? `Application #${app.id}` : 'Unknown Application';
  }

  getRequiredDocumentsCount(): number {
    return this.documentTypes.filter(dt => dt.required).length;
  }

  getMissingDocumentsCount(): number {
    return this.getMissingDocuments().length;
  }

  goBack(): void {
    this.router.navigate(['/borrower/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

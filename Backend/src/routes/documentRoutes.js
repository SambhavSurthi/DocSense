import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  viewDocument,
  checkDownloadStatus,
  requestDownload,
  getDownloadRequests,
  handleDownloadRequest,
  downloadDocument,
  deleteDocument
} from '../controllers/documentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { superuserOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Document CRUD routes
router.post('/upload', uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.get('/:id/view', viewDocument);
router.get('/:id/download-status', checkDownloadStatus);
router.delete('/:id', deleteDocument);

// Download request routes
router.post('/:id/request-download', requestDownload);
router.get('/download', downloadDocument);

// Admin routes for download requests
router.get('/admin/download-requests', superuserOnly, getDownloadRequests);
router.patch('/admin/download-requests/:id', superuserOnly, handleDownloadRequest);

export default router;

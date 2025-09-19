import Document from '../models/Document.js';
import DownloadRequest from '../models/DownloadRequest.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
// import pdf from 'pdf-parse'; // Commented out due to test file issue
import mammoth from 'mammoth';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}-${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG files are allowed.'), false);
    }
  }
});

// Extract text content from different file types
const extractTextContent = async (filePath, mimeType) => {
  try {
    switch (mimeType) {
      case 'application/pdf':
        // For now, return empty string for PDFs due to pdf-parse test file issue
        // In production, you can use a different PDF parsing library or service
        console.log('PDF text extraction temporarily disabled');
        return '';
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxBuffer = fs.readFileSync(filePath);
        const docxResult = await mammoth.extractRawText({ buffer: docxBuffer });
        return docxResult.value;
      
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        const xlsxBuffer = fs.readFileSync(filePath);
        const workbook = xlsx.read(xlsxBuffer, { type: 'buffer' });
        let xlsxText = '';
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          xlsxText += xlsx.utils.sheet_to_txt(worksheet) + ' ';
        });
        return xlsxText;
      
      case 'text/plain':
        return fs.readFileSync(filePath, 'utf8');
      
      default:
        return '';
    }
  } catch (error) {
    console.error('Error extracting text content:', error);
    return '';
  }
};

// Upload document
export const uploadDocument = async (req, res) => {
  try {
    const uploadMiddleware = upload.single('document');
    
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { title, tags, isPublic } = req.body;
      const userId = req.user.id;

      // Extract text content for search indexing
      const content = await extractTextContent(req.file.path, req.file.mimetype);

      // Create document record
      const document = new Document({
        title: title || req.file.originalname,
        originalName: req.file.originalname,
        filename: req.file.filename,
        filePath: req.file.path,
        fileType: path.extname(req.file.originalname).slice(1).toLowerCase(),
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        content: content,
        uploadedBy: userId,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        isPublic: isPublic === 'true',
        status: 'processed'
      });

      await document.save();

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          document: {
            id: document._id,
            title: document.title,
            fileType: document.fileType,
            fileSize: document.formattedSize,
            uploadedAt: document.createdAt,
            status: document.status
          }
        }
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document',
      error: error.message
    });
  }
};

// Get all documents with advanced search
export const getDocuments = async (req, res) => {
  try {
    const { search, type, status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filter by file type
    if (type && type !== 'all') {
      query.fileType = type.toLowerCase();
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Access control - users can only see their own documents or public documents
    if (userRole !== 'superuser') {
      query.$or = [
        { uploadedBy: userId },
        { isPublic: true }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const documents = await Document.find(query)
      .populate('uploadedBy', 'username email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Document.countDocuments(query);

    // Get statistics
    const stats = await Document.aggregate([
      { $match: userRole === 'superuser' ? {} : { $or: [{ uploadedBy: userId }, { isPublic: true }] } },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          fileTypes: { $addToSet: '$fileType' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        documents: documents.map(doc => ({
          id: doc._id,
          title: doc.title,
          fileType: doc.fileType,
          fileSize: doc.formattedSize,
          uploadedAt: doc.createdAt,
          status: doc.status,
          uploadedBy: doc.uploadedBy,
          isPublic: doc.isPublic,
          downloadCount: doc.downloadCount,
          lastAccessed: doc.lastAccessed
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalDocuments: total,
          hasNext: skip + documents.length < total,
          hasPrev: parseInt(page) > 1
        },
        stats: stats[0] || {
          totalDocuments: 0,
          totalSize: 0,
          fileTypes: []
        }
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message
    });
  }
};

// Get document by ID
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const document = await Document.findById(id).populate('uploadedBy', 'username email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access permissions
    if (!document.canView(userId, userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update last accessed
    document.lastAccessed = new Date();
    await document.save();

    res.json({
      success: true,
      data: {
        document: {
          id: document._id,
          title: document.title,
          fileType: document.fileType,
          fileSize: document.formattedSize,
          uploadedAt: document.createdAt,
          status: document.status,
          uploadedBy: document.uploadedBy,
          isPublic: document.isPublic,
          downloadCount: document.downloadCount,
          lastAccessed: document.lastAccessed,
          security: document.security,
          tags: document.tags,
          metadata: document.metadata
        }
      }
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document',
      error: error.message
    });
  }
};

// Check download request status
export const checkDownloadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const downloadRequest = await DownloadRequest.findOne({
      document: id,
      requestedBy: userId
    }).sort({ createdAt: -1 });

    if (!downloadRequest) {
      return res.json({
        success: true,
        data: {
          status: 'none',
          downloadToken: null
        }
      });
    }

    res.json({
      success: true,
      data: {
        status: downloadRequest.status,
        downloadToken: downloadRequest.downloadToken,
        downloadCount: downloadRequest.downloadCount,
        maxDownloads: downloadRequest.maxDownloads,
        rejectionReason: downloadRequest.rejectionReason
      }
    });
  } catch (error) {
    console.error('Check download status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking download status',
      error: error.message
    });
  }
};

// Request download
export const requestDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    console.log('Download request - Document ID:', id);
    console.log('Download request - User ID:', userId);
    console.log('Download request - Reason:', reason);

    // Validate input
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Download reason is required'
      });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user already has a pending or approved request
    const existingRequest = await DownloadRequest.findOne({
      document: id,
      requestedBy: userId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or approved download request for this document'
      });
    }

    // Create download request
    const downloadRequest = new DownloadRequest({
      document: id,
      requestedBy: userId,
      requestReason: reason.trim(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown'
    });

    await downloadRequest.save();

    console.log('Download request created successfully:', downloadRequest._id);

    res.status(201).json({
      success: true,
      message: 'Download request submitted successfully',
      data: {
        requestId: downloadRequest._id,
        status: downloadRequest.status
      }
    });
  } catch (error) {
    console.error('Request download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting download',
      error: error.message
    });
  }
};

// Get download requests (for admins)
export const getDownloadRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const requests = await DownloadRequest.find(query)
      .populate('document', 'title fileType uploadedBy')
      .populate('requestedBy', 'username email')
      .populate('approvedBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DownloadRequest.countDocuments(query);

    res.json({
      success: true,
      data: {
        requests: requests.map(req => ({
          id: req._id,
          document: req.document,
          requestedBy: req.requestedBy,
          status: req.status,
          requestReason: req.requestReason,
          createdAt: req.createdAt,
          approvedBy: req.approvedBy,
          approvedAt: req.approvedAt,
          downloadCount: req.downloadCount,
          maxDownloads: req.maxDownloads
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalRequests: total
        }
      }
    });
  } catch (error) {
    console.error('Get download requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching download requests',
      error: error.message
    });
  }
};

// Approve/Reject download request
export const handleDownloadRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason, maxDownloads = 1 } = req.body;
    const adminId = req.user.id;

    const downloadRequest = await DownloadRequest.findById(id)
      .populate('document')
      .populate('requestedBy');

    if (!downloadRequest) {
      return res.status(404).json({
        success: false,
        message: 'Download request not found'
      });
    }

    if (downloadRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been processed'
      });
    }

    if (action === 'approve') {
      downloadRequest.status = 'approved';
      downloadRequest.approvedBy = adminId;
      downloadRequest.approvedAt = new Date();
      downloadRequest.maxDownloads = maxDownloads;
      downloadRequest.generateDownloadToken();
    } else if (action === 'reject') {
      downloadRequest.status = 'rejected';
      downloadRequest.rejectedAt = new Date();
      downloadRequest.rejectionReason = reason || 'No reason provided';
    }

    await downloadRequest.save();

    res.json({
      success: true,
      message: `Download request ${action}d successfully`,
      data: {
        requestId: downloadRequest._id,
        status: downloadRequest.status,
        downloadToken: action === 'approve' ? downloadRequest.downloadToken : null
      }
    });
  } catch (error) {
    console.error('Handle download request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing download request',
      error: error.message
    });
  }
};

// View document (secure PDF viewer)
export const viewDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check access permissions
    if (!document.canView(userId, userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Update last accessed
    document.lastAccessed = new Date();
    await document.save();

    // Set appropriate headers for PDF viewing
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
    res.setHeader('Content-Length', document.fileSize);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Stream file
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('View document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error viewing document',
      error: error.message
    });
  }
};

// Download document (with token)
export const downloadDocument = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Download token required'
      });
    }

    const downloadRequest = await DownloadRequest.findOne({ downloadToken: token })
      .populate('document');

    if (!downloadRequest) {
      return res.status(404).json({
        success: false,
        message: 'Invalid download token'
      });
    }

    if (!downloadRequest.isValid()) {
      return res.status(403).json({
        success: false,
        message: 'Download token has expired or exceeded download limit'
      });
    }

    const document = downloadRequest.document;

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Increment download count
    downloadRequest.downloadCount += 1;
    document.downloadCount += 1;
    
    if (downloadRequest.downloadCount >= downloadRequest.maxDownloads) {
      downloadRequest.status = 'expired';
    }

    await Promise.all([downloadRequest.save(), document.save()]);

    // Set download headers
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Length', document.fileSize);

    // Stream file
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading document',
      error: error.message
    });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check permissions
    if (userRole !== 'superuser' && document.uploadedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete document record
    await Document.findByIdAndDelete(id);

    // Delete related download requests
    await DownloadRequest.deleteMany({ document: id });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: error.message
    });
  }
};

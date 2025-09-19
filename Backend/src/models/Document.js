import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png']
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  content: {
    type: String, // For search indexing
    default: ''
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'processed', 'failed', 'archived'],
    default: 'processing'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    author: String,
    subject: String,
    keywords: [String],
    createdDate: Date,
    modifiedDate: Date
  },
  security: {
    allowCopy: {
      type: Boolean,
      default: false
    },
    allowPrint: {
      type: Boolean,
      default: false
    },
    allowDownload: {
      type: Boolean,
      default: false
    },
    watermark: {
      type: String,
      default: ''
    },
    expiresAt: Date
  }
}, {
  timestamps: true
});

// Index for search functionality
documentSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
  'metadata.keywords': 'text'
});

// Virtual for formatted file size
documentSchema.virtual('formattedSize').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Method to check if user can download
documentSchema.methods.canDownload = function(userId, userRole) {
  if (this.security.allowDownload) return true;
  if (userRole === 'superuser') return true;
  if (this.uploadedBy.toString() === userId.toString()) return true;
  return false;
};

// Method to check if user can view
documentSchema.methods.canView = function(userId, userRole) {
  if (this.isPublic) return true;
  if (userRole === 'superuser') return true;
  if (this.uploadedBy.toString() === userId.toString()) return true;
  return false;
};

export default mongoose.model('Document', documentSchema);

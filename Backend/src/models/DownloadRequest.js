import mongoose from 'mongoose';
import crypto from 'crypto';

const downloadRequestSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  downloadToken: {
    type: String,
    unique: true,
    sparse: true
  },
  downloadExpiresAt: {
    type: Date,
    default: null
  },
  downloadedAt: {
    type: Date,
    default: null
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  maxDownloads: {
    type: Number,
    default: 1
  },
  requestReason: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
downloadRequestSchema.index({ document: 1, requestedBy: 1 });
downloadRequestSchema.index({ status: 1, createdAt: -1 });
downloadRequestSchema.index({ downloadToken: 1 });

// Method to check if request is still valid
downloadRequestSchema.methods.isValid = function() {
  if (this.status !== 'approved') return false;
  if (this.downloadExpiresAt && new Date() > this.downloadExpiresAt) return false;
  if (this.downloadCount >= this.maxDownloads) return false;
  return true;
};

// Method to generate download token
downloadRequestSchema.methods.generateDownloadToken = function() {
  this.downloadToken = crypto.randomBytes(32).toString('hex');
  this.downloadExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return this.downloadToken;
};

// Pre-save middleware to set expiration for pending requests
downloadRequestSchema.pre('save', function(next) {
  if (this.isNew && this.status === 'pending') {
    // Auto-expire pending requests after 7 days
    this.downloadExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

export default mongoose.model('DownloadRequest', downloadRequestSchema);

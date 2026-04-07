const AuditLog = require('../models/AuditLog');

const logAdminAction = async ({ adminId, action, resourceType, resourceId = null, metadata = {} }) => {
  try {
    if (!adminId) return;
    await AuditLog.create({
      adminId,
      action,
      resourceType,
      resourceId,
      metadata,
    });
  } catch (error) {
    // Audit failures should not break the main request flow
    console.error('Audit log failed:', error.message);
  }
};

module.exports = { logAdminAction };


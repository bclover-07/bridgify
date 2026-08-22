/**
 * Middleware to ensure the user is accessing data belonging to their institution.
 */
export const institutionGuard = async (req, res, next) => {
  try {
    if (!req.user || !req.user.institutionId) {
      return res.status(403).json({ success: false, message: 'Institution ID required for this action.' });
    }
    
    const targetInstitutionId = req.params.institutionId || req.body.institutionId || req.query.institutionId;

    if (targetInstitutionId && req.user.institutionId.toString() !== targetInstitutionId.toString()) {
      // Allow superadmins or system level roles if applicable, otherwise block
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied: Institution mismatch.' });
      }
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Institution guard error', error: error.message });
  }
};

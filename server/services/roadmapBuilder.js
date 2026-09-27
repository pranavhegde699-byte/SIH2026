/**
 * Builds a topological roadmap from a list of matched approvals.
 * Grouped into stages.
 * 
 * @param {Array} matchedApprovals - Array of approval objects
 * @returns {Array} - Array of stages, where each stage is an array of approvals
 */
const buildRoadmap = (matchedApprovals) => {
  if (!matchedApprovals || matchedApprovals.length === 0) return [];

  // Map for O(1) lookup
  const approvalMap = new Map();
  matchedApprovals.forEach(app => {
    approvalMap.set(app._id.toString(), {
      ...app.toObject(),
      dependsOn: app.dependsOn ? app.dependsOn.map(d => d._id ? d._id.toString() : d.toString()) : []
    });
  });

  const stages = [];
  const processed = new Set();
  
  let hasRemaining = true;
  
  while (hasRemaining) {
    const currentStage = [];
    hasRemaining = false;
    let madeProgress = false;

    for (const [id, approval] of approvalMap.entries()) {
      if (!processed.has(id)) {
        hasRemaining = true;
        
        // Filter out dependencies that are NOT in our matched list
        const applicableDeps = approval.dependsOn.filter(depId => approvalMap.has(depId));
        
        // Check if all applicable dependencies are processed
        const allDepsMet = applicableDeps.every(depId => processed.has(depId));
        
        if (allDepsMet) {
          currentStage.push(approval);
          madeProgress = true;
        }
      }
    }

    if (hasRemaining && !madeProgress) {
      // Circular dependency detected or impossible state
      console.warn("Circular dependency detected in approvals. Breaking cycle.");
      // Force add one remaining item to break cycle
      for (const [id, approval] of approvalMap.entries()) {
        if (!processed.has(id)) {
          currentStage.push(approval);
          break; // break cycle by ignoring its dependencies
        }
      }
    }

    if (currentStage.length > 0) {
      currentStage.forEach(app => processed.add(app._id.toString()));
      stages.push(currentStage);
    }
  }

  return stages;
};

module.exports = { buildRoadmap };

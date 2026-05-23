const AGENT_PUBLIC_FIELDS = 'name phone photoUrl vehicleType vehicleNumber';

function shapeOrder(doc) {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const agent = obj.deliveryAgentId;
  if (agent && typeof agent === 'object' && agent._id) {
    obj.deliveryAgent = {
      id: agent._id.toString(),
      name: agent.name,
      phone: agent.phone,
      photoUrl: agent.photoUrl || null,
      vehicleType: agent.vehicleType || 'Bike',
      vehicleNumber: agent.vehicleNumber || '',
    };
    obj.deliveryAgentId = agent._id.toString();
  } else if (agent) {
    obj.deliveryAgentId = String(agent);
    obj.deliveryAgent = null;
  } else {
    obj.deliveryAgent = null;
  }
  return obj;
}

module.exports = { shapeOrder, AGENT_PUBLIC_FIELDS };

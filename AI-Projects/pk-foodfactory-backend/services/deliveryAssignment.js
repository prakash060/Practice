const DeliveryAgent = require('../models/DeliveryAgent');
const Order = require('../models/Order');

/**
 * Picks the active delivery agent with the fewest in-flight orders (assigned or
 * out_for_delivery). Falls back to any active agent. Returns null when none exist.
 *
 * @returns {Promise<{agent: object} | null>}
 */
async function pickAvailableAgent() {
  const activeAgents = await DeliveryAgent.find({ status: 'active' }).select('_id').lean();
  if (!activeAgents.length) return null;

  const ids = activeAgents.map((a) => a._id);
  const loadByAgent = await Order.aggregate([
    {
      $match: {
        deliveryAgentId: { $in: ids },
        deliveryStatus: { $in: ['assigned', 'out_for_delivery'] },
      },
    },
    { $group: { _id: '$deliveryAgentId', count: { $sum: 1 } } },
  ]);

  const loadMap = new Map(loadByAgent.map((r) => [String(r._id), r.count]));
  let bestAgentId = null;
  let bestCount = Infinity;
  for (const a of activeAgents) {
    const c = loadMap.get(String(a._id)) || 0;
    if (c < bestCount) {
      bestCount = c;
      bestAgentId = a._id;
    }
  }
  if (!bestAgentId) return null;
  const agent = await DeliveryAgent.findById(bestAgentId);
  return agent ? { agent } : null;
}

/**
 * Assigns an active agent to the order in-place. Mutates and saves the order
 * document. Quietly leaves the order unassigned when no agents are available.
 *
 * @param {import('mongoose').Document} order
 */
async function assignAgentToOrder(order) {
  if (!order) return null;
  if (order.deliveryAgentId) return order.deliveryAgentId;
  const picked = await pickAvailableAgent();
  if (!picked) {
    order.deliveryStatus = 'unassigned';
    await order.save();
    return null;
  }
  order.deliveryAgentId = picked.agent._id;
  order.deliveryStatus = 'assigned';
  order.deliveryStatusUpdatedAt = new Date();
  await order.save();
  return picked.agent;
}

module.exports = { pickAvailableAgent, assignAgentToOrder };

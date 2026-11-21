// @ts-nocheck
// Ported from the original backend function; runs inside the app server.
import { createClientFromRequest } from '../base44.server';

const ALLOWED_ENTITIES = [
  'Doctor', 'Hospital', 'Lab', 'Retailer', 'RetailerProduct', 'User',
  'CommunityPost', 'Booking', 'HospitalBooking', 'Order', 'AppSettings',
];

export default (async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { entityName, action, id, data } = await req.json();

    if (!ALLOWED_ENTITIES.includes(entityName)) {
      return Response.json({ error: 'Invalid entity' }, { status: 400 });
    }

    let result;
    if (action === 'update') {
      if (!id) return Response.json({ error: 'id is required' }, { status: 400 });
      result = await base44.asServiceRole.entities[entityName].update(id, data);
    } else if (action === 'create') {
      result = await base44.asServiceRole.entities[entityName].create(data);
    } else if (action === 'delete') {
      if (!id) return Response.json({ error: 'id is required' }, { status: 400 });
      result = await base44.asServiceRole.entities[entityName].delete(id);
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
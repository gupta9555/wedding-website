// Central list of provider/service categories so every model and controller
// references the same source of truth instead of duplicating string literals.

const PROVIDER_CATEGORIES = [
  'Mehndi Artist',
  'Wedding Photographer',
  'Decorator',
  'Caterer',
  'DJ',
  'Makeup Artist',
  'Wedding Planner',
  'Birthday Event Organizer',
  'Other',
];

const EVENT_TYPES = [
  'Wedding',
  'Mehndi',
  'Engagement',
  'Birthday',
  'Anniversary',
  'Reception',
  'Baby Shower',
  'Corporate Event',
  'Party',
  'Other',
];

module.exports = { PROVIDER_CATEGORIES, EVENT_TYPES };

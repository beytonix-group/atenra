/**
 * Generate a vibrant, visible color for a category based on its ID
 * Uses inline styles with actual hex colors to ensure they always render
 */

const VIBRANT_COLORS = [
  // Blue shades
  { bg: '#3B82F6', hover: '#2563EB', text: '#FFFFFF', name: 'blue' },
  { bg: '#06B6D4', hover: '#0891B2', text: '#FFFFFF', name: 'cyan' },

  // Purple shades
  { bg: '#A855F7', hover: '#9333EA', text: '#FFFFFF', name: 'purple' },
  { bg: '#8B5CF6', hover: '#7C3AED', text: '#FFFFFF', name: 'violet' },

  // Pink shades
  { bg: '#EC4899', hover: '#DB2777', text: '#FFFFFF', name: 'pink' },
  { bg: '#F43F5E', hover: '#E11D48', text: '#FFFFFF', name: 'rose' },

  // Red/Orange shades
  { bg: '#EF4444', hover: '#DC2626', text: '#FFFFFF', name: 'red' },
  { bg: '#F97316', hover: '#EA580C', text: '#FFFFFF', name: 'orange' },

  // Yellow/Amber shades
  { bg: '#F59E0B', hover: '#D97706', text: '#FFFFFF', name: 'amber' },
  { bg: '#EAB308', hover: '#CA8A04', text: '#000000', name: 'yellow' },

  // Green shades
  { bg: '#10B981', hover: '#059669', text: '#FFFFFF', name: 'emerald' },
  { bg: '#22C55E', hover: '#16A34A', text: '#FFFFFF', name: 'green' },
  { bg: '#84CC16', hover: '#65A30D', text: '#000000', name: 'lime' },

  // Teal shades
  { bg: '#14B8A6', hover: '#0D9488', text: '#FFFFFF', name: 'teal' },

  // Indigo shades
  { bg: '#6366F1', hover: '#4F46E5', text: '#FFFFFF', name: 'indigo' },
  { bg: '#0EA5E9', hover: '#0284C7', text: '#FFFFFF', name: 'sky' },
];

/**
 * Get a consistent vibrant color for a given category ID
 * The same ID will always return the same color
 */
export function getCategoryColor(categoryId: number) {
  const index = categoryId % VIBRANT_COLORS.length;
  return VIBRANT_COLORS[index];
}

/**
 * Get inline styles for the category badge
 */
export function getCategoryStyles(categoryId: number, isHovered = false) {
  const color = getCategoryColor(categoryId);
  return {
    backgroundColor: isHovered ? color.hover : color.bg,
    color: color.text,
    borderColor: color.hover,
  };
}
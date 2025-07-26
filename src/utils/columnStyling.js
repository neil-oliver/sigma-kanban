/**
 * Utility functions for styling and formatting columns based on their Sigma types
 * Handles all column types: text, number, boolean, datetime, variant, link, error
 * Includes image detection for link types
 */

/**
 * Check if a URL points to an image based on file extension and common image hosting domains
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL appears to be an image
 */
export const isImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    console.log('isImageUrl: Invalid URL input:', url);
    return false;
  }
  
  // Remove query parameters and fragments for extension checking
  const cleanUrl = url.split('?')[0].split('#')[0];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico'];
  
  // Check for file extensions
  const hasImageExtension = imageExtensions.some(ext => 
    cleanUrl.toLowerCase().endsWith(ext)
  );
  
  // Check for common image hosting domains
  const imageHostingDomains = [
    'avatars.slack-edge.com',
    'avatars.githubusercontent.com',
    'lh3.googleusercontent.com',
    'graph.facebook.com',
    'platform-lookaside.fbsbx.com',
    'pbs.twimg.com',
    'images.unsplash.com',
    'cdn.discordapp.com',
    'media.discordapp.net',
    'i.imgur.com',
    'images.pexels.com',
    'pixabay.com',
    'flickr.com',
    '500px.com'
  ];
  
  let isImageHosting = false;
  try {
    const urlObj = new URL(url);
    isImageHosting = imageHostingDomains.some(domain => 
      urlObj.hostname.includes(domain)
    );
  } catch (e) {
    // URL parsing failed, continue with extension check only
  }
  
  const isImage = hasImageExtension || isImageHosting;
  
  console.log('isImageUrl debug:', {
    originalUrl: url,
    cleanUrl: cleanUrl,
    hasImageExtension: hasImageExtension,
    isImageHosting: isImageHosting,
    isImage: isImage,
    matchingExtension: imageExtensions.find(ext => cleanUrl.toLowerCase().endsWith(ext)),
    matchingDomain: imageHostingDomains.find(domain => url.includes(domain))
  });
  
  return isImage;
};

/**
 * Check if a URL is valid
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if the URL is valid
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    // Try adding https:// if it looks like a domain
    if (url.includes('.') && !url.includes(' ') && !url.startsWith('http')) {
      try {
        new URL(`https://${url}`);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
};

/**
 * Normalize URL by adding protocol if missing
 * @param {string} url - The URL to normalize
 * @returns {string} - Normalized URL with protocol
 */
export const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Add https:// if it looks like a domain
  if (url.includes('.') && !url.includes(' ')) {
    return `https://${url}`;
  }
  
  return url;
};

/**
 * Format datetime value using the column's format or a default format
 * @param {string|Date|number} value - The datetime value (can be timestamp)
 * @param {Object} formatInfo - The format object from column metadata
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (value, formatInfo) => {
  if (!value) return '';
  
  // Handle different input types
  let date;
  if (typeof value === 'number') {
    // Handle Unix timestamp (seconds or milliseconds)
    date = new Date(value < 1e10 ? value * 1000 : value);
  } else if (typeof value === 'string') {
    // Handle string dates or timestamps
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      // String contains a number (timestamp)
      date = new Date(numValue < 1e10 ? numValue * 1000 : numValue);
    } else {
      // Regular date string
      date = new Date(value);
    }
  } else {
    date = new Date(value);
  }
  
  if (isNaN(date.getTime())) return value; // Return original if invalid date
  
  // Use Sigma format if available
  if (formatInfo?.format) {
    try {
      // Convert common Sigma strftime patterns to JavaScript options
      const formatStr = formatInfo.format.toLowerCase();
      
      if (formatStr.includes('%b') && formatStr.includes('%d') && formatStr.includes('%y')) {
        // Pattern like "%B %d %Y" -> "January 15 2024"
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      if (formatStr.includes('%m/%d/%y')) {
        // Pattern like "%m/%d/%Y" -> "01/15/2024"
        return date.toLocaleDateString('en-US');
      }
      
      if (formatStr.includes('%y-%m-%d')) {
        // Pattern like "%Y-%m-%d" -> "2024-01-15"
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn('Error parsing Sigma date format:', e);
    }
  }
  
  // Default formatting - check if it includes time
  const hasTime = typeof value === 'string' && (value.includes('T') || value.includes(' '));
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: hasTime ? 'numeric' : undefined,
    minute: hasTime ? '2-digit' : undefined
  });
};

/**
 * Format number value with appropriate locale formatting
 * @param {number|string} value - The number value
 * @param {Object} formatInfo - The format object from column metadata
 * @returns {string} - Formatted number string
 */
export const formatNumber = (value, formatInfo) => {
  const num = Number(value);
  if (isNaN(num)) return value;
  
  // Handle percentage if the column name suggests it
  if (formatInfo?.isPercentage || (typeof formatInfo === 'string' && formatInfo.includes('%'))) {
    return `${num}%`;
  }
  
  // Default number formatting with locale
  return num.toLocaleString('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 2
  });
};

/**
 * Get styling configuration for a column type
 * @param {string} columnType - The Sigma column type
 * @param {Object} formatInfo - Optional format information from column metadata
 * @returns {Object} - Styling configuration object
 */
export const getColumnTypeStyles = (columnType, formatInfo = null) => {
  const baseStyles = {
    text: {
      className: 'text-foreground',
      iconName: 'Type',
      format: (value) => value || ''
    },
    number: {
      className: 'font-mono text-right text-foreground',
      iconName: 'Hash',
      format: (value) => formatNumber(value, formatInfo)
    },
    integer: {
      className: 'font-mono text-right text-foreground',
      iconName: 'Hash',
      format: (value) => Math.round(Number(value)) || value
    },
    datetime: {
      className: 'text-foreground',
      iconName: 'Calendar',
      format: (value) => formatDateTime(value, formatInfo)
    },
    boolean: {
      className: 'text-foreground',
      iconName: 'Check',
      format: (value) => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          return ['true', '1', 'yes', 'y'].includes(lower);
        }
        return !!value;
      }
    },
    link: {
      className: 'text-primary underline hover:text-primary/80',
      iconName: 'Link',
      format: (value) => value || ''
    },
    variant: {
      className: 'text-foreground',
      iconName: 'Shuffle',
      format: (value) => value || ''
    },
    error: {
      className: 'text-destructive font-medium',
      iconName: 'AlertCircle',
      format: (value) => 'Error'
    }
  };

  return baseStyles[columnType] || baseStyles.text;
};

/**
 * Render a field value with appropriate styling and formatting
 * @param {any} value - The field value
 * @param {string} columnKey - The column key/ID
 * @param {Object} elementColumns - The elementColumns object from Sigma
 * @param {Object} options - Rendering options
 * @returns {Object} - React component props and styling
 */
export const renderStyledField = (value, columnKey, elementColumns, options = {}) => {
  const { 
    showIcon = true, 
    showTypeInfo = false, 
    maxImageWidth = '100px',
    maxImageHeight = '60px',
    enableImageModal = true 
  } = options;

  if (!elementColumns || !elementColumns[columnKey]) {
    console.log('renderStyledField: No column info found for key:', columnKey);
    return {
      component: 'span',
      props: { children: value },
      className: 'text-muted-foreground'
    };
  }

  const column = elementColumns[columnKey];
  
  console.log('renderStyledField debug:', {
    value: value,
    columnKey: columnKey,
    columnType: column.columnType,
    columnName: column.name,
    isImageUrl: isImageUrl(value),
    isValidUrl: isValidUrl(value)
  });
  
  // Only show icons for special types, not text and numbers
  const shouldShowIcon = showIcon && ['boolean', 'datetime', 'link', 'variant', 'error'].includes(column.columnType);
  const typeStyles = getColumnTypeStyles(column.columnType, column.format);
  
  // Handle different column types
  switch (column.columnType) {
    case 'link':
      console.log('renderStyledField: Processing link type with value:', value);
      if (isImageUrl(value)) {
        console.log('renderStyledField: Detected as image URL, rendering image component');
        return {
          component: 'div',
          props: {
            className: 'flex items-center gap-2',
            children: [
              shouldShowIcon && {
                type: 'LucideIcon',
                name: 'Image',
                props: { className: 'h-4 w-4 text-muted-foreground' }
              },
              {
                type: 'Avatar',
                props: {
                  className: 'h-8 w-8',
                  children: {
                    type: 'AvatarImage',
                    props: {
                      src: normalizeUrl(value),
                      alt: 'Field image',
                      style: { 
                        maxWidth: maxImageWidth, 
                        maxHeight: maxImageHeight,
                        cursor: enableImageModal ? 'pointer' : 'default'
                      }
                    }
                  },
                  fallback: {
                    type: 'AvatarFallback',
                    props: {
                      children: {
                        type: 'LucideIcon',
                        name: 'Image',
                        props: { className: 'h-4 w-4' }
                      }
                    }
                  }
                }
              }
            ].filter(Boolean)
          }
        };
      } else if (isValidUrl(value)) {
        return {
          component: 'div',
          props: {
            className: 'flex items-center gap-2',
            children: [
              shouldShowIcon && {
                type: 'LucideIcon',
                name: typeStyles.iconName,
                props: { className: 'h-4 w-4 text-muted-foreground' }
              },
              {
                type: 'a',
                props: {
                  href: value.startsWith('http') ? value : `https://${value}`,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: typeStyles.className,
                  children: value
                }
              }
            ].filter(Boolean)
          }
        };
      }
      // Fall through to default text handling if not a valid URL
      break;

    case 'boolean':
      const boolValue = typeStyles.format(value);
      return {
        component: 'div',
        props: {
          className: 'flex items-center gap-2',
          children: [
            {
              type: 'Checkbox',
              props: {
                checked: boolValue,
                disabled: true,
                className: 'pointer-events-none'
              }
            }
          ]
        }
      };

    default:
      // Check if this is a text field that contains an image URL
      if (column.columnType === 'text' && isImageUrl(value)) {
        console.log('renderStyledField: Text field contains image URL, rendering as image');
        return {
          component: 'div',
          props: {
            className: 'flex items-center gap-2',
            children: [
              shouldShowIcon && {
                type: 'LucideIcon',
                name: 'Image',
                props: { className: 'h-4 w-4 text-muted-foreground' }
              },
              {
                type: 'Avatar',
                props: {
                  className: 'h-8 w-8',
                  children: {
                    type: 'AvatarImage',
                    props: {
                      src: normalizeUrl(value),
                      alt: 'Field image',
                      style: { 
                        maxWidth: maxImageWidth, 
                        maxHeight: maxImageHeight,
                        cursor: enableImageModal ? 'pointer' : 'default'
                      }
                    }
                  },
                  fallback: {
                    type: 'AvatarFallback',
                    props: {
                      children: {
                        type: 'LucideIcon',
                        name: 'Image',
                        props: { className: 'h-4 w-4' }
                      }
                    }
                  }
                }
              }
            ].filter(Boolean)
          }
        };
      }
      
      return {
        component: 'div',
        props: {
          className: 'flex items-center gap-2',
          children: [
            shouldShowIcon && {
              type: 'LucideIcon',
              name: typeStyles.iconName,
              props: { className: 'h-4 w-4 text-muted-foreground' }
            },
            {
              type: 'span',
              props: {
                className: typeStyles.className,
                children: typeStyles.format(value)
              }
            },
            showTypeInfo && {
              type: 'Badge',
              props: {
                variant: 'secondary',
                className: 'text-xs',
                children: column.columnType
              }
            }
          ].filter(Boolean)
        }
      };
  }
};

/**
 * Get card background styling - simple neutral styling
 * @param {Object} card - The card object
 * @param {Object} elementColumns - The elementColumns object from Sigma
 * @returns {string} - CSS classes for card background
 */
export const getCardStyling = (card, elementColumns) => {
  return 'bg-card border border-border';
}; 
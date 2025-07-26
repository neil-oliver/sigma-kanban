import React from 'react';
import { renderStyledField } from '../utils/columnStyling';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import * as LucideIcons from 'lucide-react';

/**
 * StyledField Component
 * Renders a field value with appropriate styling based on its Sigma column type
 * Handles text, number, boolean, datetime, link (including images), variant, and error types
 */
const StyledField = ({ 
  value, 
  columnKey, 
  elementColumns, 
  showIcon = true,
  showTypeInfo = false,
  maxImageWidth = '100px',
  maxImageHeight = '60px',
  enableImageModal = true,
  className = '',
  ...props 
}) => {
  const styledField = renderStyledField(value, columnKey, elementColumns, {
    showIcon,
    showTypeInfo,
    maxImageWidth,
    maxImageHeight,
    enableImageModal
  });

  if (!styledField) {
    return <span className={`text-muted-foreground ${className}`} {...props}>{value}</span>;
  }

  // Helper function to render complex children
  const renderChildren = (children) => {
    if (!children) return null;
    
    return children.map((child, index) => {
      if (!child) return null;
      
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { key: index });
      }
      
      if (typeof child === 'object' && child.type) {
        switch (child.type) {
          case 'LucideIcon':
            const IconComponent = LucideIcons[child.name];
            return IconComponent ? <IconComponent key={index} {...child.props} /> : null;
            
          case 'Checkbox':
            return <Checkbox key={index} {...child.props} />;
            
          case 'Avatar':
            return (
              <Avatar key={index} {...child.props}>
                {child.props.children && (
                  <AvatarImage {...child.props.children.props} />
                )}
                {child.props.fallback && (
                  <AvatarFallback>
                    {renderChildren([child.props.fallback.props.children])}
                  </AvatarFallback>
                )}
              </Avatar>
            );
            
          case 'Badge':
            return <Badge key={index} {...child.props}>{child.props.children}</Badge>;
            
          case 'span':
            return <span key={index} {...child.props}>{child.props.children}</span>;
            
          case 'a':
            return <a key={index} {...child.props}>{child.props.children}</a>;
            
          default:
            return null;
        }
      }
      
      return child;
    }).filter(Boolean);
  };

  const Component = styledField.component || 'div';
  const combinedClassName = `${styledField.props?.className || ''} ${className}`.trim();

  return (
    <Component 
      {...props}
      className={combinedClassName}
    >
      {renderChildren(styledField.props.children)}
    </Component>
  );
};

export default StyledField; 
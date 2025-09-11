import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb = ({ items, className = "" }: BreadcrumbProps) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert path segments to readable labels
      let label = segment.replace(/[-_]/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);
      
      // Handle special cases
      if (segment === 'product') {
        const urlParams = new URLSearchParams(location.search);
        const category = urlParams.get('category');
        if (category) {
          label = category.charAt(0).toUpperCase() + category.slice(1);
        } else {
          label = 'Products';
        }
      }
      
      breadcrumbs.push({
        label,
        path: currentPath
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();
  
  if (breadcrumbItems.length === 0) return null;

  return (
    <nav 
      className={`flex items-center gap-2 text-sm animate-fade-in ${className}`}
      aria-label="Breadcrumb"
    >
      <Link 
        to="/" 
        className="flex items-center gap-1 text-neu-muted hover:text-primary transition-colors"
        aria-label="Home"
      >
        <Home size={14} />
        <span className="hidden sm:inline">Home</span>
      </Link>
      
      {breadcrumbItems.map((item, index) => (
        <div key={item.path} className="flex items-center gap-2">
          <ChevronRight size={14} className="text-neu-muted" />
          {index === breadcrumbItems.length - 1 ? (
            <span 
              className="text-neu-primary font-medium"
              aria-current="page"
            >
              {item.label}
            </span>
          ) : (
            <Link 
              to={item.path}
              className="text-neu-muted hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
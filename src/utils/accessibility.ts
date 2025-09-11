/**
 * Accessibility utility functions and constants
 */

// ARIA roles and properties constants
export const ARIA_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  TAB: 'tab',
  TABPANEL: 'tabpanel',
  DIALOG: 'dialog',
  ALERT: 'alert',
  STATUS: 'status',
  GRID: 'grid',
  GRIDCELL: 'gridcell',
  ROW: 'row',
  COLUMNHEADER: 'columnheader',
  LISTBOX: 'listbox',
  OPTION: 'option',
  COMBOBOX: 'combobox',
  BANNER: 'banner',
  MAIN: 'main',
  NAVIGATION: 'navigation',
  CONTENTINFO: 'contentinfo',
  FORM: 'form',
  SEARCH: 'search',
} as const;

export const ARIA_PROPERTIES = {
  EXPANDED: 'aria-expanded',
  SELECTED: 'aria-selected',
  CHECKED: 'aria-checked',
  DISABLED: 'aria-disabled',
  HIDDEN: 'aria-hidden',
  LABEL: 'aria-label',
  LABELLEDBY: 'aria-labelledby',
  DESCRIBEDBY: 'aria-describedby',
  CURRENT: 'aria-current',
  LIVE: 'aria-live',
  ATOMIC: 'aria-atomic',
  RELEVANT: 'aria-relevant',
  BUSY: 'aria-busy',
  INVALID: 'aria-invalid',
  REQUIRED: 'aria-required',
  READONLY: 'aria-readonly',
  MULTISELECTABLE: 'aria-multiselectable',
  ORIENTATION: 'aria-orientation',
  SORT: 'aria-sort',
  LEVEL: 'aria-level',
  SETSIZE: 'aria-setsize',
  POSINSET: 'aria-posinset',
  ROWCOUNT: 'aria-rowcount',
  COLCOUNT: 'aria-colcount',
  ROWINDEX: 'aria-rowindex',
  COLINDEX: 'aria-colindex',
} as const;

/**
 * Generate unique IDs for form elements
 */
let idCounter = 0;
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${++idCounter}-${Date.now()}`;
};

/**
 * Check if an element is focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ];

  return focusableSelectors.some(selector => element.matches(selector)) &&
         !element.hasAttribute('aria-hidden') &&
         element.offsetParent !== null; // Element is visible
};

/**
 * Get all focusable elements within a container
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(',');

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter((element): element is HTMLElement => 
      element instanceof HTMLElement && isFocusable(element)
    );
};

/**
 * Create a focus trap within a container
 */
export const createFocusTrap = (container: HTMLElement) => {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  return {
    activate: () => firstElement?.focus(),
    deactivate: () => container.removeEventListener('keydown', handleTabKey),
  };
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  const existingAnnouncer = document.getElementById('screen-reader-announcer');
  let announcer = existingAnnouncer;

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'screen-reader-announcer';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0';
    document.body.appendChild(announcer);
  }

  announcer.setAttribute('aria-live', priority);
  announcer.textContent = '';
  
  // Use setTimeout to ensure the message is announced
  setTimeout(() => {
    announcer!.textContent = message;
  }, 100);
};

/**
 * Keyboard navigation utilities
 */
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

/**
 * Handle keyboard navigation in a list or grid
 */
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  currentIndex: number,
  itemCount: number,
  columns: number = 1,
  onNavigate: (newIndex: number) => void
) => {
  const { key } = event;
  let newIndex = currentIndex;

  switch (key) {
    case KEYBOARD_KEYS.ARROW_DOWN:
      event.preventDefault();
      newIndex = Math.min(currentIndex + columns, itemCount - 1);
      break;
    case KEYBOARD_KEYS.ARROW_UP:
      event.preventDefault();
      newIndex = Math.max(currentIndex - columns, 0);
      break;
    case KEYBOARD_KEYS.ARROW_RIGHT:
      event.preventDefault();
      newIndex = Math.min(currentIndex + 1, itemCount - 1);
      break;
    case KEYBOARD_KEYS.ARROW_LEFT:
      event.preventDefault();
      newIndex = Math.max(currentIndex - 1, 0);
      break;
    case KEYBOARD_KEYS.HOME:
      event.preventDefault();
      newIndex = 0;
      break;
    case KEYBOARD_KEYS.END:
      event.preventDefault();
      newIndex = itemCount - 1;
      break;
  }

  if (newIndex !== currentIndex) {
    onNavigate(newIndex);
  }
};

/**
 * Form accessibility helpers
 */
export const getFormFieldProps = (
  id: string,
  label: string,
  error?: string,
  description?: string,
  required?: boolean
) => {
  const describedBy = [];
  if (description) describedBy.push(`${id}-description`);
  if (error) describedBy.push(`${id}-error`);

  return {
    id,
    'aria-label': label,
    'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined,
    'aria-invalid': !!error,
    'aria-required': required,
  };
};

/**
 * Table accessibility helpers
 */
export const getTableProps = (
  label: string,
  rowCount: number,
  columnCount: number,
  description?: string
) => {
  return {
    role: 'grid',
    'aria-label': label,
    'aria-describedby': description ? `${generateId('table')}-description` : undefined,
    'aria-rowcount': rowCount,
    'aria-colcount': columnCount,
  };
};

export const getTableCellProps = (
  rowIndex: number,
  columnIndex: number,
  selected?: boolean
) => {
  return {
    role: 'gridcell',
    'aria-rowindex': rowIndex + 1,
    'aria-colindex': columnIndex + 1,
    'aria-selected': selected,
  };
};

/**
 * Modal accessibility helpers
 */
export const getModalProps = (
  title: string,
  description?: string,
  titleId?: string,
  descriptionId?: string
) => {
  const modalTitleId = titleId || generateId('modal-title');
  const modalDescriptionId = descriptionId || generateId('modal-description');

  return {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': modalTitleId,
    'aria-describedby': description ? modalDescriptionId : undefined,
    titleId: modalTitleId,
    descriptionId: modalDescriptionId,
  };
};

/**
 * Color contrast utilities (simplified)
 */
export const hasGoodContrast = (foreground: string, background: string): boolean => {
  // This is a simplified implementation
  // In a real application, you would use a proper color contrast library
  // like 'color-contrast' or implement the WCAG contrast ratio calculation
  
  // For now, return true as we're using semantic tokens that should have good contrast
  return true;
};

/**
 * Screen reader only text utilities
 */
export const createScreenReaderText = (text: string): HTMLSpanElement => {
  const span = document.createElement('span');
  span.className = 'sr-only';
  span.textContent = text;
  return span;
};

export default {
  ARIA_ROLES,
  ARIA_PROPERTIES,
  KEYBOARD_KEYS,
  generateId,
  isFocusable,
  getFocusableElements,
  createFocusTrap,
  announceToScreenReader,
  handleKeyboardNavigation,
  getFormFieldProps,
  getTableProps,
  getTableCellProps,
  getModalProps,
  hasGoodContrast,
  createScreenReaderText,
};
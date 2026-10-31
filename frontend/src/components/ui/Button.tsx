import type { MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';
export type ButtonSize = 'md' | 'sm';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: '',
  sm: 'btn-sm',
};

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
  /** Optional trailing glyph rendered inside the pill. */
  icon?: ReactNode;
  /** Internal route — renders a react-router <Link>. */
  to?: string;
  /** External / anchor target — renders an <a>. */
  href?: string;
  /** Anchor id, used by in-page CTAs such as #inquiry. */
  anchor?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  target?: string;
  rel?: string;
  'aria-label'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-haspopup'?: boolean | 'dialog' | 'menu' | 'listbox';
}

/**
 * Pill button used across the site.
 * Renders <Link>, <a> or <button> depending on which target prop is supplied,
 * keeping a single visual API for every CTA.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
  to,
  href,
  anchor,
  type = 'button',
  disabled = false,
  onClick,
  target,
  rel,
  'aria-label': ariaLabel,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-haspopup': ariaHasPopup,
}: ButtonProps) {
  const classes = cn('btn', VARIANT_CLASSES[variant], SIZE_CLASSES[size], className);
  const content = (
    <>
      {children}
      {icon}
    </>
  );

  if (to !== undefined) {
    return (
      <Link
        to={to}
        className={classes}
        aria-label={ariaLabel}
        target={target}
        rel={rel}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
      >
        {content}
      </Link>
    );
  }

  if (href !== undefined) {
    return (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        target={target}
        rel={rel}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
      >
        {content}
      </a>
    );
  }

  if (anchor !== undefined) {
    return (
      <a
        href={anchor}
        className={classes}
        aria-label={ariaLabel}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-haspopup={ariaHasPopup}
    >
      {content}
    </button>
  );
}

export default Button;

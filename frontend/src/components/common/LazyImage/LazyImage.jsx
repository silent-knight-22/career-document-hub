/**
 * Lazy-loaded image with async decode — reusable for signature previews.
 */
export default function LazyImage({
  src,
  alt = '',
  className,
  width,
  height,
  ...rest
}) {
  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      {...rest}
    />
  );
}

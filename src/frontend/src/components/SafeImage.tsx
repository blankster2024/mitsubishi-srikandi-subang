import { type ImgHTMLAttributes, useState } from "react";

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  placeholderClassName?: string;
}

export default function SafeImage({
  placeholderClassName,
  className,
  style,
  alt,
  ...props
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={placeholderClassName ?? className}
        style={style}
        aria-hidden="true"
      />
    );
  }

  return (
    // biome-ignore lint/a11y/useAltText: alt is always provided by callers via props spread
    <img
      alt={alt}
      {...props}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}

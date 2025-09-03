// This file is auto-generated. Do not edit manually.
// Generated on: 2025-07-09T09:37:52.485Z

/**
 * Application version from package.json
 */
export const VERSION = '0.0.0';

/**
 * Build timestamp
 */
export const BUILD_TIMESTAMP = '2025-07-09T09:37:52.485Z';

/**
 * Returns the application version with build information
 */
export const getVersionString = (): string => {
  return `v${VERSION} (Built: ${new Date(BUILD_TIMESTAMP).toLocaleString()})`;
};

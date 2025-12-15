import { ServiceEntity } from '../../../app/structure/types';

// Convert a UI-friendly service (with "$" and "min") into normalized fields
export function withNormalizedFields(service: ServiceEntity): ServiceEntity {
  const priceNumber =
    typeof service.priceNumber === 'number'
      ? service.priceNumber
      : parseFloat(String(service.price || '').replace(/[^0-9.]/g, '')) || 0;

  const durationMinutes =
    typeof service.durationMinutes === 'number'
      ? service.durationMinutes
      : parseInt(String(service.duration || '').replace(/[^0-9]/g, ''), 10) || 0;

  return {
    ...service,
    priceNumber,
    durationMinutes,
  };
}

// Ensure UI labels exist for legacy screens
export function withDisplayFields(service: ServiceEntity): ServiceEntity {
  const price =
    service.price ?? (typeof service.priceNumber === 'number' ? `$${service.priceNumber}` : undefined);
  const duration =
    service.duration ?? (typeof service.durationMinutes === 'number' ? `${service.durationMinutes} min` : undefined);
  return { ...service, price, duration };
}



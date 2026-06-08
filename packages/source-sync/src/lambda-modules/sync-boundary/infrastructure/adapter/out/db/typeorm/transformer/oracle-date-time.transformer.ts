import { DateTime } from '@pormeldev/axis-common-lib';
import type { ValueTransformer } from 'typeorm';

/**
 * Transformer local para Oracle TIMESTAMP.
 *
 * // TODO(Axis/Oracle): reemplazar por un transformer de Axis compatible con Oracle cuando la
 * libreria soporte bindear DateTime como Date nativo por driver. El DateTimeTransformer actual
 * de Axis convierte DateTime a string "YYYY-MM-DD HH:mm:ss.SSS"; validado contra Oracle local,
 * ese bind falla con ORA-01843. El driver oracledb sí bindea Date nativo correctamente.
 */
export class OracleDateTimeTransformer implements ValueTransformer {
  to(value: DateTime | Date | null | undefined): Date | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (value instanceof Date) {
      return value;
    }

    return new Date(value.toISO());
  }

  from(value: Date | string | null | undefined): DateTime | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (value instanceof Date) {
      return DateTime.fromISO(value);
    }

    return DateTime.fromISO(value.replace(' ', 'T'));
  }
}

export const oracleDateTimeTransformer = new OracleDateTimeTransformer();
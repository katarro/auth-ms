import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  PORT_GATEWAY: string;
  NATS_SERVERS: string;
  HOST: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  RESEND_API: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    PORT_GATEWAY: joi.string().required(),
    NATS_SERVERS: joi.string().required(),
    HOST: joi.string().required(),
    DATABASE_URL: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    RESEND_API: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  const missingVars = error.details
    .map((detail) => detail.context?.key)
    .join(', ');
  throw new Error(
    `Config validation error: no se ecnuentra la variable ${missingVars}`,
  );
}
const envVars: EnvVars = value as EnvVars;

export const envs = {
  port: envVars.PORT,
  port_gateway: envVars.PORT_GATEWAY,
  nats_servers: envVars.NATS_SERVERS,
  host: envVars.HOST,
  database_url: envVars.DATABASE_URL,
  jwt_constants: envVars.JWT_SECRET,
  resend_api: envVars.RESEND_API,
};

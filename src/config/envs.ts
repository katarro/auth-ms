import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  HOST: string;
  NATS_SERVERS: string;
  JWT_SECRET: string;
  SENDGRID_EMAIL: string;
  SENDGRID_API: string;
  PORT_GATEWAY: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    SENDGRID_EMAIL: joi.string().required(),
    HOST: joi.string().required(),
    PORT_GATEWAY: joi.string().required(),
    SENDGRID_API: joi.string().required(),
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
  nats_servers: envVars.NATS_SERVERS,
  jwt_constants: envVars.JWT_SECRET,
  host: envVars.HOST,
  port_gateway: envVars.PORT_GATEWAY,
  sendgrid_api: envVars.SENDGRID_API,
  sendrig_email: envVars.SENDGRID_EMAIL,
};

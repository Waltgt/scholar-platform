function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Falta la variable de entorno ${name}`);
    }
    return value;
}
function parsePort(raw) {
    const port = Number(raw);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(`PORT inválido: ${raw}`);
    }
    return port;
}
function parseDatabaseSsl(raw) {
    if (raw !== "off" && raw !== "no-verify") {
        throw new Error(`DATABASE_SSL inválido: ${raw} (usar "off" o "no-verify")`);
    }
    return raw;
}
export const config = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    host: process.env.HOST ?? "127.0.0.1",
    port: parsePort(process.env.PORT ?? "3000"),
    databaseUrl: required("DATABASE_URL"),
    databaseSsl: parseDatabaseSsl(process.env.DATABASE_SSL ?? "off"),
    trustProxy: (process.env.TRUST_PROXY ?? "loopback").split(",").map((s) => s.trim()),
};
//# sourceMappingURL=config.js.map
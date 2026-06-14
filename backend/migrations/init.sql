-- Habilitar extensión para UUIDs

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



-- Tabla de Visitantes

CREATE TABLE temporaryVisitors (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    sessionToken UUID NOT NULL UNIQUE,

    ip_hash VARCHAR(64) NOT NULL,

    browserName VARCHAR(50),

    browserVersion VARCHAR(20),

    osName VARCHAR(50),

    deviceType VARCHAR(20),

    ispName VARCHAR(100),

    countryCode VARCHAR(5),

    cityName VARCHAR(100),

    first_seen_at TIMESTAMPTZ DEFAULT NOW()

);



-- Tabla de Cuotas IA

CREATE TABLE aiQuotas (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    aiRequest INT DEFAULT 0,

    timeFirstRequest TIMESTAMPTZ DEFAULT NOW(),

    visitorId UUID REFERENCES temporaryVisitors(id) ON DELETE CASCADE

);



-- Tabla de Logs de Seguridad

CREATE TABLE securityLogs (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    log TEXT NOT NULL,

    timeGenerate TIMESTAMPTZ DEFAULT NOW(),

    visitorId UUID REFERENCES temporaryVisitors(id) ON DELETE CASCADE

);



-- Tabla de Chat Público

CREATE TABLE aiPublicChat (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    prompt TEXT NOT NULL,

    response TEXT NOT NULL,

    visitorId UUID REFERENCES temporaryVisitors(id) ON DELETE CASCADE

);



-- Tabla de Infraestructura (Snapshots)

CREATE TABLE infraSnapshots (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    cpuGlobalUsage FLOAT,

    ramGlobalUsage FLOAT,

    diskUsage FLOAT,

    recorded_at TIMESTAMPTZ DEFAULT NOW()

);



-- Tabla de Métricas de Contenedores

CREATE TABLE containerMetrics (

    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    useCpu FLOAT,

    useRam FLOAT,

    useDisk FLOAT,

    recorded_at TIMESTAMPTZ DEFAULT NOW(),

    snapshotId UUID REFERENCES infraSnapshots(id) ON DELETE CASCADE

); 



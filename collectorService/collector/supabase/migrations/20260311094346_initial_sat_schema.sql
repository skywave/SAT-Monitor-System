-- 1. Setup Extensions
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- 2. Tables
CREATE TABLE IF NOT EXISTS public.agent_events (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    pbx_sn character varying,
    event_type character varying NOT NULL,
    agent_id character varying,
    agent_name character varying,
    agent_status integer,
    queue_id character varying,
    data jsonb,
    raw jsonb,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.alert_rules (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    rule_name character varying NOT NULL,
    resource_type character varying NOT NULL,
    condition_type character varying NOT NULL,
    threshold_value numeric(10,2) NOT NULL,
    threshold_operator character varying NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    notify_email boolean DEFAULT true NOT NULL,
    notify_sms boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.call_transfer_events (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    pbx_sn character varying,
    call_id character varying NOT NULL,
    from_party character varying,
    to_party character varying,
    transferrer character varying,
    data jsonb,
    raw jsonb,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.daily_call_stats (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    date date NOT NULL,
    total_calls integer DEFAULT 0 NOT NULL,
    answered_calls integer DEFAULT 0 NOT NULL,
    failed_calls integer DEFAULT 0 NOT NULL,
    unanswered_calls integer DEFAULT 0 NOT NULL,
    rejected_calls integer DEFAULT 0 NOT NULL,
    total_duration_seconds integer DEFAULT 0 NOT NULL,
    avg_duration_seconds numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT UQ_daily_call_stats UNIQUE (pbx_id, date)
);

CREATE TABLE IF NOT EXISTS public.device_bandwidth_metrics (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    device_ip character varying NOT NULL,
    interface_name character varying NOT NULL,
    bytes_in bigint DEFAULT '0'::bigint NOT NULL,
    bytes_out bigint DEFAULT '0'::bigint NOT NULL,
    bandwidth_in_mbps numeric(10,2),
    bandwidth_out_mbps numeric(10,2),
    utilization_percent numeric(5,2),
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.device_latency_metrics (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    source_device character varying NOT NULL,
    target_device character varying NOT NULL,
    latency_ms numeric(10,2),
    is_reachable boolean DEFAULT false NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.events (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    pbx_sn character varying,
    event_type character varying NOT NULL,
    event_id character varying,
    resource_type character varying NOT NULL,
    resource_id character varying,
    resource_name character varying,
    data jsonb,
    raw jsonb,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.extension_events (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    pbx_sn character varying,
    event_type character varying NOT NULL,
    ext_id character varying,
    ext_name character varying,
    registration_status integer,
    call_status integer,
    call_id character varying,
    data jsonb,
    raw jsonb,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.extension_status_history (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    ext_id character varying NOT NULL,
    ext_name character varying,
    status integer NOT NULL,
    status_text character varying,
    changed_at timestamp with time zone NOT NULL,
    duration_seconds integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.monitored_devices (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    device_name character varying NOT NULL,
    device_type character varying NOT NULL,
    ip_address character varying NOT NULL UNIQUE,
    snmp_community character varying DEFAULT 'public'::character varying NOT NULL,
    snmp_port integer DEFAULT 161 NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.network_metrics (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    host character varying NOT NULL,
    is_reachable boolean DEFAULT false NOT NULL,
    latency_ms double precision,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.network_status_history (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    host character varying NOT NULL,
    status character varying NOT NULL,
    changed_at timestamp with time zone NOT NULL,
    duration_seconds integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.state_history (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    resource_type character varying NOT NULL,
    resource_id character varying,
    previous_state jsonb,
    current_state jsonb,
    changed_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.trunk_status_history (
    id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    pbx_id character varying NOT NULL,
    trunk_id character varying NOT NULL,
    trunk_name character varying,
    status integer NOT NULL,
    status_text character varying,
    changed_at timestamp with time zone NOT NULL,
    duration_seconds integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Migration Tracking (Simplified for Supabase)
CREATE TABLE IF NOT EXISTS public.migrations (
    id SERIAL PRIMARY KEY,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS "IDX_latency" ON public.device_latency_metrics (source_device, target_device, "timestamp");
CREATE INDEX IF NOT EXISTS "IDX_trunk_id" ON public.trunk_status_history (trunk_id);
CREATE INDEX IF NOT EXISTS "IDX_trunk_history" ON public.trunk_status_history (pbx_id, changed_at);
CREATE INDEX IF NOT EXISTS "IDX_ext_id" ON public.extension_status_history (ext_id);
CREATE INDEX IF NOT EXISTS "IDX_network_metrics" ON public.network_metrics (host, "timestamp");
CREATE INDEX IF NOT EXISTS "IDX_network_status" ON public.network_status_history (host, changed_at);
CREATE INDEX IF NOT EXISTS "IDX_alert_rules" ON public.alert_rules (resource_type);
CREATE INDEX IF NOT EXISTS "IDX_ext_history" ON public.extension_status_history (pbx_id, changed_at);
CREATE INDEX IF NOT EXISTS "IDX_bandwidth" ON public.device_bandwidth_metrics (device_ip, "timestamp");
CREATE INDEX IF NOT EXISTS "IDX_daily_stats" ON public.daily_call_stats (pbx_id, date);
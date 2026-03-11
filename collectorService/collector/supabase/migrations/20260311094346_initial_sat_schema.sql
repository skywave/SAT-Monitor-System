CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Ensure the extensions schema exists and is in the search path
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agent_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agent_events (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
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


--
-- Name: alert_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alert_rules (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
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


--
-- Name: call_transfer_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.call_transfer_events (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
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


--
-- Name: daily_call_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_call_stats (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    pbx_id character varying NOT NULL,
    date date NOT NULL,
    total_calls integer DEFAULT 0 NOT NULL,
    answered_calls integer DEFAULT 0 NOT NULL,
    failed_calls integer DEFAULT 0 NOT NULL,
    unanswered_calls integer DEFAULT 0 NOT NULL,
    rejected_calls integer DEFAULT 0 NOT NULL,
    total_duration_seconds integer DEFAULT 0 NOT NULL,
    avg_duration_seconds numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: device_bandwidth_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_bandwidth_metrics (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
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


--
-- Name: device_latency_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_latency_metrics (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    source_device character varying NOT NULL,
    target_device character varying NOT NULL,
    latency_ms numeric(10,2),
    is_reachable boolean DEFAULT false NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
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


--
-- Name: extension_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.extension_events (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
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


--
-- Name: extension_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.extension_status_history (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    pbx_id character varying NOT NULL,
    ext_id character varying NOT NULL,
    ext_name character varying,
    status integer NOT NULL,
    status_text character varying,
    changed_at timestamp with time zone NOT NULL,
    duration_seconds integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: monitored_devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.monitored_devices (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    device_name character varying NOT NULL,
    device_type character varying NOT NULL,
    ip_address character varying NOT NULL,
    snmp_community character varying DEFAULT 'public'::character varying NOT NULL,
    snmp_port integer DEFAULT 161 NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: network_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.network_metrics (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    host character varying NOT NULL,
    is_reachable boolean DEFAULT false NOT NULL,
    latency_ms double precision,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: network_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.network_status_history (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    host character varying NOT NULL,
    status character varying NOT NULL,
    changed_at timestamp with time zone NOT NULL,
    duration_seconds integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: state_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.state_history (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    pbx_id character varying NOT NULL,
    resource_type character varying NOT NULL,
    resource_id character varying,
    previous_state jsonb,
    current_state jsonb,
    changed_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: trunk_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trunk_status_history (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    pbx_id character varying NOT NULL,
    trunk_id character varying NOT NULL,
    trunk_name character varying,
    status integer NOT NULL,
    status_text character varying,
    changed_at timestamp with time zone NOT NULL,
    duration_seconds integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: extension_status_history PK_05ba0e1381527751d72dafc7b58; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.extension_status_history
    ADD CONSTRAINT "PK_05ba0e1381527751d72dafc7b58" PRIMARY KEY (id);


--
-- Name: state_history PK_07c8cef5a83e4f337ebb87ed58e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.state_history
    ADD CONSTRAINT "PK_07c8cef5a83e4f337ebb87ed58e" PRIMARY KEY (id);


--
-- Name: device_bandwidth_metrics PK_38ac381d59dbc0fa4d42765baf1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_bandwidth_metrics
    ADD CONSTRAINT "PK_38ac381d59dbc0fa4d42765baf1" PRIMARY KEY (id);


--
-- Name: events PK_40731c7151fe4be3116e45ddf73; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY (id);


--
-- Name: call_transfer_events PK_4a72c6e0665d64ad2426f0b6618; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.call_transfer_events
    ADD CONSTRAINT "PK_4a72c6e0665d64ad2426f0b6618" PRIMARY KEY (id);


--
-- Name: network_status_history PK_4a9d11405430281e996a75b27f6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.network_status_history
    ADD CONSTRAINT "PK_4a9d11405430281e996a75b27f6" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: agent_events PK_94c713565641b3cfac600e14e94; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agent_events
    ADD CONSTRAINT "PK_94c713565641b3cfac600e14e94" PRIMARY KEY (id);


--
-- Name: device_latency_metrics PK_9fde6f3d873d85adc349339ce27; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_latency_metrics
    ADD CONSTRAINT "PK_9fde6f3d873d85adc349339ce27" PRIMARY KEY (id);


--
-- Name: daily_call_stats PK_a81fc729c8354fede59e5156539; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_call_stats
    ADD CONSTRAINT "PK_a81fc729c8354fede59e5156539" PRIMARY KEY (id);


--
-- Name: alert_rules PK_ae580564f087ffab9d229225aec; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alert_rules
    ADD CONSTRAINT "PK_ae580564f087ffab9d229225aec" PRIMARY KEY (id);


--
-- Name: network_metrics PK_cc8b3acf7a9593f70dc8d167edb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.network_metrics
    ADD CONSTRAINT "PK_cc8b3acf7a9593f70dc8d167edb" PRIMARY KEY (id);


--
-- Name: extension_events PK_d79cd20657a19504544b946527a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.extension_events
    ADD CONSTRAINT "PK_d79cd20657a19504544b946527a" PRIMARY KEY (id);


--
-- Name: trunk_status_history PK_e5c1de01224492282563c63d91a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trunk_status_history
    ADD CONSTRAINT "PK_e5c1de01224492282563c63d91a" PRIMARY KEY (id);


--
-- Name: monitored_devices PK_eed4ed36fc8896f5b1f6fe5c720; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monitored_devices
    ADD CONSTRAINT "PK_eed4ed36fc8896f5b1f6fe5c720" PRIMARY KEY (id);


--
-- Name: monitored_devices UQ_80e2b5ae952c341edcef05cad47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.monitored_devices
    ADD CONSTRAINT "UQ_80e2b5ae952c341edcef05cad47" UNIQUE (ip_address);


--
-- Name: daily_call_stats UQ_f78e9a1df7ad7fe4af8d62e3d53; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_call_stats
    ADD CONSTRAINT "UQ_f78e9a1df7ad7fe4af8d62e3d53" UNIQUE (pbx_id, date);


--
-- Name: IDX_067a3af1ad0e9fdba9e7e323fb; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_067a3af1ad0e9fdba9e7e323fb" ON public.device_latency_metrics USING btree (source_device, target_device, "timestamp");


--
-- Name: IDX_130cfcc32680e560a6e4627119; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_130cfcc32680e560a6e4627119" ON public.trunk_status_history USING btree (trunk_id);


--
-- Name: IDX_1cd160c95245d9ca242254580d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_1cd160c95245d9ca242254580d" ON public.trunk_status_history USING btree (pbx_id, changed_at);


--
-- Name: IDX_34b970f1f7e7b391dbb5ab10af; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_34b970f1f7e7b391dbb5ab10af" ON public.extension_status_history USING btree (ext_id);


--
-- Name: IDX_3989576238ab6bfeb01abdf0a9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_3989576238ab6bfeb01abdf0a9" ON public.network_metrics USING btree (host, "timestamp");


--
-- Name: IDX_4a38bcff527a050392fe4b07c2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_4a38bcff527a050392fe4b07c2" ON public.network_status_history USING btree (host, changed_at);


--
-- Name: IDX_646f7f8ded21e5b35f9abc4736; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_646f7f8ded21e5b35f9abc4736" ON public.alert_rules USING btree (resource_type);


--
-- Name: IDX_6536953542021fd5b914939ff5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_6536953542021fd5b914939ff5" ON public.extension_status_history USING btree (pbx_id, changed_at);


--
-- Name: IDX_a8f0132aefb10dd206073be02b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_a8f0132aefb10dd206073be02b" ON public.device_bandwidth_metrics USING btree (device_ip, "timestamp");


--
-- Name: IDX_f78e9a1df7ad7fe4af8d62e3d5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_f78e9a1df7ad7fe4af8d62e3d5" ON public.daily_call_stats USING btree (pbx_id, date);


--
-- PostgreSQL database dump complete
--

\unrestrict 0u1aBsxe80zv3rLyC6QXfHquiwkXsyHQ7m6cN9MTdRMRd7bSKTbYt4U4c4FJs95


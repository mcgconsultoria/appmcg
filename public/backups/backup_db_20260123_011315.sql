--
-- PostgreSQL database dump
--

\restrict PbKM1Xb9sIv9gV1Szc16poFuKP5ZQOtPbpG13Wueb2bPFl1ctElislh9BI5fH9f

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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
-- Name: stripe; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA stripe;


ALTER SCHEMA stripe OWNER TO postgres;

--
-- Name: invoice_status; Type: TYPE; Schema: stripe; Owner: postgres
--

CREATE TYPE stripe.invoice_status AS ENUM (
    'draft',
    'open',
    'paid',
    'uncollectible',
    'void',
    'deleted'
);


ALTER TYPE stripe.invoice_status OWNER TO postgres;

--
-- Name: pricing_tiers; Type: TYPE; Schema: stripe; Owner: postgres
--

CREATE TYPE stripe.pricing_tiers AS ENUM (
    'graduated',
    'volume'
);


ALTER TYPE stripe.pricing_tiers OWNER TO postgres;

--
-- Name: pricing_type; Type: TYPE; Schema: stripe; Owner: postgres
--

CREATE TYPE stripe.pricing_type AS ENUM (
    'one_time',
    'recurring'
);


ALTER TYPE stripe.pricing_type OWNER TO postgres;

--
-- Name: subscription_schedule_status; Type: TYPE; Schema: stripe; Owner: postgres
--

CREATE TYPE stripe.subscription_schedule_status AS ENUM (
    'not_started',
    'active',
    'completed',
    'released',
    'canceled'
);


ALTER TYPE stripe.subscription_schedule_status OWNER TO postgres;

--
-- Name: subscription_status; Type: TYPE; Schema: stripe; Owner: postgres
--

CREATE TYPE stripe.subscription_status AS ENUM (
    'trialing',
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'unpaid',
    'paused'
);


ALTER TYPE stripe.subscription_status OWNER TO postgres;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new._updated_at = now();
  return NEW;
end;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

--
-- Name: set_updated_at_metadata(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at_metadata() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return NEW;
end;
$$;


ALTER FUNCTION public.set_updated_at_metadata() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounting_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounting_entries (
    id integer NOT NULL,
    company_id integer,
    dre_account_id integer NOT NULL,
    cost_center_id integer,
    bank_account_id integer,
    entry_date date NOT NULL,
    competence_date date NOT NULL,
    document_number character varying(50),
    document_type character varying(50),
    description text NOT NULL,
    entry_type character varying(10) NOT NULL,
    value numeric(15,2) NOT NULL,
    status character varying(20) DEFAULT 'confirmado'::character varying,
    reconciled boolean DEFAULT false,
    reconciled_at timestamp without time zone,
    nfse_invoice_id integer,
    financial_record_id integer,
    notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.accounting_entries OWNER TO postgres;

--
-- Name: accounting_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accounting_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.accounting_entries_id_seq OWNER TO postgres;

--
-- Name: accounting_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accounting_entries_id_seq OWNED BY public.accounting_entries.id;


--
-- Name: admin_contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_contracts (
    id integer NOT NULL,
    proposal_id integer,
    lead_id integer,
    contract_number character varying(50),
    client_name character varying(255) NOT NULL,
    client_cnpj character varying(18),
    service_type character varying(100),
    description text,
    value numeric(15,2),
    payment_terms character varying(100),
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    status character varying DEFAULT 'active'::character varying,
    signed_at timestamp without time zone,
    signed_by character varying(255),
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_contracts OWNER TO postgres;

--
-- Name: admin_contracts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_contracts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_contracts_id_seq OWNER TO postgres;

--
-- Name: admin_contracts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_contracts_id_seq OWNED BY public.admin_contracts.id;


--
-- Name: admin_financial_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_financial_records (
    id integer NOT NULL,
    type character varying(50) NOT NULL,
    category character varying(100),
    subcategory character varying(100),
    description character varying(255),
    client_name character varying(255),
    contract_id integer,
    value numeric(15,2) NOT NULL,
    due_date timestamp without time zone,
    paid_at timestamp without time zone,
    status character varying DEFAULT 'pending'::character varying,
    payment_method character varying(100),
    nfse_number character varying(50),
    nfse_issued_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_financial_records OWNER TO postgres;

--
-- Name: admin_financial_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_financial_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_financial_records_id_seq OWNER TO postgres;

--
-- Name: admin_financial_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_financial_records_id_seq OWNED BY public.admin_financial_records.id;


--
-- Name: admin_leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_leads (
    id integer NOT NULL,
    company_name character varying(255) NOT NULL,
    trade_name character varying(255),
    cnpj character varying(18),
    contact_name character varying(255),
    contact_email character varying,
    contact_phone character varying(20),
    city character varying(100),
    state character varying(2),
    segment character varying(100),
    source character varying(100),
    interest character varying(100),
    stage character varying DEFAULT 'lead'::character varying,
    estimated_value numeric(15,2),
    probability integer DEFAULT 0,
    notes text,
    next_follow_up timestamp without time zone,
    assigned_to character varying(255),
    lost_reason character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_leads OWNER TO postgres;

--
-- Name: admin_leads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_leads_id_seq OWNER TO postgres;

--
-- Name: admin_leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_leads_id_seq OWNED BY public.admin_leads.id;


--
-- Name: admin_partnerships; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_partnerships (
    id integer NOT NULL,
    partner_name character varying(255) NOT NULL,
    partner_type character varying(100),
    contact_name character varying(255),
    contact_email character varying,
    contact_phone character varying(20),
    website character varying(255),
    description text,
    benefits text,
    status character varying DEFAULT 'prospecting'::character varying,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    owner_name character varying(255),
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_partnerships OWNER TO postgres;

--
-- Name: admin_partnerships_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_partnerships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_partnerships_id_seq OWNER TO postgres;

--
-- Name: admin_partnerships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_partnerships_id_seq OWNED BY public.admin_partnerships.id;


--
-- Name: admin_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_posts (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255),
    content text,
    excerpt text,
    category character varying(100),
    tags jsonb,
    target_audience jsonb,
    featured_image text,
    status character varying DEFAULT 'draft'::character varying,
    publish_at timestamp without time zone,
    published_at timestamp without time zone,
    author_name character varying(255),
    views integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_posts OWNER TO postgres;

--
-- Name: admin_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_posts_id_seq OWNER TO postgres;

--
-- Name: admin_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_posts_id_seq OWNED BY public.admin_posts.id;


--
-- Name: admin_project_deliverables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_project_deliverables (
    id integer NOT NULL,
    project_id integer NOT NULL,
    phase_id integer,
    name character varying(255) NOT NULL,
    description text,
    due_date timestamp without time zone,
    completed_at timestamp without time zone,
    status character varying DEFAULT 'pending'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_project_deliverables OWNER TO postgres;

--
-- Name: admin_project_deliverables_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_project_deliverables_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_project_deliverables_id_seq OWNER TO postgres;

--
-- Name: admin_project_deliverables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_project_deliverables_id_seq OWNED BY public.admin_project_deliverables.id;


--
-- Name: admin_project_phases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_project_phases (
    id integer NOT NULL,
    project_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    order_index integer DEFAULT 0,
    start_date timestamp without time zone,
    target_end_date timestamp without time zone,
    actual_end_date timestamp without time zone,
    status character varying DEFAULT 'pending'::character varying,
    progress integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_project_phases OWNER TO postgres;

--
-- Name: admin_project_phases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_project_phases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_project_phases_id_seq OWNER TO postgres;

--
-- Name: admin_project_phases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_project_phases_id_seq OWNED BY public.admin_project_phases.id;


--
-- Name: admin_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_projects (
    id integer NOT NULL,
    contract_id integer,
    lead_id integer,
    name character varying(255) NOT NULL,
    client_name character varying(255),
    project_type character varying(100),
    description text,
    start_date timestamp without time zone,
    target_end_date timestamp without time zone,
    actual_end_date timestamp without time zone,
    status character varying DEFAULT 'planning'::character varying,
    progress integer DEFAULT 0,
    value numeric(15,2),
    assigned_to character varying(255),
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_projects OWNER TO postgres;

--
-- Name: admin_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_projects_id_seq OWNER TO postgres;

--
-- Name: admin_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_projects_id_seq OWNED BY public.admin_projects.id;


--
-- Name: admin_proposals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_proposals (
    id integer NOT NULL,
    lead_id integer,
    proposal_number character varying(50),
    title character varying(255) NOT NULL,
    client_name character varying(255),
    service_type character varying(100),
    description text,
    value numeric(15,2),
    discount numeric(5,2),
    final_value numeric(15,2),
    valid_until timestamp without time zone,
    status character varying DEFAULT 'draft'::character varying,
    sent_at timestamp without time zone,
    accepted_at timestamp without time zone,
    rejected_reason character varying(255),
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_proposals OWNER TO postgres;

--
-- Name: admin_proposals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_proposals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_proposals_id_seq OWNER TO postgres;

--
-- Name: admin_proposals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_proposals_id_seq OWNED BY public.admin_proposals.id;


--
-- Name: antt_freight_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.antt_freight_table (
    id integer NOT NULL,
    operation_type character varying(1) NOT NULL,
    cargo_type character varying(100) NOT NULL,
    axles integer NOT NULL,
    ccd numeric(10,4) NOT NULL,
    cc numeric(10,2) NOT NULL,
    valid_from timestamp without time zone,
    valid_until timestamp without time zone
);


ALTER TABLE public.antt_freight_table OWNER TO postgres;

--
-- Name: antt_freight_table_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.antt_freight_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.antt_freight_table_id_seq OWNER TO postgres;

--
-- Name: antt_freight_table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.antt_freight_table_id_seq OWNED BY public.antt_freight_table.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    company_id integer NOT NULL,
    user_id character varying(36) NOT NULL,
    user_email character varying(255),
    user_name character varying(255),
    action character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id character varying(100),
    entity_name character varying(255),
    details jsonb,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_accounts (
    id integer NOT NULL,
    company_id integer,
    bank_code character varying(10) NOT NULL,
    bank_name character varying(100) NOT NULL,
    agency character varying(10) NOT NULL,
    agency_digit character varying(2),
    account_number character varying(20) NOT NULL,
    account_digit character varying(2),
    account_type character varying(20) DEFAULT 'corrente'::character varying,
    holder_name character varying(255),
    holder_cnpj character varying(18),
    pix_key character varying(100),
    pix_key_type character varying(20),
    open_banking_enabled boolean DEFAULT false,
    open_banking_token text,
    is_main boolean DEFAULT false,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    external_account_id character varying(100)
);


ALTER TABLE public.bank_accounts OWNER TO postgres;

--
-- Name: bank_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_accounts_id_seq OWNER TO postgres;

--
-- Name: bank_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_accounts_id_seq OWNED BY public.bank_accounts.id;


--
-- Name: bank_integrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_integrations (
    id integer NOT NULL,
    company_id integer,
    bank_account_id integer NOT NULL,
    provider character varying(50) NOT NULL,
    client_id character varying(255),
    client_secret text,
    access_token text,
    refresh_token text,
    token_expires_at timestamp without time zone,
    webhook_url text,
    webhook_secret text,
    sandbox_mode boolean DEFAULT true,
    permissions jsonb,
    last_sync_at timestamp without time zone,
    sync_status character varying(20) DEFAULT 'pending'::character varying,
    error_message text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.bank_integrations OWNER TO postgres;

--
-- Name: bank_integrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_integrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_integrations_id_seq OWNER TO postgres;

--
-- Name: bank_integrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_integrations_id_seq OWNED BY public.bank_integrations.id;


--
-- Name: bank_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_transactions (
    id integer NOT NULL,
    company_id integer,
    bank_account_id integer NOT NULL,
    external_id character varying(100),
    transaction_date date NOT NULL,
    transaction_type character varying(50),
    description text,
    counterparty_name character varying(255),
    counterparty_document character varying(20),
    counterparty_bank character varying(100),
    pix_key character varying(255),
    end_to_end_id character varying(100),
    value numeric(15,2) NOT NULL,
    balance numeric(15,2),
    accounting_entry_id integer,
    reconciled boolean DEFAULT false,
    reconciled_at timestamp without time zone,
    raw_data jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.bank_transactions OWNER TO postgres;

--
-- Name: bank_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bank_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_transactions_id_seq OWNER TO postgres;

--
-- Name: bank_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bank_transactions_id_seq OWNED BY public.bank_transactions.id;


--
-- Name: business_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.business_types OWNER TO postgres;

--
-- Name: business_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.business_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.business_types_id_seq OWNER TO postgres;

--
-- Name: business_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.business_types_id_seq OWNED BY public.business_types.id;


--
-- Name: checklist_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklist_attachments (
    id integer NOT NULL,
    checklist_id integer NOT NULL,
    company_id integer NOT NULL,
    categoria character varying(50) NOT NULL,
    nome character varying(255) NOT NULL,
    descricao text,
    arquivo character varying(500),
    data_validade timestamp without time zone,
    lembrete_15_dias_enviado boolean DEFAULT false,
    lembrete_enviado_em timestamp without time zone,
    emails_notificacao jsonb,
    section_key character varying(50),
    status character varying DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.checklist_attachments OWNER TO postgres;

--
-- Name: checklist_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checklist_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checklist_attachments_id_seq OWNER TO postgres;

--
-- Name: checklist_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checklist_attachments_id_seq OWNED BY public.checklist_attachments.id;


--
-- Name: checklist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklist_items (
    id integer NOT NULL,
    checklist_id integer NOT NULL,
    department character varying(100) NOT NULL,
    question text NOT NULL,
    answer text,
    checked boolean DEFAULT false,
    notes text,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    section_id integer
);


ALTER TABLE public.checklist_items OWNER TO postgres;

--
-- Name: checklist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checklist_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checklist_items_id_seq OWNER TO postgres;

--
-- Name: checklist_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checklist_items_id_seq OWNED BY public.checklist_items.id;


--
-- Name: checklist_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklist_sections (
    id integer NOT NULL,
    checklist_id integer NOT NULL,
    section_key character varying(50) NOT NULL,
    section_name character varying(100) NOT NULL,
    responsavel_nome character varying(255),
    responsavel_email character varying(255),
    data_recebimento timestamp without time zone,
    data_retorno timestamp without time zone,
    is_perfil boolean,
    parecer text,
    documentos_atualizados boolean DEFAULT false,
    documentos_observacao text,
    status character varying DEFAULT 'pending'::character varying,
    progress integer DEFAULT 0,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    prestador_nome character varying(255),
    prestador_telefone character varying(20),
    prestador_email character varying(255),
    prestador_aniversario character varying(10),
    prestador_cargo character varying(100),
    cliente_contato_nome character varying(255),
    cliente_contato_telefone character varying(20),
    cliente_contato_email character varying(255),
    cliente_contato_aniversario character varying(10),
    cliente_contato_cargo character varying(100),
    aprovado_prestador boolean DEFAULT false,
    aprovado_prestador_data timestamp without time zone,
    aprovado_prestador_por character varying(255),
    aprovado_cliente boolean DEFAULT false,
    aprovado_cliente_data timestamp without time zone,
    aprovado_cliente_por character varying(255)
);


ALTER TABLE public.checklist_sections OWNER TO postgres;

--
-- Name: checklist_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checklist_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checklist_sections_id_seq OWNER TO postgres;

--
-- Name: checklist_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checklist_sections_id_seq OWNED BY public.checklist_sections.id;


--
-- Name: checklist_template_purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklist_template_purchases (
    id integer NOT NULL,
    template_id integer NOT NULL,
    user_id character varying NOT NULL,
    company_id integer,
    stripe_payment_intent_id character varying(255),
    stripe_session_id character varying(255),
    amount_paid integer,
    status character varying(50) DEFAULT 'pending'::character varying,
    resulting_checklist_id integer,
    purchased_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.checklist_template_purchases OWNER TO postgres;

--
-- Name: checklist_template_purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checklist_template_purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checklist_template_purchases_id_seq OWNER TO postgres;

--
-- Name: checklist_template_purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checklist_template_purchases_id_seq OWNED BY public.checklist_template_purchases.id;


--
-- Name: checklist_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklist_templates (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    segment character varying(100) NOT NULL,
    industry_name character varying(255),
    price_in_cents integer DEFAULT 9900,
    stripe_price_id character varying(255),
    is_active boolean DEFAULT true,
    preview_image_url character varying(500),
    template_data jsonb,
    section_updates jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.checklist_templates OWNER TO postgres;

--
-- Name: checklist_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checklist_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checklist_templates_id_seq OWNER TO postgres;

--
-- Name: checklist_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checklist_templates_id_seq OWNED BY public.checklist_templates.id;


--
-- Name: checklists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklists (
    id integer NOT NULL,
    company_id integer NOT NULL,
    client_id integer,
    name character varying(255) NOT NULL,
    segment character varying(100),
    status character varying DEFAULT 'in_progress'::character varying,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    cliente_nome character varying(255),
    cliente_cnpj character varying(18),
    focal_point_nome character varying(255),
    focal_point_email character varying(255),
    focal_point_celular character varying(20),
    focal_point_regiao character varying(100),
    historia text,
    localizacao text,
    segmento_detalhado text,
    produto text,
    numeros text,
    noticias text,
    site character varying(255),
    linkedin character varying(255),
    email_comercial character varying(255),
    contato_comercial text,
    abrangencia_nacional boolean DEFAULT false,
    abrangencia_regional boolean DEFAULT false,
    abrangencia_internacional boolean DEFAULT false,
    market_share text,
    posicao_mercado text,
    oportunidades jsonb,
    pipeline_segmento character varying(100),
    pipeline_produto character varying(255),
    pipeline_volume character varying(100),
    pipeline_target numeric(15,2),
    contatos_cliente jsonb,
    portais_senhas jsonb,
    documentos_empresa jsonb
);


ALTER TABLE public.checklists OWNER TO postgres;

--
-- Name: checklists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checklists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checklists_id_seq OWNER TO postgres;

--
-- Name: checklists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checklists_id_seq OWNED BY public.checklists.id;


--
-- Name: client_operations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_operations (
    id integer NOT NULL,
    company_id integer NOT NULL,
    client_id integer NOT NULL,
    proposal_id integer,
    operation_name character varying(255) NOT NULL,
    origin_city character varying(100) NOT NULL,
    origin_state character varying(2) NOT NULL,
    destination_city character varying(100) NOT NULL,
    destination_state character varying(2) NOT NULL,
    product_type character varying(100),
    packaging_type character varying(100),
    agreed_freight numeric(15,2),
    contract_start_date timestamp without time zone,
    contract_end_date timestamp without time zone,
    next_review_date timestamp without time zone,
    review_period_months integer DEFAULT 6,
    status character varying DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.client_operations OWNER TO postgres;

--
-- Name: client_operations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_operations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_operations_id_seq OWNER TO postgres;

--
-- Name: client_operations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_operations_id_seq OWNED BY public.client_operations.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    trade_name character varying(255),
    cnpj character varying(18),
    email character varying,
    phone character varying(20),
    address text,
    city character varying(100),
    state character varying(2),
    segment character varying(100),
    status character varying DEFAULT 'prospect'::character varying,
    pipeline_stage character varying DEFAULT 'lead'::character varying,
    notes text,
    contact_name character varying(255),
    contact_phone character varying(20),
    contact_email character varying,
    estimated_value numeric(15,2),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    tipo_empresa character varying(100),
    vendedor character varying(255),
    meta_valor numeric(15,2),
    inscricao_estadual character varying(20),
    inscricao_estadual_isento boolean DEFAULT false,
    inscricao_municipal character varying(20)
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_id_seq OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: commercial_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.commercial_events (
    id integer NOT NULL,
    company_id integer NOT NULL,
    client_id integer,
    user_id character varying,
    title character varying(255) NOT NULL,
    description text,
    event_type character varying(50) DEFAULT 'meeting'::character varying,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone,
    all_day boolean DEFAULT false,
    location character varying(255),
    pipeline_stage character varying(50),
    meeting_record_id integer,
    recurrence character varying(50),
    status character varying DEFAULT 'scheduled'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.commercial_events OWNER TO postgres;

--
-- Name: commercial_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.commercial_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.commercial_events_id_seq OWNER TO postgres;

--
-- Name: commercial_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.commercial_events_id_seq OWNED BY public.commercial_events.id;


--
-- Name: commercial_flowcharts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.commercial_flowcharts (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    company_id integer,
    name character varying(255) DEFAULT 'Fluxograma Principal'::character varying,
    nodes jsonb DEFAULT '[]'::jsonb,
    edges jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.commercial_flowcharts OWNER TO postgres;

--
-- Name: commercial_flowcharts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.commercial_flowcharts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.commercial_flowcharts_id_seq OWNER TO postgres;

--
-- Name: commercial_flowcharts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.commercial_flowcharts_id_seq OWNED BY public.commercial_flowcharts.id;


--
-- Name: commercial_proposals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.commercial_proposals (
    id integer NOT NULL,
    company_id integer NOT NULL,
    client_id integer,
    proposal_number character varying(20) NOT NULL,
    client_name character varying(255),
    client_email character varying,
    client_phone character varying(20),
    client_cnpj character varying(18),
    status character varying DEFAULT 'awaiting_approval'::character varying,
    valid_until timestamp without time zone,
    approved_at timestamp without time zone,
    contract_type character varying,
    next_review_date timestamp without time zone,
    notes text,
    total_value numeric(15,2),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    proposal_type character varying(20) DEFAULT 'freight'::character varying,
    proposal_data jsonb
);


ALTER TABLE public.commercial_proposals OWNER TO postgres;

--
-- Name: commercial_proposals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.commercial_proposals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.commercial_proposals_id_seq OWNER TO postgres;

--
-- Name: commercial_proposals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.commercial_proposals_id_seq OWNED BY public.commercial_proposals.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    cnpj character varying(18),
    email character varying,
    phone character varying(20),
    address text,
    city character varying(100),
    state character varying(2),
    subscription_status character varying DEFAULT 'trial'::character varying,
    subscription_end_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    logo text,
    nome_fantasia character varying(255),
    inscricao_estadual character varying(20),
    inscricao_estadual_isento boolean DEFAULT false,
    inscricao_municipal character varying(20),
    allowed_email_domain character varying(255),
    enforce_email_domain boolean DEFAULT false,
    cnpj_raiz character varying(8),
    tipo_unidade character varying(20) DEFAULT 'matriz'::character varying,
    selected_plan character varying(50) DEFAULT 'free'::character varying,
    max_users integer DEFAULT 1,
    current_users integer DEFAULT 1,
    primary_admin_id character varying,
    stripe_customer_id character varying,
    stripe_subscription_id character varying,
    cancellation_requested_at timestamp without time zone,
    cancellation_effective_date timestamp without time zone,
    cancellation_reason text,
    renewal_price integer,
    renewal_due_date timestamp without time zone,
    renewal_approved boolean DEFAULT false,
    renewal_approved_at timestamp without time zone,
    contract_start_date timestamp without time zone,
    last_access_warning_email_sent timestamp without time zone
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: company_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_roles (
    id integer NOT NULL,
    company_id integer,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    color character varying(20),
    permissions text[] DEFAULT '{}'::text[],
    is_system boolean DEFAULT false,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.company_roles OWNER TO postgres;

--
-- Name: company_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_roles_id_seq OWNER TO postgres;

--
-- Name: company_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_roles_id_seq OWNED BY public.company_roles.id;


--
-- Name: company_team_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_team_members (
    id integer NOT NULL,
    company_id integer NOT NULL,
    user_id character varying NOT NULL,
    role character varying(50) DEFAULT 'member'::character varying,
    department character varying(100),
    permissions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    invited_by character varying,
    invited_at timestamp without time zone,
    joined_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.company_team_members OWNER TO postgres;

--
-- Name: company_team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_team_members_id_seq OWNER TO postgres;

--
-- Name: company_team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_team_members_id_seq OWNED BY public.company_team_members.id;


--
-- Name: consulting_quote_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consulting_quote_requests (
    id integer NOT NULL,
    contact_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    message text,
    phases text NOT NULL,
    has_expansao boolean DEFAULT false,
    status character varying(50) DEFAULT 'pending'::character varying,
    response_notes text,
    quoted_value numeric(15,2),
    responded_at timestamp without time zone,
    responded_by character varying(36),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.consulting_quote_requests OWNER TO postgres;

--
-- Name: consulting_quote_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consulting_quote_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consulting_quote_requests_id_seq OWNER TO postgres;

--
-- Name: consulting_quote_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consulting_quote_requests_id_seq OWNED BY public.consulting_quote_requests.id;


--
-- Name: contract_agreements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contract_agreements (
    id integer NOT NULL,
    company_id integer NOT NULL,
    template_id integer NOT NULL,
    contract_type character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    provider_name character varying(50),
    provider_envelope_id character varying(255),
    provider_sign_url character varying(1000),
    signed_pdf_url character varying(1000),
    issued_at timestamp without time zone,
    viewed_at timestamp without time zone,
    signed_at timestamp without time zone,
    expires_at timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contract_agreements OWNER TO postgres;

--
-- Name: contract_agreements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contract_agreements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contract_agreements_id_seq OWNER TO postgres;

--
-- Name: contract_agreements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contract_agreements_id_seq OWNED BY public.contract_agreements.id;


--
-- Name: contract_signatures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contract_signatures (
    id integer NOT NULL,
    agreement_id integer NOT NULL,
    signer_role character varying(50) NOT NULL,
    signer_user_id character varying,
    signer_name character varying(255),
    signer_email character varying(255),
    signer_cpf character varying(14),
    signature_type character varying(50),
    certificate_info jsonb,
    signed_at timestamp without time zone,
    ip_address character varying(45),
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contract_signatures OWNER TO postgres;

--
-- Name: contract_signatures_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contract_signatures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contract_signatures_id_seq OWNER TO postgres;

--
-- Name: contract_signatures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contract_signatures_id_seq OWNED BY public.contract_signatures.id;


--
-- Name: contract_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contract_templates (
    id integer NOT NULL,
    type character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    version character varying(20) DEFAULT '1.0'::character varying,
    content text,
    is_active boolean DEFAULT true,
    valid_from timestamp without time zone,
    valid_until timestamp without time zone,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contract_templates OWNER TO postgres;

--
-- Name: contract_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contract_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contract_templates_id_seq OWNER TO postgres;

--
-- Name: contract_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contract_templates_id_seq OWNED BY public.contract_templates.id;


--
-- Name: cost_centers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cost_centers (
    id integer NOT NULL,
    company_id integer,
    parent_id integer,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50),
    description text,
    budget numeric(15,2),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.cost_centers OWNER TO postgres;

--
-- Name: cost_centers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cost_centers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cost_centers_id_seq OWNER TO postgres;

--
-- Name: cost_centers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cost_centers_id_seq OWNED BY public.cost_centers.id;


--
-- Name: diagnostic_leads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diagnostic_leads (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    company character varying(255),
    phone character varying(20),
    segment character varying(100),
    score integer NOT NULL,
    max_score integer NOT NULL,
    percentage integer NOT NULL,
    maturity_level character varying(50) NOT NULL,
    answers jsonb,
    status character varying(50) DEFAULT 'novo'::character varying,
    notes text,
    follow_up_date timestamp without time zone,
    assigned_to character varying(255),
    source character varying(100) DEFAULT 'diagnostico'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.diagnostic_leads OWNER TO postgres;

--
-- Name: diagnostic_leads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diagnostic_leads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diagnostic_leads_id_seq OWNER TO postgres;

--
-- Name: diagnostic_leads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diagnostic_leads_id_seq OWNED BY public.diagnostic_leads.id;


--
-- Name: digital_certificates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.digital_certificates (
    id integer NOT NULL,
    company_id integer,
    name character varying(255) NOT NULL,
    type character varying(10) DEFAULT 'A1'::character varying,
    cnpj character varying(18),
    serial_number character varying(100),
    issuer character varying(255),
    valid_from timestamp without time zone,
    valid_until timestamp without time zone,
    certificate_data text,
    password_hash character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.digital_certificates OWNER TO postgres;

--
-- Name: digital_certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.digital_certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.digital_certificates_id_seq OWNER TO postgres;

--
-- Name: digital_certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.digital_certificates_id_seq OWNED BY public.digital_certificates.id;


--
-- Name: dre_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dre_accounts (
    id integer NOT NULL,
    company_id integer,
    parent_id integer,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    nature character varying(20) NOT NULL,
    type character varying(50),
    level integer DEFAULT 1,
    report_order integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.dre_accounts OWNER TO postgres;

--
-- Name: dre_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dre_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dre_accounts_id_seq OWNER TO postgres;

--
-- Name: dre_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dre_accounts_id_seq OWNED BY public.dre_accounts.id;


--
-- Name: ebook_volumes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ebook_volumes (
    id integer NOT NULL,
    product_id integer NOT NULL,
    volume_number integer NOT NULL,
    title character varying(255) NOT NULL,
    subtitle character varying(255),
    author_name character varying(255),
    author_bio text,
    teaser_html text,
    manuscript_status character varying(50) DEFAULT 'draft'::character varying,
    release_date date,
    digital_file_url text,
    print_isbn character varying(20),
    digital_isbn character varying(20),
    page_count integer,
    is_published boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ebook_volumes OWNER TO postgres;

--
-- Name: ebook_volumes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ebook_volumes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ebook_volumes_id_seq OWNER TO postgres;

--
-- Name: ebook_volumes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ebook_volumes_id_seq OWNED BY public.ebook_volumes.id;


--
-- Name: financial_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financial_accounts (
    id integer NOT NULL,
    company_id integer NOT NULL,
    client_id integer,
    type character varying(20) NOT NULL,
    description text NOT NULL,
    value numeric(15,2) NOT NULL,
    due_date timestamp without time zone,
    paid_date timestamp without time zone,
    status character varying DEFAULT 'pending'::character varying,
    category character varying(100),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.financial_accounts OWNER TO postgres;

--
-- Name: financial_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.financial_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financial_accounts_id_seq OWNER TO postgres;

--
-- Name: financial_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.financial_accounts_id_seq OWNED BY public.financial_accounts.id;


--
-- Name: freight_calculations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.freight_calculations (
    id integer NOT NULL,
    company_id integer NOT NULL,
    client_id integer,
    origin_city character varying(100),
    origin_state character varying(2),
    destination_city character varying(100),
    destination_state character varying(2),
    weight numeric(10,2),
    cargo_value numeric(15,2),
    freight_value numeric(15,2),
    icms_rate numeric(5,2),
    icms_value numeric(15,2),
    gris_rate numeric(5,4),
    gris_value numeric(15,2),
    adv_rate numeric(5,4),
    adv_value numeric(15,2),
    toll_value numeric(15,2),
    unloading_value numeric(15,2),
    total_value numeric(15,2),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.freight_calculations OWNER TO postgres;

--
-- Name: freight_calculations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.freight_calculations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.freight_calculations_id_seq OWNER TO postgres;

--
-- Name: freight_calculations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.freight_calculations_id_seq OWNED BY public.freight_calculations.id;


--
-- Name: irpf_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.irpf_assets (
    id integer NOT NULL,
    declaration_id integer NOT NULL,
    code character varying(10),
    type character varying(50) NOT NULL,
    description character varying(500) NOT NULL,
    location character varying(100),
    acquisition_date date,
    acquisition_value numeric(15,2),
    current_value numeric(15,2),
    previous_year_value numeric(15,2),
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.irpf_assets OWNER TO postgres;

--
-- Name: irpf_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.irpf_assets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.irpf_assets_id_seq OWNER TO postgres;

--
-- Name: irpf_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.irpf_assets_id_seq OWNED BY public.irpf_assets.id;


--
-- Name: irpf_declarations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.irpf_declarations (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    year integer NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying,
    cpf character varying(14),
    full_name character varying(255),
    birth_date date,
    occupation character varying(100),
    total_income numeric(15,2) DEFAULT '0'::numeric,
    total_deductions numeric(15,2) DEFAULT '0'::numeric,
    total_tax_paid numeric(15,2) DEFAULT '0'::numeric,
    estimated_tax numeric(15,2) DEFAULT '0'::numeric,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.irpf_declarations OWNER TO postgres;

--
-- Name: irpf_declarations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.irpf_declarations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.irpf_declarations_id_seq OWNER TO postgres;

--
-- Name: irpf_declarations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.irpf_declarations_id_seq OWNED BY public.irpf_declarations.id;


--
-- Name: irpf_deductions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.irpf_deductions (
    id integer NOT NULL,
    declaration_id integer NOT NULL,
    type character varying(50) NOT NULL,
    description character varying(255) NOT NULL,
    beneficiary_name character varying(255),
    beneficiary_cpf_cnpj character varying(18),
    amount numeric(15,2) NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.irpf_deductions OWNER TO postgres;

--
-- Name: irpf_deductions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.irpf_deductions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.irpf_deductions_id_seq OWNER TO postgres;

--
-- Name: irpf_deductions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.irpf_deductions_id_seq OWNED BY public.irpf_deductions.id;


--
-- Name: irpf_dependents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.irpf_dependents (
    id integer NOT NULL,
    declaration_id integer NOT NULL,
    name character varying(255) NOT NULL,
    cpf character varying(14),
    birth_date date,
    relationship character varying(50),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.irpf_dependents OWNER TO postgres;

--
-- Name: irpf_dependents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.irpf_dependents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.irpf_dependents_id_seq OWNER TO postgres;

--
-- Name: irpf_dependents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.irpf_dependents_id_seq OWNED BY public.irpf_dependents.id;


--
-- Name: irpf_incomes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.irpf_incomes (
    id integer NOT NULL,
    declaration_id integer NOT NULL,
    type character varying(50) NOT NULL,
    source_name character varying(255) NOT NULL,
    source_cnpj character varying(18),
    gross_amount numeric(15,2) NOT NULL,
    tax_withheld numeric(15,2) DEFAULT '0'::numeric,
    inss_withheld numeric(15,2) DEFAULT '0'::numeric,
    thirteenth_salary numeric(15,2),
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.irpf_incomes OWNER TO postgres;

--
-- Name: irpf_incomes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.irpf_incomes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.irpf_incomes_id_seq OWNER TO postgres;

--
-- Name: irpf_incomes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.irpf_incomes_id_seq OWNED BY public.irpf_incomes.id;


--
-- Name: irpj_das_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.irpj_das_payments (
    id integer NOT NULL,
    summary_id integer NOT NULL,
    competence_month integer NOT NULL,
    competence_year integer NOT NULL,
    revenue_base numeric(15,2) NOT NULL,
    aliquot numeric(5,4),
    das_value numeric(15,2) NOT NULL,
    due_date date,
    payment_date date,
    is_paid boolean DEFAULT false,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.irpj_das_payments OWNER TO postgres;

--
-- Name: irpj_das_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.irpj_das_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.irpj_das_payments_id_seq OWNER TO postgres;

--
-- Name: irpj_das_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.irpj_das_payments_id_seq OWNED BY public.irpj_das_payments.id;


--
-- Name: irpj_summaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.irpj_summaries (
    id integer NOT NULL,
    year integer NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying,
    cnpj character varying(18),
    razao_social character varying(255),
    regime_tributario character varying(50),
    total_revenue numeric(15,2) DEFAULT '0'::numeric,
    total_expenses numeric(15,2) DEFAULT '0'::numeric,
    net_profit numeric(15,2) DEFAULT '0'::numeric,
    total_das numeric(15,2) DEFAULT '0'::numeric,
    total_prolabore numeric(15,2) DEFAULT '0'::numeric,
    total_dividends numeric(15,2) DEFAULT '0'::numeric,
    total_inss numeric(15,2) DEFAULT '0'::numeric,
    monthly_data jsonb,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.irpj_summaries OWNER TO postgres;

--
-- Name: irpj_summaries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.irpj_summaries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.irpj_summaries_id_seq OWNER TO postgres;

--
-- Name: irpj_summaries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.irpj_summaries_id_seq OWNED BY public.irpj_summaries.id;


--
-- Name: market_segments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.market_segments (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.market_segments OWNER TO postgres;

--
-- Name: market_segments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.market_segments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.market_segments_id_seq OWNER TO postgres;

--
-- Name: market_segments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.market_segments_id_seq OWNED BY public.market_segments.id;


--
-- Name: marketing_materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_materials (
    id integer NOT NULL,
    company_id integer,
    title character varying(255) NOT NULL,
    description text,
    segment character varying(100),
    type character varying(50),
    file_url text,
    is_public boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.marketing_materials OWNER TO postgres;

--
-- Name: marketing_materials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.marketing_materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.marketing_materials_id_seq OWNER TO postgres;

--
-- Name: marketing_materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.marketing_materials_id_seq OWNED BY public.marketing_materials.id;


--
-- Name: meeting_action_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meeting_action_items (
    id integer NOT NULL,
    meeting_record_id integer NOT NULL,
    description text NOT NULL,
    responsible character varying(255),
    responsible_user_id character varying,
    due_date timestamp without time zone,
    priority character varying(20) DEFAULT 'medium'::character varying,
    status character varying DEFAULT 'pending'::character varying,
    completed_at timestamp without time zone,
    notes text,
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    responsible_email character varying(255),
    linked_task_id integer
);


ALTER TABLE public.meeting_action_items OWNER TO postgres;

--
-- Name: meeting_action_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meeting_action_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meeting_action_items_id_seq OWNER TO postgres;

--
-- Name: meeting_action_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meeting_action_items_id_seq OWNED BY public.meeting_action_items.id;


--
-- Name: meeting_objectives; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meeting_objectives (
    id integer NOT NULL,
    company_id integer NOT NULL,
    label character varying(255) NOT NULL,
    is_custom boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.meeting_objectives OWNER TO postgres;

--
-- Name: meeting_objectives_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meeting_objectives_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meeting_objectives_id_seq OWNER TO postgres;

--
-- Name: meeting_objectives_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meeting_objectives_id_seq OWNED BY public.meeting_objectives.id;


--
-- Name: meeting_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meeting_records (
    id integer NOT NULL,
    company_id integer NOT NULL,
    client_id integer,
    user_id character varying,
    title character varying(255) NOT NULL,
    meeting_type character varying(50) DEFAULT 'client'::character varying,
    meeting_date timestamp without time zone NOT NULL,
    participants text,
    summary text,
    objectives text,
    decisions text,
    next_steps text,
    next_review_date timestamp without time zone,
    pipeline_stage character varying(50),
    status character varying DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    selected_objectives text,
    meeting_mode character varying(20) DEFAULT 'presencial'::character varying,
    meeting_location text
);


ALTER TABLE public.meeting_records OWNER TO postgres;

--
-- Name: meeting_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.meeting_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meeting_records_id_seq OWNER TO postgres;

--
-- Name: meeting_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.meeting_records_id_seq OWNED BY public.meeting_records.id;


--
-- Name: nfse_invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nfse_invoices (
    id integer NOT NULL,
    company_id integer,
    provider_id integer,
    client_id integer,
    rps_number character varying(20),
    rps_series character varying(10),
    rps_type character varying(5) DEFAULT '1'::character varying,
    nfse_number character varying(20),
    verification_code character varying(50),
    issue_date timestamp without time zone DEFAULT now(),
    competence_date timestamp without time zone,
    status character varying(20) DEFAULT 'pending'::character varying,
    service_description text NOT NULL,
    service_value numeric(15,2) NOT NULL,
    deduction_value numeric(15,2) DEFAULT '0'::numeric,
    iss_rate numeric(5,2),
    iss_value numeric(15,2),
    iss_retained boolean DEFAULT false,
    pis_value numeric(15,2),
    cofins_value numeric(15,2),
    ir_value numeric(15,2),
    csll_value numeric(15,2),
    inss_value numeric(15,2),
    total_value numeric(15,2),
    xml_content text,
    pdf_url text,
    xml_url text,
    api_response jsonb,
    error_message text,
    cancelled_at timestamp without time zone,
    cancellation_reason text,
    financial_record_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.nfse_invoices OWNER TO postgres;

--
-- Name: nfse_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nfse_invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nfse_invoices_id_seq OWNER TO postgres;

--
-- Name: nfse_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nfse_invoices_id_seq OWNED BY public.nfse_invoices.id;


--
-- Name: nfse_providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nfse_providers (
    id integer NOT NULL,
    company_id integer,
    city_code character varying(10) NOT NULL,
    city_name character varying(100) NOT NULL,
    state character varying(2) NOT NULL,
    provider_type character varying(50) NOT NULL,
    homologation_url character varying(500),
    production_url character varying(500),
    api_token text,
    api_provider character varying(50),
    inscricao_municipal character varying(20),
    codigo_tributacao character varying(20),
    item_lista_servico character varying(10),
    cnae character varying(10),
    certificate_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.nfse_providers OWNER TO postgres;

--
-- Name: nfse_providers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nfse_providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nfse_providers_id_seq OWNER TO postgres;

--
-- Name: nfse_providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nfse_providers_id_seq OWNED BY public.nfse_providers.id;


--
-- Name: operation_billing_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operation_billing_entries (
    id integer NOT NULL,
    company_id integer NOT NULL,
    operation_id integer NOT NULL,
    client_id integer NOT NULL,
    billing_date timestamp without time zone NOT NULL,
    amount numeric(15,2) NOT NULL,
    description character varying(255),
    invoice_number character varying(50),
    source character varying(50) DEFAULT 'manual'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.operation_billing_entries OWNER TO postgres;

--
-- Name: operation_billing_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operation_billing_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.operation_billing_entries_id_seq OWNER TO postgres;

--
-- Name: operation_billing_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operation_billing_entries_id_seq OWNED BY public.operation_billing_entries.id;


--
-- Name: operation_billing_goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operation_billing_goals (
    id integer NOT NULL,
    company_id integer NOT NULL,
    operation_id integer NOT NULL,
    goal_month character varying(7) NOT NULL,
    goal_amount numeric(15,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.operation_billing_goals OWNER TO postgres;

--
-- Name: operation_billing_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operation_billing_goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.operation_billing_goals_id_seq OWNER TO postgres;

--
-- Name: operation_billing_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operation_billing_goals_id_seq OWNED BY public.operation_billing_goals.id;


--
-- Name: permission_definitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission_definitions (
    id integer NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    module character varying(50) NOT NULL,
    category character varying(50),
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.permission_definitions OWNER TO postgres;

--
-- Name: permission_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permission_definitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permission_definitions_id_seq OWNER TO postgres;

--
-- Name: permission_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permission_definitions_id_seq OWNED BY public.permission_definitions.id;


--
-- Name: personal_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_accounts (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    name character varying(100) NOT NULL,
    bank_name character varying(100),
    account_type character varying(50),
    initial_balance numeric(15,2) DEFAULT '0'::numeric,
    current_balance numeric(15,2) DEFAULT '0'::numeric,
    color character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    agency character varying(20),
    account_number character varying(30),
    pix_key character varying(100),
    notes text,
    is_main boolean DEFAULT false
);


ALTER TABLE public.personal_accounts OWNER TO postgres;

--
-- Name: personal_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_accounts_id_seq OWNER TO postgres;

--
-- Name: personal_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_accounts_id_seq OWNED BY public.personal_accounts.id;


--
-- Name: personal_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_categories (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(20) NOT NULL,
    icon character varying(50),
    color character varying(20),
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.personal_categories OWNER TO postgres;

--
-- Name: personal_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_categories_id_seq OWNER TO postgres;

--
-- Name: personal_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_categories_id_seq OWNED BY public.personal_categories.id;


--
-- Name: personal_cost_centers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_cost_centers (
    id integer NOT NULL,
    owner_user_id character varying(100) NOT NULL,
    parent_id integer,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50),
    description text,
    budget numeric(15,2),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.personal_cost_centers OWNER TO postgres;

--
-- Name: personal_cost_centers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_cost_centers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_cost_centers_id_seq OWNER TO postgres;

--
-- Name: personal_cost_centers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_cost_centers_id_seq OWNED BY public.personal_cost_centers.id;


--
-- Name: personal_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_transactions (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    account_id integer NOT NULL,
    category_id integer,
    type character varying(20) NOT NULL,
    description character varying(255) NOT NULL,
    amount numeric(15,2) NOT NULL,
    date date NOT NULL,
    is_paid boolean DEFAULT true,
    is_recurring boolean DEFAULT false,
    recurring_type character varying(20),
    notes text,
    linked_to_mcg boolean DEFAULT false,
    mcg_record_id integer,
    mcg_record_type character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.personal_transactions OWNER TO postgres;

--
-- Name: personal_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_transactions_id_seq OWNER TO postgres;

--
-- Name: personal_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_transactions_id_seq OWNED BY public.personal_transactions.id;


--
-- Name: product_cost_structures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_cost_structures (
    id integer NOT NULL,
    company_id integer,
    product_name character varying(255) NOT NULL,
    product_type character varying(50),
    cost_components jsonb,
    fixed_costs numeric(15,2) DEFAULT '0'::numeric,
    variable_costs numeric(15,2) DEFAULT '0'::numeric,
    margin_target numeric(5,2),
    suggested_price numeric(15,2),
    current_price numeric(15,2),
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.product_cost_structures OWNER TO postgres;

--
-- Name: product_cost_structures_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_cost_structures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_cost_structures_id_seq OWNER TO postgres;

--
-- Name: product_cost_structures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_cost_structures_id_seq OWNED BY public.product_cost_structures.id;


--
-- Name: product_media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_media (
    id integer NOT NULL,
    product_id integer NOT NULL,
    media_type character varying(20) NOT NULL,
    url text NOT NULL,
    "position" integer DEFAULT 1 NOT NULL,
    alt_text character varying(255),
    file_size integer,
    mime_type character varying(100),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.product_media OWNER TO postgres;

--
-- Name: product_media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_media_id_seq OWNER TO postgres;

--
-- Name: product_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_media_id_seq OWNED BY public.product_media.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    company_id integer NOT NULL,
    client_id integer,
    name character varying(255) NOT NULL,
    description text,
    status character varying DEFAULT 'active'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    progress integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: proposal_routes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proposal_routes (
    id integer NOT NULL,
    proposal_id integer NOT NULL,
    origin_city character varying(100) NOT NULL,
    origin_state character varying(2) NOT NULL,
    destination_city character varying(100) NOT NULL,
    destination_state character varying(2) NOT NULL,
    distance_km numeric(10,2),
    product_type character varying(100),
    packaging_type character varying(100),
    weight numeric(10,2),
    cargo_value numeric(15,2),
    vehicle_axles integer DEFAULT 5,
    antt_min_freight numeric(15,2),
    freight_value numeric(15,2),
    toll_value numeric(15,2),
    toll_in_icms_base boolean DEFAULT true,
    icms_rate numeric(5,2),
    icms_value numeric(15,2),
    iss_rate numeric(5,2),
    iss_value numeric(15,2),
    gris_rate numeric(5,4),
    gris_value numeric(15,2),
    adv_rate numeric(5,4),
    adv_value numeric(15,2),
    unloading_value numeric(15,2),
    total_value numeric(15,2),
    operation_name character varying(255),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.proposal_routes OWNER TO postgres;

--
-- Name: proposal_routes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proposal_routes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proposal_routes_id_seq OWNER TO postgres;

--
-- Name: proposal_routes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proposal_routes_id_seq OWNED BY public.proposal_routes.id;


--
-- Name: rfis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rfis (
    id integer NOT NULL,
    company_id integer NOT NULL,
    razao_social character varying(255) NOT NULL,
    nome_fantasia character varying(255),
    cnpj character varying(18),
    endereco text,
    bairro character varying(100),
    cep character varying(10),
    cidade character varying(100),
    estado character varying(2),
    contato character varying(255),
    telefone character varying(20),
    email character varying,
    site character varying,
    ramo_atividade character varying(100),
    inicio_atividades character varying(10),
    faturamento_anual jsonb,
    unidades jsonb,
    fornecedores jsonb,
    concorrentes jsonb,
    principais_clientes jsonb,
    linha_produtos text,
    frequencia_coleta text,
    procedimentos_embarque text,
    cobertura_regional jsonb,
    detalhes_regionais jsonb,
    permite_terceirizacao boolean,
    tipos_veiculos jsonb,
    perfil_veiculos jsonb,
    disponibiliza_xml boolean,
    prazo_pagamento character varying(20),
    segmentos_atuacao jsonb,
    modais_atuacao jsonb,
    tipos_acondicionamento jsonb,
    tipos_operacao jsonb,
    frota jsonb,
    responsavel_preenchimento character varying(255),
    cargo_responsavel character varying(100),
    telefone_responsavel character varying(20),
    email_responsavel character varying,
    status character varying DEFAULT 'draft'::character varying,
    observacoes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.rfis OWNER TO postgres;

--
-- Name: rfis_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rfis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rfis_id_seq OWNER TO postgres;

--
-- Name: rfis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rfis_id_seq OWNED BY public.rfis.id;


--
-- Name: saved_routes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_routes (
    id integer NOT NULL,
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    origin_city character varying(100) NOT NULL,
    origin_state character varying(2) NOT NULL,
    destination_city character varying(100) NOT NULL,
    destination_state character varying(2) NOT NULL,
    distance_km numeric(10,2) NOT NULL,
    toll_2_axles numeric(10,2) DEFAULT '0'::numeric,
    toll_3_axles numeric(10,2) DEFAULT '0'::numeric,
    toll_4_axles numeric(10,2) DEFAULT '0'::numeric,
    toll_5_axles numeric(10,2) DEFAULT '0'::numeric,
    toll_6_axles numeric(10,2) DEFAULT '0'::numeric,
    toll_7_axles numeric(10,2) DEFAULT '0'::numeric,
    toll_9_axles numeric(10,2) DEFAULT '0'::numeric,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    toll_per_axle numeric(10,2) DEFAULT '0'::numeric,
    route_date timestamp without time zone,
    route_number integer,
    itinerary text
);


ALTER TABLE public.saved_routes OWNER TO postgres;

--
-- Name: saved_routes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.saved_routes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_routes_id_seq OWNER TO postgres;

--
-- Name: saved_routes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.saved_routes_id_seq OWNED BY public.saved_routes.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: storage_calculations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.storage_calculations (
    id integer NOT NULL,
    company_id integer NOT NULL,
    client_id integer,
    area numeric(10,2),
    period integer,
    product_type character varying(100),
    movement_rate numeric(10,2),
    storage_rate numeric(10,2),
    handling_value numeric(15,2),
    total_value numeric(15,2),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.storage_calculations OWNER TO postgres;

--
-- Name: storage_calculations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.storage_calculations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.storage_calculations_id_seq OWNER TO postgres;

--
-- Name: storage_calculations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.storage_calculations_id_seq OWNED BY public.storage_calculations.id;


--
-- Name: store_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    product_snapshot jsonb,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.store_order_items OWNER TO postgres;

--
-- Name: store_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.store_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.store_order_items_id_seq OWNER TO postgres;

--
-- Name: store_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.store_order_items_id_seq OWNED BY public.store_order_items.id;


--
-- Name: store_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_orders (
    id integer NOT NULL,
    order_number character varying(50) NOT NULL,
    company_id integer,
    user_id character varying,
    status character varying(50) DEFAULT 'pending'::character varying,
    subtotal numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) DEFAULT '0'::numeric,
    shipping_amount numeric(10,2) DEFAULT '0'::numeric,
    total_amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'BRL'::character varying,
    stripe_payment_intent_id character varying,
    stripe_checkout_session_id character varying,
    customer_email character varying(255),
    customer_name character varying(255),
    customer_phone character varying(20),
    shipping_address jsonb,
    is_gift boolean DEFAULT false,
    gift_recipient_name character varying(255),
    gift_note text,
    gift_acceptance_acknowledged boolean DEFAULT false,
    tracking_code character varying(100),
    tracking_url text,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.store_orders OWNER TO postgres;

--
-- Name: store_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.store_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.store_orders_id_seq OWNER TO postgres;

--
-- Name: store_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.store_orders_id_seq OWNED BY public.store_orders.id;


--
-- Name: store_product_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_product_categories (
    id integer NOT NULL,
    slug character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    code character varying(10)
);


ALTER TABLE public.store_product_categories OWNER TO postgres;

--
-- Name: store_product_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.store_product_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.store_product_categories_id_seq OWNER TO postgres;

--
-- Name: store_product_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.store_product_categories_id_seq OWNED BY public.store_product_categories.id;


--
-- Name: store_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.store_products (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    short_description text,
    long_description text,
    product_type character varying(50) NOT NULL,
    fulfillment_type character varying(50) DEFAULT 'physical'::character varying,
    price_amount numeric(10,2) NOT NULL,
    compare_at_price numeric(10,2),
    price_currency character varying(3) DEFAULT 'BRL'::character varying,
    inventory_qty integer,
    allow_backorder boolean DEFAULT false,
    sku character varying(100),
    stripe_product_id character varying,
    stripe_price_id character varying,
    primary_image_url text,
    gallery_urls jsonb,
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT false,
    seo_title character varying(255),
    seo_description text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    sizes text[]
);


ALTER TABLE public.store_products OWNER TO postgres;

--
-- Name: store_products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.store_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.store_products_id_seq OWNER TO postgres;

--
-- Name: store_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.store_products_id_seq OWNED BY public.store_products.id;


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_plans (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    price integer DEFAULT 0 NOT NULL,
    "interval" character varying(20) DEFAULT 'month'::character varying,
    base_users integer DEFAULT 1,
    additional_user_price integer DEFAULT 0,
    features text[] DEFAULT '{}'::text[],
    popular boolean DEFAULT false,
    active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.subscription_plans OWNER TO postgres;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscription_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscription_plans_id_seq OWNER TO postgres;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscription_plans_id_seq OWNED BY public.subscription_plans.id;


--
-- Name: support_ticket_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.support_ticket_messages (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    user_id character varying NOT NULL,
    message text NOT NULL,
    is_internal boolean DEFAULT false,
    attachments jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.support_ticket_messages OWNER TO postgres;

--
-- Name: support_ticket_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.support_ticket_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.support_ticket_messages_id_seq OWNER TO postgres;

--
-- Name: support_ticket_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.support_ticket_messages_id_seq OWNED BY public.support_ticket_messages.id;


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.support_tickets (
    id integer NOT NULL,
    company_id integer NOT NULL,
    user_id character varying NOT NULL,
    ticket_number character varying(20) NOT NULL,
    subject character varying(255) NOT NULL,
    description text,
    category character varying(50),
    priority character varying(20) DEFAULT 'medium'::character varying,
    status character varying(20) DEFAULT 'open'::character varying,
    assigned_to character varying,
    resolution text,
    resolved_at timestamp without time zone,
    closed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.support_tickets OWNER TO postgres;

--
-- Name: support_tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.support_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.support_tickets_id_seq OWNER TO postgres;

--
-- Name: support_tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.support_tickets_id_seq OWNED BY public.support_tickets.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    company_id integer NOT NULL,
    project_id integer,
    client_id integer,
    meeting_record_id integer,
    action_item_id integer,
    title character varying(255) NOT NULL,
    description text,
    assigned_to character varying,
    assigned_user_id character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    status character varying DEFAULT 'todo'::character varying,
    due_date timestamp without time zone,
    completed_at timestamp without time zone,
    estimated_hours numeric(5,2),
    actual_hours numeric(5,2),
    tags text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    assigned_email character varying(255),
    reminder_sent boolean DEFAULT false
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: user_role_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_role_assignments (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    company_id integer NOT NULL,
    role_id integer NOT NULL,
    assigned_by character varying,
    assigned_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_role_assignments OWNER TO postgres;

--
-- Name: user_role_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_role_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_role_assignments_id_seq OWNER TO postgres;

--
-- Name: user_role_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_role_assignments_id_seq OWNED BY public.user_role_assignments.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    company_id integer,
    role character varying DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    phone character varying(20),
    cnpj character varying(18),
    stripe_customer_id character varying,
    stripe_subscription_id character varying,
    subscription_status character varying DEFAULT 'free'::character varying,
    subscription_end_date timestamp without time zone,
    active_session_token character varying,
    lgpd_consent_at timestamp without time zone,
    cookie_consent_at timestamp without time zone,
    password character varying(255),
    free_calculations_remaining integer DEFAULT 3,
    total_calculations_used integer DEFAULT 0,
    last_calculation_at timestamp without time zone,
    razao_social character varying(255),
    tipo_empresa character varying(100),
    segmento character varying(100),
    departamento character varying(100),
    vendedor character varying(255),
    perfil_conta character varying(50) DEFAULT 'colaborador'::character varying,
    inscricao_estadual character varying(20),
    inscricao_estadual_isento boolean DEFAULT false,
    inscricao_municipal character varying(20),
    nome_fantasia character varying(255),
    password_reset_token character varying,
    password_reset_expiry timestamp without time zone,
    user_categories text[],
    segmentos text[],
    account_status character varying(20) DEFAULT 'pending'::character varying,
    account_status_reason text,
    approved_at timestamp without time zone,
    approved_by character varying,
    selected_plan character varying(50) DEFAULT 'free'::character varying,
    additional_users integer DEFAULT 0,
    full_access_granted boolean DEFAULT false,
    full_access_granted_at timestamp without time zone,
    full_access_granted_by character varying,
    is_active boolean DEFAULT true,
    deactivated_at timestamp without time zone,
    deactivated_by character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: whatsapp_agents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whatsapp_agents (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    is_available boolean DEFAULT true,
    max_concurrent_chats integer DEFAULT 5,
    current_chat_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.whatsapp_agents OWNER TO postgres;

--
-- Name: whatsapp_agents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.whatsapp_agents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.whatsapp_agents_id_seq OWNER TO postgres;

--
-- Name: whatsapp_agents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.whatsapp_agents_id_seq OWNED BY public.whatsapp_agents.id;


--
-- Name: whatsapp_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whatsapp_config (
    id integer NOT NULL,
    phone_number character varying(20) NOT NULL,
    business_name character varying(255),
    provider character varying(50) DEFAULT 'aisensy'::character varying,
    api_key character varying(500),
    webhook_url character varying(500),
    welcome_message text,
    business_hours_start character varying(5),
    business_hours_end character varying(5),
    outside_hours_message text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.whatsapp_config OWNER TO postgres;

--
-- Name: whatsapp_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.whatsapp_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.whatsapp_config_id_seq OWNER TO postgres;

--
-- Name: whatsapp_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.whatsapp_config_id_seq OWNED BY public.whatsapp_config.id;


--
-- Name: whatsapp_conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whatsapp_conversations (
    id integer NOT NULL,
    customer_phone character varying(20) NOT NULL,
    customer_name character varying(255),
    current_step_id integer,
    status character varying(50) DEFAULT 'active'::character varying,
    assigned_agent_id character varying(36),
    last_message_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.whatsapp_conversations OWNER TO postgres;

--
-- Name: whatsapp_conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.whatsapp_conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.whatsapp_conversations_id_seq OWNER TO postgres;

--
-- Name: whatsapp_conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.whatsapp_conversations_id_seq OWNED BY public.whatsapp_conversations.id;


--
-- Name: whatsapp_journey_steps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whatsapp_journey_steps (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    step_type character varying(50) NOT NULL,
    parent_id integer,
    "order" integer DEFAULT 0,
    trigger_keywords text[],
    message_template text,
    button_options jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.whatsapp_journey_steps OWNER TO postgres;

--
-- Name: whatsapp_journey_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.whatsapp_journey_steps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.whatsapp_journey_steps_id_seq OWNER TO postgres;

--
-- Name: whatsapp_journey_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.whatsapp_journey_steps_id_seq OWNED BY public.whatsapp_journey_steps.id;


--
-- Name: whatsapp_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.whatsapp_messages (
    id integer NOT NULL,
    conversation_id integer NOT NULL,
    direction character varying(10) NOT NULL,
    message_type character varying(20) DEFAULT 'text'::character varying,
    content text,
    media_url text,
    sender_type character varying(20),
    agent_id character varying(36),
    status character varying(20) DEFAULT 'sent'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.whatsapp_messages OWNER TO postgres;

--
-- Name: whatsapp_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.whatsapp_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.whatsapp_messages_id_seq OWNER TO postgres;

--
-- Name: whatsapp_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.whatsapp_messages_id_seq OWNED BY public.whatsapp_messages.id;


--
-- Name: _managed_webhooks; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe._managed_webhooks (
    id text NOT NULL,
    object text,
    url text NOT NULL,
    enabled_events jsonb NOT NULL,
    description text,
    enabled boolean,
    livemode boolean,
    metadata jsonb,
    secret text NOT NULL,
    status text,
    api_version text,
    created integer,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_synced_at timestamp with time zone,
    account_id text NOT NULL
);


ALTER TABLE stripe._managed_webhooks OWNER TO postgres;

--
-- Name: _migrations; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe._migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE stripe._migrations OWNER TO postgres;

--
-- Name: _sync_status; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe._sync_status (
    id integer NOT NULL,
    resource text NOT NULL,
    status text DEFAULT 'idle'::text,
    last_synced_at timestamp with time zone DEFAULT now(),
    last_incremental_cursor timestamp with time zone,
    error_message text,
    updated_at timestamp with time zone DEFAULT now(),
    account_id text NOT NULL,
    CONSTRAINT _sync_status_status_check CHECK ((status = ANY (ARRAY['idle'::text, 'running'::text, 'complete'::text, 'error'::text])))
);


ALTER TABLE stripe._sync_status OWNER TO postgres;

--
-- Name: _sync_status_id_seq; Type: SEQUENCE; Schema: stripe; Owner: postgres
--

CREATE SEQUENCE stripe._sync_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE stripe._sync_status_id_seq OWNER TO postgres;

--
-- Name: _sync_status_id_seq; Type: SEQUENCE OWNED BY; Schema: stripe; Owner: postgres
--

ALTER SEQUENCE stripe._sync_status_id_seq OWNED BY stripe._sync_status.id;


--
-- Name: accounts; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.accounts (
    _raw_data jsonb NOT NULL,
    first_synced_at timestamp with time zone DEFAULT now() NOT NULL,
    _last_synced_at timestamp with time zone DEFAULT now() NOT NULL,
    _updated_at timestamp with time zone DEFAULT now() NOT NULL,
    business_name text GENERATED ALWAYS AS (((_raw_data -> 'business_profile'::text) ->> 'name'::text)) STORED,
    email text GENERATED ALWAYS AS ((_raw_data ->> 'email'::text)) STORED,
    type text GENERATED ALWAYS AS ((_raw_data ->> 'type'::text)) STORED,
    charges_enabled boolean GENERATED ALWAYS AS (((_raw_data ->> 'charges_enabled'::text))::boolean) STORED,
    payouts_enabled boolean GENERATED ALWAYS AS (((_raw_data ->> 'payouts_enabled'::text))::boolean) STORED,
    details_submitted boolean GENERATED ALWAYS AS (((_raw_data ->> 'details_submitted'::text))::boolean) STORED,
    country text GENERATED ALWAYS AS ((_raw_data ->> 'country'::text)) STORED,
    default_currency text GENERATED ALWAYS AS ((_raw_data ->> 'default_currency'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    api_key_hashes text[] DEFAULT '{}'::text[],
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.accounts OWNER TO postgres;

--
-- Name: active_entitlements; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.active_entitlements (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    feature text GENERATED ALWAYS AS ((_raw_data ->> 'feature'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    lookup_key text GENERATED ALWAYS AS ((_raw_data ->> 'lookup_key'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.active_entitlements OWNER TO postgres;

--
-- Name: charges; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.charges (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    paid boolean GENERATED ALWAYS AS (((_raw_data ->> 'paid'::text))::boolean) STORED,
    "order" text GENERATED ALWAYS AS ((_raw_data ->> 'order'::text)) STORED,
    amount bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount'::text))::bigint) STORED,
    review text GENERATED ALWAYS AS ((_raw_data ->> 'review'::text)) STORED,
    source jsonb GENERATED ALWAYS AS ((_raw_data -> 'source'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    dispute text GENERATED ALWAYS AS ((_raw_data ->> 'dispute'::text)) STORED,
    invoice text GENERATED ALWAYS AS ((_raw_data ->> 'invoice'::text)) STORED,
    outcome jsonb GENERATED ALWAYS AS ((_raw_data -> 'outcome'::text)) STORED,
    refunds jsonb GENERATED ALWAYS AS ((_raw_data -> 'refunds'::text)) STORED,
    updated integer GENERATED ALWAYS AS (((_raw_data ->> 'updated'::text))::integer) STORED,
    captured boolean GENERATED ALWAYS AS (((_raw_data ->> 'captured'::text))::boolean) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    refunded boolean GENERATED ALWAYS AS (((_raw_data ->> 'refunded'::text))::boolean) STORED,
    shipping jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping'::text)) STORED,
    application text GENERATED ALWAYS AS ((_raw_data ->> 'application'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    destination text GENERATED ALWAYS AS ((_raw_data ->> 'destination'::text)) STORED,
    failure_code text GENERATED ALWAYS AS ((_raw_data ->> 'failure_code'::text)) STORED,
    on_behalf_of text GENERATED ALWAYS AS ((_raw_data ->> 'on_behalf_of'::text)) STORED,
    fraud_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'fraud_details'::text)) STORED,
    receipt_email text GENERATED ALWAYS AS ((_raw_data ->> 'receipt_email'::text)) STORED,
    payment_intent text GENERATED ALWAYS AS ((_raw_data ->> 'payment_intent'::text)) STORED,
    receipt_number text GENERATED ALWAYS AS ((_raw_data ->> 'receipt_number'::text)) STORED,
    transfer_group text GENERATED ALWAYS AS ((_raw_data ->> 'transfer_group'::text)) STORED,
    amount_refunded bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount_refunded'::text))::bigint) STORED,
    application_fee text GENERATED ALWAYS AS ((_raw_data ->> 'application_fee'::text)) STORED,
    failure_message text GENERATED ALWAYS AS ((_raw_data ->> 'failure_message'::text)) STORED,
    source_transfer text GENERATED ALWAYS AS ((_raw_data ->> 'source_transfer'::text)) STORED,
    balance_transaction text GENERATED ALWAYS AS ((_raw_data ->> 'balance_transaction'::text)) STORED,
    statement_descriptor text GENERATED ALWAYS AS ((_raw_data ->> 'statement_descriptor'::text)) STORED,
    payment_method_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'payment_method_details'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.charges OWNER TO postgres;

--
-- Name: checkout_session_line_items; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.checkout_session_line_items (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    amount_discount integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_discount'::text))::integer) STORED,
    amount_subtotal integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_subtotal'::text))::integer) STORED,
    amount_tax integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_tax'::text))::integer) STORED,
    amount_total integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_total'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    price text GENERATED ALWAYS AS ((_raw_data ->> 'price'::text)) STORED,
    quantity integer GENERATED ALWAYS AS (((_raw_data ->> 'quantity'::text))::integer) STORED,
    checkout_session text GENERATED ALWAYS AS ((_raw_data ->> 'checkout_session'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.checkout_session_line_items OWNER TO postgres;

--
-- Name: checkout_sessions; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.checkout_sessions (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    adaptive_pricing jsonb GENERATED ALWAYS AS ((_raw_data -> 'adaptive_pricing'::text)) STORED,
    after_expiration jsonb GENERATED ALWAYS AS ((_raw_data -> 'after_expiration'::text)) STORED,
    allow_promotion_codes boolean GENERATED ALWAYS AS (((_raw_data ->> 'allow_promotion_codes'::text))::boolean) STORED,
    amount_subtotal integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_subtotal'::text))::integer) STORED,
    amount_total integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_total'::text))::integer) STORED,
    automatic_tax jsonb GENERATED ALWAYS AS ((_raw_data -> 'automatic_tax'::text)) STORED,
    billing_address_collection text GENERATED ALWAYS AS ((_raw_data ->> 'billing_address_collection'::text)) STORED,
    cancel_url text GENERATED ALWAYS AS ((_raw_data ->> 'cancel_url'::text)) STORED,
    client_reference_id text GENERATED ALWAYS AS ((_raw_data ->> 'client_reference_id'::text)) STORED,
    client_secret text GENERATED ALWAYS AS ((_raw_data ->> 'client_secret'::text)) STORED,
    collected_information jsonb GENERATED ALWAYS AS ((_raw_data -> 'collected_information'::text)) STORED,
    consent jsonb GENERATED ALWAYS AS ((_raw_data -> 'consent'::text)) STORED,
    consent_collection jsonb GENERATED ALWAYS AS ((_raw_data -> 'consent_collection'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    currency_conversion jsonb GENERATED ALWAYS AS ((_raw_data -> 'currency_conversion'::text)) STORED,
    custom_fields jsonb GENERATED ALWAYS AS ((_raw_data -> 'custom_fields'::text)) STORED,
    custom_text jsonb GENERATED ALWAYS AS ((_raw_data -> 'custom_text'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    customer_creation text GENERATED ALWAYS AS ((_raw_data ->> 'customer_creation'::text)) STORED,
    customer_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'customer_details'::text)) STORED,
    customer_email text GENERATED ALWAYS AS ((_raw_data ->> 'customer_email'::text)) STORED,
    discounts jsonb GENERATED ALWAYS AS ((_raw_data -> 'discounts'::text)) STORED,
    expires_at integer GENERATED ALWAYS AS (((_raw_data ->> 'expires_at'::text))::integer) STORED,
    invoice text GENERATED ALWAYS AS ((_raw_data ->> 'invoice'::text)) STORED,
    invoice_creation jsonb GENERATED ALWAYS AS ((_raw_data -> 'invoice_creation'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    locale text GENERATED ALWAYS AS ((_raw_data ->> 'locale'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    mode text GENERATED ALWAYS AS ((_raw_data ->> 'mode'::text)) STORED,
    optional_items jsonb GENERATED ALWAYS AS ((_raw_data -> 'optional_items'::text)) STORED,
    payment_intent text GENERATED ALWAYS AS ((_raw_data ->> 'payment_intent'::text)) STORED,
    payment_link text GENERATED ALWAYS AS ((_raw_data ->> 'payment_link'::text)) STORED,
    payment_method_collection text GENERATED ALWAYS AS ((_raw_data ->> 'payment_method_collection'::text)) STORED,
    payment_method_configuration_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'payment_method_configuration_details'::text)) STORED,
    payment_method_options jsonb GENERATED ALWAYS AS ((_raw_data -> 'payment_method_options'::text)) STORED,
    payment_method_types jsonb GENERATED ALWAYS AS ((_raw_data -> 'payment_method_types'::text)) STORED,
    payment_status text GENERATED ALWAYS AS ((_raw_data ->> 'payment_status'::text)) STORED,
    permissions jsonb GENERATED ALWAYS AS ((_raw_data -> 'permissions'::text)) STORED,
    phone_number_collection jsonb GENERATED ALWAYS AS ((_raw_data -> 'phone_number_collection'::text)) STORED,
    presentment_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'presentment_details'::text)) STORED,
    recovered_from text GENERATED ALWAYS AS ((_raw_data ->> 'recovered_from'::text)) STORED,
    redirect_on_completion text GENERATED ALWAYS AS ((_raw_data ->> 'redirect_on_completion'::text)) STORED,
    return_url text GENERATED ALWAYS AS ((_raw_data ->> 'return_url'::text)) STORED,
    saved_payment_method_options jsonb GENERATED ALWAYS AS ((_raw_data -> 'saved_payment_method_options'::text)) STORED,
    setup_intent text GENERATED ALWAYS AS ((_raw_data ->> 'setup_intent'::text)) STORED,
    shipping_address_collection jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping_address_collection'::text)) STORED,
    shipping_cost jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping_cost'::text)) STORED,
    shipping_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping_details'::text)) STORED,
    shipping_options jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping_options'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    submit_type text GENERATED ALWAYS AS ((_raw_data ->> 'submit_type'::text)) STORED,
    subscription text GENERATED ALWAYS AS ((_raw_data ->> 'subscription'::text)) STORED,
    success_url text GENERATED ALWAYS AS ((_raw_data ->> 'success_url'::text)) STORED,
    tax_id_collection jsonb GENERATED ALWAYS AS ((_raw_data -> 'tax_id_collection'::text)) STORED,
    total_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'total_details'::text)) STORED,
    ui_mode text GENERATED ALWAYS AS ((_raw_data ->> 'ui_mode'::text)) STORED,
    url text GENERATED ALWAYS AS ((_raw_data ->> 'url'::text)) STORED,
    wallet_options jsonb GENERATED ALWAYS AS ((_raw_data -> 'wallet_options'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.checkout_sessions OWNER TO postgres;

--
-- Name: coupons; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.coupons (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    name text GENERATED ALWAYS AS ((_raw_data ->> 'name'::text)) STORED,
    valid boolean GENERATED ALWAYS AS (((_raw_data ->> 'valid'::text))::boolean) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    updated integer GENERATED ALWAYS AS (((_raw_data ->> 'updated'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    duration text GENERATED ALWAYS AS ((_raw_data ->> 'duration'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    redeem_by integer GENERATED ALWAYS AS (((_raw_data ->> 'redeem_by'::text))::integer) STORED,
    amount_off bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount_off'::text))::bigint) STORED,
    percent_off double precision GENERATED ALWAYS AS (((_raw_data ->> 'percent_off'::text))::double precision) STORED,
    times_redeemed bigint GENERATED ALWAYS AS (((_raw_data ->> 'times_redeemed'::text))::bigint) STORED,
    max_redemptions bigint GENERATED ALWAYS AS (((_raw_data ->> 'max_redemptions'::text))::bigint) STORED,
    duration_in_months bigint GENERATED ALWAYS AS (((_raw_data ->> 'duration_in_months'::text))::bigint) STORED,
    percent_off_precise double precision GENERATED ALWAYS AS (((_raw_data ->> 'percent_off_precise'::text))::double precision) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.coupons OWNER TO postgres;

--
-- Name: credit_notes; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.credit_notes (
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    amount integer GENERATED ALWAYS AS (((_raw_data ->> 'amount'::text))::integer) STORED,
    amount_shipping integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_shipping'::text))::integer) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    customer_balance_transaction text GENERATED ALWAYS AS ((_raw_data ->> 'customer_balance_transaction'::text)) STORED,
    discount_amount integer GENERATED ALWAYS AS (((_raw_data ->> 'discount_amount'::text))::integer) STORED,
    discount_amounts jsonb GENERATED ALWAYS AS ((_raw_data -> 'discount_amounts'::text)) STORED,
    invoice text GENERATED ALWAYS AS ((_raw_data ->> 'invoice'::text)) STORED,
    lines jsonb GENERATED ALWAYS AS ((_raw_data -> 'lines'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    memo text GENERATED ALWAYS AS ((_raw_data ->> 'memo'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    number text GENERATED ALWAYS AS ((_raw_data ->> 'number'::text)) STORED,
    out_of_band_amount integer GENERATED ALWAYS AS (((_raw_data ->> 'out_of_band_amount'::text))::integer) STORED,
    pdf text GENERATED ALWAYS AS ((_raw_data ->> 'pdf'::text)) STORED,
    reason text GENERATED ALWAYS AS ((_raw_data ->> 'reason'::text)) STORED,
    refund text GENERATED ALWAYS AS ((_raw_data ->> 'refund'::text)) STORED,
    shipping_cost jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping_cost'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    subtotal integer GENERATED ALWAYS AS (((_raw_data ->> 'subtotal'::text))::integer) STORED,
    subtotal_excluding_tax integer GENERATED ALWAYS AS (((_raw_data ->> 'subtotal_excluding_tax'::text))::integer) STORED,
    tax_amounts jsonb GENERATED ALWAYS AS ((_raw_data -> 'tax_amounts'::text)) STORED,
    total integer GENERATED ALWAYS AS (((_raw_data ->> 'total'::text))::integer) STORED,
    total_excluding_tax integer GENERATED ALWAYS AS (((_raw_data ->> 'total_excluding_tax'::text))::integer) STORED,
    type text GENERATED ALWAYS AS ((_raw_data ->> 'type'::text)) STORED,
    voided_at text GENERATED ALWAYS AS ((_raw_data ->> 'voided_at'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.credit_notes OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.customers (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    address jsonb GENERATED ALWAYS AS ((_raw_data -> 'address'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    email text GENERATED ALWAYS AS ((_raw_data ->> 'email'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    name text GENERATED ALWAYS AS ((_raw_data ->> 'name'::text)) STORED,
    phone text GENERATED ALWAYS AS ((_raw_data ->> 'phone'::text)) STORED,
    shipping jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping'::text)) STORED,
    balance integer GENERATED ALWAYS AS (((_raw_data ->> 'balance'::text))::integer) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    default_source text GENERATED ALWAYS AS ((_raw_data ->> 'default_source'::text)) STORED,
    delinquent boolean GENERATED ALWAYS AS (((_raw_data ->> 'delinquent'::text))::boolean) STORED,
    discount jsonb GENERATED ALWAYS AS ((_raw_data -> 'discount'::text)) STORED,
    invoice_prefix text GENERATED ALWAYS AS ((_raw_data ->> 'invoice_prefix'::text)) STORED,
    invoice_settings jsonb GENERATED ALWAYS AS ((_raw_data -> 'invoice_settings'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    next_invoice_sequence integer GENERATED ALWAYS AS (((_raw_data ->> 'next_invoice_sequence'::text))::integer) STORED,
    preferred_locales jsonb GENERATED ALWAYS AS ((_raw_data -> 'preferred_locales'::text)) STORED,
    tax_exempt text GENERATED ALWAYS AS ((_raw_data ->> 'tax_exempt'::text)) STORED,
    deleted boolean GENERATED ALWAYS AS (((_raw_data ->> 'deleted'::text))::boolean) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.customers OWNER TO postgres;

--
-- Name: disputes; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.disputes (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    amount bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount'::text))::bigint) STORED,
    charge text GENERATED ALWAYS AS ((_raw_data ->> 'charge'::text)) STORED,
    reason text GENERATED ALWAYS AS ((_raw_data ->> 'reason'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    updated integer GENERATED ALWAYS AS (((_raw_data ->> 'updated'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    evidence jsonb GENERATED ALWAYS AS ((_raw_data -> 'evidence'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    evidence_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'evidence_details'::text)) STORED,
    balance_transactions jsonb GENERATED ALWAYS AS ((_raw_data -> 'balance_transactions'::text)) STORED,
    is_charge_refundable boolean GENERATED ALWAYS AS (((_raw_data ->> 'is_charge_refundable'::text))::boolean) STORED,
    payment_intent text GENERATED ALWAYS AS ((_raw_data ->> 'payment_intent'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.disputes OWNER TO postgres;

--
-- Name: early_fraud_warnings; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.early_fraud_warnings (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    actionable boolean GENERATED ALWAYS AS (((_raw_data ->> 'actionable'::text))::boolean) STORED,
    charge text GENERATED ALWAYS AS ((_raw_data ->> 'charge'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    fraud_type text GENERATED ALWAYS AS ((_raw_data ->> 'fraud_type'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    payment_intent text GENERATED ALWAYS AS ((_raw_data ->> 'payment_intent'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.early_fraud_warnings OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.events (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    data jsonb GENERATED ALWAYS AS ((_raw_data -> 'data'::text)) STORED,
    type text GENERATED ALWAYS AS ((_raw_data ->> 'type'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    request text GENERATED ALWAYS AS ((_raw_data ->> 'request'::text)) STORED,
    updated integer GENERATED ALWAYS AS (((_raw_data ->> 'updated'::text))::integer) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    api_version text GENERATED ALWAYS AS ((_raw_data ->> 'api_version'::text)) STORED,
    pending_webhooks bigint GENERATED ALWAYS AS (((_raw_data ->> 'pending_webhooks'::text))::bigint) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.events OWNER TO postgres;

--
-- Name: features; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.features (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    name text GENERATED ALWAYS AS ((_raw_data ->> 'name'::text)) STORED,
    lookup_key text GENERATED ALWAYS AS ((_raw_data ->> 'lookup_key'::text)) STORED,
    active boolean GENERATED ALWAYS AS (((_raw_data ->> 'active'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.features OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.invoices (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    auto_advance boolean GENERATED ALWAYS AS (((_raw_data ->> 'auto_advance'::text))::boolean) STORED,
    collection_method text GENERATED ALWAYS AS ((_raw_data ->> 'collection_method'::text)) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    hosted_invoice_url text GENERATED ALWAYS AS ((_raw_data ->> 'hosted_invoice_url'::text)) STORED,
    lines jsonb GENERATED ALWAYS AS ((_raw_data -> 'lines'::text)) STORED,
    period_end integer GENERATED ALWAYS AS (((_raw_data ->> 'period_end'::text))::integer) STORED,
    period_start integer GENERATED ALWAYS AS (((_raw_data ->> 'period_start'::text))::integer) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    total bigint GENERATED ALWAYS AS (((_raw_data ->> 'total'::text))::bigint) STORED,
    account_country text GENERATED ALWAYS AS ((_raw_data ->> 'account_country'::text)) STORED,
    account_name text GENERATED ALWAYS AS ((_raw_data ->> 'account_name'::text)) STORED,
    account_tax_ids jsonb GENERATED ALWAYS AS ((_raw_data -> 'account_tax_ids'::text)) STORED,
    amount_due bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount_due'::text))::bigint) STORED,
    amount_paid bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount_paid'::text))::bigint) STORED,
    amount_remaining bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount_remaining'::text))::bigint) STORED,
    application_fee_amount bigint GENERATED ALWAYS AS (((_raw_data ->> 'application_fee_amount'::text))::bigint) STORED,
    attempt_count integer GENERATED ALWAYS AS (((_raw_data ->> 'attempt_count'::text))::integer) STORED,
    attempted boolean GENERATED ALWAYS AS (((_raw_data ->> 'attempted'::text))::boolean) STORED,
    billing_reason text GENERATED ALWAYS AS ((_raw_data ->> 'billing_reason'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    custom_fields jsonb GENERATED ALWAYS AS ((_raw_data -> 'custom_fields'::text)) STORED,
    customer_address jsonb GENERATED ALWAYS AS ((_raw_data -> 'customer_address'::text)) STORED,
    customer_email text GENERATED ALWAYS AS ((_raw_data ->> 'customer_email'::text)) STORED,
    customer_name text GENERATED ALWAYS AS ((_raw_data ->> 'customer_name'::text)) STORED,
    customer_phone text GENERATED ALWAYS AS ((_raw_data ->> 'customer_phone'::text)) STORED,
    customer_shipping jsonb GENERATED ALWAYS AS ((_raw_data -> 'customer_shipping'::text)) STORED,
    customer_tax_exempt text GENERATED ALWAYS AS ((_raw_data ->> 'customer_tax_exempt'::text)) STORED,
    customer_tax_ids jsonb GENERATED ALWAYS AS ((_raw_data -> 'customer_tax_ids'::text)) STORED,
    default_tax_rates jsonb GENERATED ALWAYS AS ((_raw_data -> 'default_tax_rates'::text)) STORED,
    discount jsonb GENERATED ALWAYS AS ((_raw_data -> 'discount'::text)) STORED,
    discounts jsonb GENERATED ALWAYS AS ((_raw_data -> 'discounts'::text)) STORED,
    due_date integer GENERATED ALWAYS AS (((_raw_data ->> 'due_date'::text))::integer) STORED,
    ending_balance integer GENERATED ALWAYS AS (((_raw_data ->> 'ending_balance'::text))::integer) STORED,
    footer text GENERATED ALWAYS AS ((_raw_data ->> 'footer'::text)) STORED,
    invoice_pdf text GENERATED ALWAYS AS ((_raw_data ->> 'invoice_pdf'::text)) STORED,
    last_finalization_error jsonb GENERATED ALWAYS AS ((_raw_data -> 'last_finalization_error'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    next_payment_attempt integer GENERATED ALWAYS AS (((_raw_data ->> 'next_payment_attempt'::text))::integer) STORED,
    number text GENERATED ALWAYS AS ((_raw_data ->> 'number'::text)) STORED,
    paid boolean GENERATED ALWAYS AS (((_raw_data ->> 'paid'::text))::boolean) STORED,
    payment_settings jsonb GENERATED ALWAYS AS ((_raw_data -> 'payment_settings'::text)) STORED,
    post_payment_credit_notes_amount integer GENERATED ALWAYS AS (((_raw_data ->> 'post_payment_credit_notes_amount'::text))::integer) STORED,
    pre_payment_credit_notes_amount integer GENERATED ALWAYS AS (((_raw_data ->> 'pre_payment_credit_notes_amount'::text))::integer) STORED,
    receipt_number text GENERATED ALWAYS AS ((_raw_data ->> 'receipt_number'::text)) STORED,
    starting_balance integer GENERATED ALWAYS AS (((_raw_data ->> 'starting_balance'::text))::integer) STORED,
    statement_descriptor text GENERATED ALWAYS AS ((_raw_data ->> 'statement_descriptor'::text)) STORED,
    status_transitions jsonb GENERATED ALWAYS AS ((_raw_data -> 'status_transitions'::text)) STORED,
    subtotal integer GENERATED ALWAYS AS (((_raw_data ->> 'subtotal'::text))::integer) STORED,
    tax integer GENERATED ALWAYS AS (((_raw_data ->> 'tax'::text))::integer) STORED,
    total_discount_amounts jsonb GENERATED ALWAYS AS ((_raw_data -> 'total_discount_amounts'::text)) STORED,
    total_tax_amounts jsonb GENERATED ALWAYS AS ((_raw_data -> 'total_tax_amounts'::text)) STORED,
    transfer_data jsonb GENERATED ALWAYS AS ((_raw_data -> 'transfer_data'::text)) STORED,
    webhooks_delivered_at integer GENERATED ALWAYS AS (((_raw_data ->> 'webhooks_delivered_at'::text))::integer) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    subscription text GENERATED ALWAYS AS ((_raw_data ->> 'subscription'::text)) STORED,
    payment_intent text GENERATED ALWAYS AS ((_raw_data ->> 'payment_intent'::text)) STORED,
    default_payment_method text GENERATED ALWAYS AS ((_raw_data ->> 'default_payment_method'::text)) STORED,
    default_source text GENERATED ALWAYS AS ((_raw_data ->> 'default_source'::text)) STORED,
    on_behalf_of text GENERATED ALWAYS AS ((_raw_data ->> 'on_behalf_of'::text)) STORED,
    charge text GENERATED ALWAYS AS ((_raw_data ->> 'charge'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.invoices OWNER TO postgres;

--
-- Name: payment_intents; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.payment_intents (
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    amount integer GENERATED ALWAYS AS (((_raw_data ->> 'amount'::text))::integer) STORED,
    amount_capturable integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_capturable'::text))::integer) STORED,
    amount_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'amount_details'::text)) STORED,
    amount_received integer GENERATED ALWAYS AS (((_raw_data ->> 'amount_received'::text))::integer) STORED,
    application text GENERATED ALWAYS AS ((_raw_data ->> 'application'::text)) STORED,
    application_fee_amount integer GENERATED ALWAYS AS (((_raw_data ->> 'application_fee_amount'::text))::integer) STORED,
    automatic_payment_methods text GENERATED ALWAYS AS ((_raw_data ->> 'automatic_payment_methods'::text)) STORED,
    canceled_at integer GENERATED ALWAYS AS (((_raw_data ->> 'canceled_at'::text))::integer) STORED,
    cancellation_reason text GENERATED ALWAYS AS ((_raw_data ->> 'cancellation_reason'::text)) STORED,
    capture_method text GENERATED ALWAYS AS ((_raw_data ->> 'capture_method'::text)) STORED,
    client_secret text GENERATED ALWAYS AS ((_raw_data ->> 'client_secret'::text)) STORED,
    confirmation_method text GENERATED ALWAYS AS ((_raw_data ->> 'confirmation_method'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    invoice text GENERATED ALWAYS AS ((_raw_data ->> 'invoice'::text)) STORED,
    last_payment_error text GENERATED ALWAYS AS ((_raw_data ->> 'last_payment_error'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    next_action text GENERATED ALWAYS AS ((_raw_data ->> 'next_action'::text)) STORED,
    on_behalf_of text GENERATED ALWAYS AS ((_raw_data ->> 'on_behalf_of'::text)) STORED,
    payment_method text GENERATED ALWAYS AS ((_raw_data ->> 'payment_method'::text)) STORED,
    payment_method_options jsonb GENERATED ALWAYS AS ((_raw_data -> 'payment_method_options'::text)) STORED,
    payment_method_types jsonb GENERATED ALWAYS AS ((_raw_data -> 'payment_method_types'::text)) STORED,
    processing text GENERATED ALWAYS AS ((_raw_data ->> 'processing'::text)) STORED,
    receipt_email text GENERATED ALWAYS AS ((_raw_data ->> 'receipt_email'::text)) STORED,
    review text GENERATED ALWAYS AS ((_raw_data ->> 'review'::text)) STORED,
    setup_future_usage text GENERATED ALWAYS AS ((_raw_data ->> 'setup_future_usage'::text)) STORED,
    shipping jsonb GENERATED ALWAYS AS ((_raw_data -> 'shipping'::text)) STORED,
    statement_descriptor text GENERATED ALWAYS AS ((_raw_data ->> 'statement_descriptor'::text)) STORED,
    statement_descriptor_suffix text GENERATED ALWAYS AS ((_raw_data ->> 'statement_descriptor_suffix'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    transfer_data jsonb GENERATED ALWAYS AS ((_raw_data -> 'transfer_data'::text)) STORED,
    transfer_group text GENERATED ALWAYS AS ((_raw_data ->> 'transfer_group'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.payment_intents OWNER TO postgres;

--
-- Name: payment_methods; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.payment_methods (
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    type text GENERATED ALWAYS AS ((_raw_data ->> 'type'::text)) STORED,
    billing_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'billing_details'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    card jsonb GENERATED ALWAYS AS ((_raw_data -> 'card'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.payment_methods OWNER TO postgres;

--
-- Name: payouts; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.payouts (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    date text GENERATED ALWAYS AS ((_raw_data ->> 'date'::text)) STORED,
    type text GENERATED ALWAYS AS ((_raw_data ->> 'type'::text)) STORED,
    amount bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount'::text))::bigint) STORED,
    method text GENERATED ALWAYS AS ((_raw_data ->> 'method'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    updated integer GENERATED ALWAYS AS (((_raw_data ->> 'updated'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    automatic boolean GENERATED ALWAYS AS (((_raw_data ->> 'automatic'::text))::boolean) STORED,
    recipient text GENERATED ALWAYS AS ((_raw_data ->> 'recipient'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    destination text GENERATED ALWAYS AS ((_raw_data ->> 'destination'::text)) STORED,
    source_type text GENERATED ALWAYS AS ((_raw_data ->> 'source_type'::text)) STORED,
    arrival_date text GENERATED ALWAYS AS ((_raw_data ->> 'arrival_date'::text)) STORED,
    bank_account jsonb GENERATED ALWAYS AS ((_raw_data -> 'bank_account'::text)) STORED,
    failure_code text GENERATED ALWAYS AS ((_raw_data ->> 'failure_code'::text)) STORED,
    transfer_group text GENERATED ALWAYS AS ((_raw_data ->> 'transfer_group'::text)) STORED,
    amount_reversed bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount_reversed'::text))::bigint) STORED,
    failure_message text GENERATED ALWAYS AS ((_raw_data ->> 'failure_message'::text)) STORED,
    source_transaction text GENERATED ALWAYS AS ((_raw_data ->> 'source_transaction'::text)) STORED,
    balance_transaction text GENERATED ALWAYS AS ((_raw_data ->> 'balance_transaction'::text)) STORED,
    statement_descriptor text GENERATED ALWAYS AS ((_raw_data ->> 'statement_descriptor'::text)) STORED,
    statement_description text GENERATED ALWAYS AS ((_raw_data ->> 'statement_description'::text)) STORED,
    failure_balance_transaction text GENERATED ALWAYS AS ((_raw_data ->> 'failure_balance_transaction'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.payouts OWNER TO postgres;

--
-- Name: plans; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.plans (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    name text GENERATED ALWAYS AS ((_raw_data ->> 'name'::text)) STORED,
    tiers jsonb GENERATED ALWAYS AS ((_raw_data -> 'tiers'::text)) STORED,
    active boolean GENERATED ALWAYS AS (((_raw_data ->> 'active'::text))::boolean) STORED,
    amount bigint GENERATED ALWAYS AS (((_raw_data ->> 'amount'::text))::bigint) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    product text GENERATED ALWAYS AS ((_raw_data ->> 'product'::text)) STORED,
    updated integer GENERATED ALWAYS AS (((_raw_data ->> 'updated'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    "interval" text GENERATED ALWAYS AS ((_raw_data ->> 'interval'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    nickname text GENERATED ALWAYS AS ((_raw_data ->> 'nickname'::text)) STORED,
    tiers_mode text GENERATED ALWAYS AS ((_raw_data ->> 'tiers_mode'::text)) STORED,
    usage_type text GENERATED ALWAYS AS ((_raw_data ->> 'usage_type'::text)) STORED,
    billing_scheme text GENERATED ALWAYS AS ((_raw_data ->> 'billing_scheme'::text)) STORED,
    interval_count bigint GENERATED ALWAYS AS (((_raw_data ->> 'interval_count'::text))::bigint) STORED,
    aggregate_usage text GENERATED ALWAYS AS ((_raw_data ->> 'aggregate_usage'::text)) STORED,
    transform_usage text GENERATED ALWAYS AS ((_raw_data ->> 'transform_usage'::text)) STORED,
    trial_period_days bigint GENERATED ALWAYS AS (((_raw_data ->> 'trial_period_days'::text))::bigint) STORED,
    statement_descriptor text GENERATED ALWAYS AS ((_raw_data ->> 'statement_descriptor'::text)) STORED,
    statement_description text GENERATED ALWAYS AS ((_raw_data ->> 'statement_description'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.plans OWNER TO postgres;

--
-- Name: prices; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.prices (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    active boolean GENERATED ALWAYS AS (((_raw_data ->> 'active'::text))::boolean) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    nickname text GENERATED ALWAYS AS ((_raw_data ->> 'nickname'::text)) STORED,
    recurring jsonb GENERATED ALWAYS AS ((_raw_data -> 'recurring'::text)) STORED,
    type text GENERATED ALWAYS AS ((_raw_data ->> 'type'::text)) STORED,
    unit_amount integer GENERATED ALWAYS AS (((_raw_data ->> 'unit_amount'::text))::integer) STORED,
    billing_scheme text GENERATED ALWAYS AS ((_raw_data ->> 'billing_scheme'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    lookup_key text GENERATED ALWAYS AS ((_raw_data ->> 'lookup_key'::text)) STORED,
    tiers_mode text GENERATED ALWAYS AS ((_raw_data ->> 'tiers_mode'::text)) STORED,
    transform_quantity jsonb GENERATED ALWAYS AS ((_raw_data -> 'transform_quantity'::text)) STORED,
    unit_amount_decimal text GENERATED ALWAYS AS ((_raw_data ->> 'unit_amount_decimal'::text)) STORED,
    product text GENERATED ALWAYS AS ((_raw_data ->> 'product'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.prices OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.products (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    active boolean GENERATED ALWAYS AS (((_raw_data ->> 'active'::text))::boolean) STORED,
    default_price text GENERATED ALWAYS AS ((_raw_data ->> 'default_price'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    name text GENERATED ALWAYS AS ((_raw_data ->> 'name'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    images jsonb GENERATED ALWAYS AS ((_raw_data -> 'images'::text)) STORED,
    marketing_features jsonb GENERATED ALWAYS AS ((_raw_data -> 'marketing_features'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    package_dimensions jsonb GENERATED ALWAYS AS ((_raw_data -> 'package_dimensions'::text)) STORED,
    shippable boolean GENERATED ALWAYS AS (((_raw_data ->> 'shippable'::text))::boolean) STORED,
    statement_descriptor text GENERATED ALWAYS AS ((_raw_data ->> 'statement_descriptor'::text)) STORED,
    unit_label text GENERATED ALWAYS AS ((_raw_data ->> 'unit_label'::text)) STORED,
    updated integer GENERATED ALWAYS AS (((_raw_data ->> 'updated'::text))::integer) STORED,
    url text GENERATED ALWAYS AS ((_raw_data ->> 'url'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.products OWNER TO postgres;

--
-- Name: refunds; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.refunds (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    amount integer GENERATED ALWAYS AS (((_raw_data ->> 'amount'::text))::integer) STORED,
    balance_transaction text GENERATED ALWAYS AS ((_raw_data ->> 'balance_transaction'::text)) STORED,
    charge text GENERATED ALWAYS AS ((_raw_data ->> 'charge'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    currency text GENERATED ALWAYS AS ((_raw_data ->> 'currency'::text)) STORED,
    destination_details jsonb GENERATED ALWAYS AS ((_raw_data -> 'destination_details'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    payment_intent text GENERATED ALWAYS AS ((_raw_data ->> 'payment_intent'::text)) STORED,
    reason text GENERATED ALWAYS AS ((_raw_data ->> 'reason'::text)) STORED,
    receipt_number text GENERATED ALWAYS AS ((_raw_data ->> 'receipt_number'::text)) STORED,
    source_transfer_reversal text GENERATED ALWAYS AS ((_raw_data ->> 'source_transfer_reversal'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    transfer_reversal text GENERATED ALWAYS AS ((_raw_data ->> 'transfer_reversal'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.refunds OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.reviews (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    billing_zip text GENERATED ALWAYS AS ((_raw_data ->> 'billing_zip'::text)) STORED,
    charge text GENERATED ALWAYS AS ((_raw_data ->> 'charge'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    closed_reason text GENERATED ALWAYS AS ((_raw_data ->> 'closed_reason'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    ip_address text GENERATED ALWAYS AS ((_raw_data ->> 'ip_address'::text)) STORED,
    ip_address_location jsonb GENERATED ALWAYS AS ((_raw_data -> 'ip_address_location'::text)) STORED,
    open boolean GENERATED ALWAYS AS (((_raw_data ->> 'open'::text))::boolean) STORED,
    opened_reason text GENERATED ALWAYS AS ((_raw_data ->> 'opened_reason'::text)) STORED,
    payment_intent text GENERATED ALWAYS AS ((_raw_data ->> 'payment_intent'::text)) STORED,
    reason text GENERATED ALWAYS AS ((_raw_data ->> 'reason'::text)) STORED,
    session text GENERATED ALWAYS AS ((_raw_data ->> 'session'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.reviews OWNER TO postgres;

--
-- Name: setup_intents; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.setup_intents (
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    description text GENERATED ALWAYS AS ((_raw_data ->> 'description'::text)) STORED,
    payment_method text GENERATED ALWAYS AS ((_raw_data ->> 'payment_method'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    usage text GENERATED ALWAYS AS ((_raw_data ->> 'usage'::text)) STORED,
    cancellation_reason text GENERATED ALWAYS AS ((_raw_data ->> 'cancellation_reason'::text)) STORED,
    latest_attempt text GENERATED ALWAYS AS ((_raw_data ->> 'latest_attempt'::text)) STORED,
    mandate text GENERATED ALWAYS AS ((_raw_data ->> 'mandate'::text)) STORED,
    single_use_mandate text GENERATED ALWAYS AS ((_raw_data ->> 'single_use_mandate'::text)) STORED,
    on_behalf_of text GENERATED ALWAYS AS ((_raw_data ->> 'on_behalf_of'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.setup_intents OWNER TO postgres;

--
-- Name: subscription_items; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.subscription_items (
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    billing_thresholds jsonb GENERATED ALWAYS AS ((_raw_data -> 'billing_thresholds'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    deleted boolean GENERATED ALWAYS AS (((_raw_data ->> 'deleted'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    quantity integer GENERATED ALWAYS AS (((_raw_data ->> 'quantity'::text))::integer) STORED,
    price text GENERATED ALWAYS AS ((_raw_data ->> 'price'::text)) STORED,
    subscription text GENERATED ALWAYS AS ((_raw_data ->> 'subscription'::text)) STORED,
    tax_rates jsonb GENERATED ALWAYS AS ((_raw_data -> 'tax_rates'::text)) STORED,
    current_period_end integer GENERATED ALWAYS AS (((_raw_data ->> 'current_period_end'::text))::integer) STORED,
    current_period_start integer GENERATED ALWAYS AS (((_raw_data ->> 'current_period_start'::text))::integer) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.subscription_items OWNER TO postgres;

--
-- Name: subscription_schedules; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.subscription_schedules (
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    application text GENERATED ALWAYS AS ((_raw_data ->> 'application'::text)) STORED,
    canceled_at integer GENERATED ALWAYS AS (((_raw_data ->> 'canceled_at'::text))::integer) STORED,
    completed_at integer GENERATED ALWAYS AS (((_raw_data ->> 'completed_at'::text))::integer) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    current_phase jsonb GENERATED ALWAYS AS ((_raw_data -> 'current_phase'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    default_settings jsonb GENERATED ALWAYS AS ((_raw_data -> 'default_settings'::text)) STORED,
    end_behavior text GENERATED ALWAYS AS ((_raw_data ->> 'end_behavior'::text)) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    phases jsonb GENERATED ALWAYS AS ((_raw_data -> 'phases'::text)) STORED,
    released_at integer GENERATED ALWAYS AS (((_raw_data ->> 'released_at'::text))::integer) STORED,
    released_subscription text GENERATED ALWAYS AS ((_raw_data ->> 'released_subscription'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    subscription text GENERATED ALWAYS AS ((_raw_data ->> 'subscription'::text)) STORED,
    test_clock text GENERATED ALWAYS AS ((_raw_data ->> 'test_clock'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.subscription_schedules OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.subscriptions (
    _updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    cancel_at_period_end boolean GENERATED ALWAYS AS (((_raw_data ->> 'cancel_at_period_end'::text))::boolean) STORED,
    current_period_end integer GENERATED ALWAYS AS (((_raw_data ->> 'current_period_end'::text))::integer) STORED,
    current_period_start integer GENERATED ALWAYS AS (((_raw_data ->> 'current_period_start'::text))::integer) STORED,
    default_payment_method text GENERATED ALWAYS AS ((_raw_data ->> 'default_payment_method'::text)) STORED,
    items jsonb GENERATED ALWAYS AS ((_raw_data -> 'items'::text)) STORED,
    metadata jsonb GENERATED ALWAYS AS ((_raw_data -> 'metadata'::text)) STORED,
    pending_setup_intent text GENERATED ALWAYS AS ((_raw_data ->> 'pending_setup_intent'::text)) STORED,
    pending_update jsonb GENERATED ALWAYS AS ((_raw_data -> 'pending_update'::text)) STORED,
    status text GENERATED ALWAYS AS ((_raw_data ->> 'status'::text)) STORED,
    application_fee_percent double precision GENERATED ALWAYS AS (((_raw_data ->> 'application_fee_percent'::text))::double precision) STORED,
    billing_cycle_anchor integer GENERATED ALWAYS AS (((_raw_data ->> 'billing_cycle_anchor'::text))::integer) STORED,
    billing_thresholds jsonb GENERATED ALWAYS AS ((_raw_data -> 'billing_thresholds'::text)) STORED,
    cancel_at integer GENERATED ALWAYS AS (((_raw_data ->> 'cancel_at'::text))::integer) STORED,
    canceled_at integer GENERATED ALWAYS AS (((_raw_data ->> 'canceled_at'::text))::integer) STORED,
    collection_method text GENERATED ALWAYS AS ((_raw_data ->> 'collection_method'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    days_until_due integer GENERATED ALWAYS AS (((_raw_data ->> 'days_until_due'::text))::integer) STORED,
    default_source text GENERATED ALWAYS AS ((_raw_data ->> 'default_source'::text)) STORED,
    default_tax_rates jsonb GENERATED ALWAYS AS ((_raw_data -> 'default_tax_rates'::text)) STORED,
    discount jsonb GENERATED ALWAYS AS ((_raw_data -> 'discount'::text)) STORED,
    ended_at integer GENERATED ALWAYS AS (((_raw_data ->> 'ended_at'::text))::integer) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    next_pending_invoice_item_invoice integer GENERATED ALWAYS AS (((_raw_data ->> 'next_pending_invoice_item_invoice'::text))::integer) STORED,
    pause_collection jsonb GENERATED ALWAYS AS ((_raw_data -> 'pause_collection'::text)) STORED,
    pending_invoice_item_interval jsonb GENERATED ALWAYS AS ((_raw_data -> 'pending_invoice_item_interval'::text)) STORED,
    start_date integer GENERATED ALWAYS AS (((_raw_data ->> 'start_date'::text))::integer) STORED,
    transfer_data jsonb GENERATED ALWAYS AS ((_raw_data -> 'transfer_data'::text)) STORED,
    trial_end jsonb GENERATED ALWAYS AS ((_raw_data -> 'trial_end'::text)) STORED,
    trial_start jsonb GENERATED ALWAYS AS ((_raw_data -> 'trial_start'::text)) STORED,
    schedule text GENERATED ALWAYS AS ((_raw_data ->> 'schedule'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    latest_invoice text GENERATED ALWAYS AS ((_raw_data ->> 'latest_invoice'::text)) STORED,
    plan text GENERATED ALWAYS AS ((_raw_data ->> 'plan'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.subscriptions OWNER TO postgres;

--
-- Name: tax_ids; Type: TABLE; Schema: stripe; Owner: postgres
--

CREATE TABLE stripe.tax_ids (
    _last_synced_at timestamp with time zone,
    _raw_data jsonb,
    _account_id text NOT NULL,
    object text GENERATED ALWAYS AS ((_raw_data ->> 'object'::text)) STORED,
    country text GENERATED ALWAYS AS ((_raw_data ->> 'country'::text)) STORED,
    customer text GENERATED ALWAYS AS ((_raw_data ->> 'customer'::text)) STORED,
    type text GENERATED ALWAYS AS ((_raw_data ->> 'type'::text)) STORED,
    value text GENERATED ALWAYS AS ((_raw_data ->> 'value'::text)) STORED,
    created integer GENERATED ALWAYS AS (((_raw_data ->> 'created'::text))::integer) STORED,
    livemode boolean GENERATED ALWAYS AS (((_raw_data ->> 'livemode'::text))::boolean) STORED,
    owner jsonb GENERATED ALWAYS AS ((_raw_data -> 'owner'::text)) STORED,
    id text GENERATED ALWAYS AS ((_raw_data ->> 'id'::text)) STORED NOT NULL
);


ALTER TABLE stripe.tax_ids OWNER TO postgres;

--
-- Name: accounting_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounting_entries ALTER COLUMN id SET DEFAULT nextval('public.accounting_entries_id_seq'::regclass);


--
-- Name: admin_contracts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_contracts ALTER COLUMN id SET DEFAULT nextval('public.admin_contracts_id_seq'::regclass);


--
-- Name: admin_financial_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_financial_records ALTER COLUMN id SET DEFAULT nextval('public.admin_financial_records_id_seq'::regclass);


--
-- Name: admin_leads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_leads ALTER COLUMN id SET DEFAULT nextval('public.admin_leads_id_seq'::regclass);


--
-- Name: admin_partnerships id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_partnerships ALTER COLUMN id SET DEFAULT nextval('public.admin_partnerships_id_seq'::regclass);


--
-- Name: admin_posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_posts ALTER COLUMN id SET DEFAULT nextval('public.admin_posts_id_seq'::regclass);


--
-- Name: admin_project_deliverables id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_project_deliverables ALTER COLUMN id SET DEFAULT nextval('public.admin_project_deliverables_id_seq'::regclass);


--
-- Name: admin_project_phases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_project_phases ALTER COLUMN id SET DEFAULT nextval('public.admin_project_phases_id_seq'::regclass);


--
-- Name: admin_projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_projects ALTER COLUMN id SET DEFAULT nextval('public.admin_projects_id_seq'::regclass);


--
-- Name: admin_proposals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_proposals ALTER COLUMN id SET DEFAULT nextval('public.admin_proposals_id_seq'::regclass);


--
-- Name: antt_freight_table id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.antt_freight_table ALTER COLUMN id SET DEFAULT nextval('public.antt_freight_table_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: bank_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts ALTER COLUMN id SET DEFAULT nextval('public.bank_accounts_id_seq'::regclass);


--
-- Name: bank_integrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_integrations ALTER COLUMN id SET DEFAULT nextval('public.bank_integrations_id_seq'::regclass);


--
-- Name: bank_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transactions ALTER COLUMN id SET DEFAULT nextval('public.bank_transactions_id_seq'::regclass);


--
-- Name: business_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_types ALTER COLUMN id SET DEFAULT nextval('public.business_types_id_seq'::regclass);


--
-- Name: checklist_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_attachments ALTER COLUMN id SET DEFAULT nextval('public.checklist_attachments_id_seq'::regclass);


--
-- Name: checklist_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_items ALTER COLUMN id SET DEFAULT nextval('public.checklist_items_id_seq'::regclass);


--
-- Name: checklist_sections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_sections ALTER COLUMN id SET DEFAULT nextval('public.checklist_sections_id_seq'::regclass);


--
-- Name: checklist_template_purchases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_template_purchases ALTER COLUMN id SET DEFAULT nextval('public.checklist_template_purchases_id_seq'::regclass);


--
-- Name: checklist_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_templates ALTER COLUMN id SET DEFAULT nextval('public.checklist_templates_id_seq'::regclass);


--
-- Name: checklists id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklists ALTER COLUMN id SET DEFAULT nextval('public.checklists_id_seq'::regclass);


--
-- Name: client_operations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_operations ALTER COLUMN id SET DEFAULT nextval('public.client_operations_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: commercial_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commercial_events ALTER COLUMN id SET DEFAULT nextval('public.commercial_events_id_seq'::regclass);


--
-- Name: commercial_flowcharts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commercial_flowcharts ALTER COLUMN id SET DEFAULT nextval('public.commercial_flowcharts_id_seq'::regclass);


--
-- Name: commercial_proposals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commercial_proposals ALTER COLUMN id SET DEFAULT nextval('public.commercial_proposals_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: company_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_roles ALTER COLUMN id SET DEFAULT nextval('public.company_roles_id_seq'::regclass);


--
-- Name: company_team_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_team_members ALTER COLUMN id SET DEFAULT nextval('public.company_team_members_id_seq'::regclass);


--
-- Name: consulting_quote_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consulting_quote_requests ALTER COLUMN id SET DEFAULT nextval('public.consulting_quote_requests_id_seq'::regclass);


--
-- Name: contract_agreements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_agreements ALTER COLUMN id SET DEFAULT nextval('public.contract_agreements_id_seq'::regclass);


--
-- Name: contract_signatures id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_signatures ALTER COLUMN id SET DEFAULT nextval('public.contract_signatures_id_seq'::regclass);


--
-- Name: contract_templates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_templates ALTER COLUMN id SET DEFAULT nextval('public.contract_templates_id_seq'::regclass);


--
-- Name: cost_centers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cost_centers ALTER COLUMN id SET DEFAULT nextval('public.cost_centers_id_seq'::regclass);


--
-- Name: diagnostic_leads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostic_leads ALTER COLUMN id SET DEFAULT nextval('public.diagnostic_leads_id_seq'::regclass);


--
-- Name: digital_certificates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_certificates ALTER COLUMN id SET DEFAULT nextval('public.digital_certificates_id_seq'::regclass);


--
-- Name: dre_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dre_accounts ALTER COLUMN id SET DEFAULT nextval('public.dre_accounts_id_seq'::regclass);


--
-- Name: ebook_volumes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ebook_volumes ALTER COLUMN id SET DEFAULT nextval('public.ebook_volumes_id_seq'::regclass);


--
-- Name: financial_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_accounts ALTER COLUMN id SET DEFAULT nextval('public.financial_accounts_id_seq'::regclass);


--
-- Name: freight_calculations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.freight_calculations ALTER COLUMN id SET DEFAULT nextval('public.freight_calculations_id_seq'::regclass);


--
-- Name: irpf_assets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irpf_assets ALTER COLUMN id SET DEFAULT nextval('public.irpf_assets_id_seq'::regclass);


--
-- Name: irpf_declarations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irpf_declarations ALTER COLUMN id SET DEFAULT nextval('public.irpf_declarations_id_seq'::regclass);


--
-- Name: irpf_deductions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irpf_deductions ALTER COLUMN id SET DEFAULT nextval('public.irpf_deductions_id_seq'::regclass);


--
-- Name: irpf_dependents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irpf_dependents ALTER COLUMN id SET DEFAULT nextval('public.irpf_dependents_id_seq'::regclass);


--
-- Name: irpf_incomes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irpf_incomes ALTER COLUMN id SET DEFAULT nextval('public.irpf_incomes_id_seq'::regclass);


--
-- Name: irpj_das_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irpj_das_payments ALTER COLUMN id SET DEFAULT nextval('public.irpj_das_payments_id_seq'::regclass);


--
-- Name: irpj_summaries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irpj_summaries ALTER COLUMN id SET DEFAULT nextval('public.irpj_summaries_id_seq'::regclass);


--
-- Name: market_segments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_segments ALTER COLUMN id SET DEFAULT nextval('public.market_segments_id_seq'::regclass);


--
-- Name: marketing_materials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_materials ALTER COLUMN id SET DEFAULT nextval('public.marketing_materials_id_seq'::regclass);


--
-- Name: meeting_action_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_action_items ALTER COLUMN id SET DEFAULT nextval('public.meeting_action_items_id_seq'::regclass);


--
-- Name: meeting_objectives id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_objectives ALTER COLUMN id SET DEFAULT nextval('public.meeting_objectives_id_seq'::regclass);


--
-- Name: meeting_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_records ALTER COLUMN id SET DEFAULT nextval('public.meeting_records_id_seq'::regclass);


--
-- Name: nfse_invoices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nfse_invoices ALTER COLUMN id SET DEFAULT nextval('public.nfse_invoices_id_seq'::regclass);


--
-- Name: nfse_providers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nfse_providers ALTER COLUMN id SET DEFAULT nextval('public.nfse_providers_id_seq'::regclass);


--
-- Name: operation_billing_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_billing_entries ALTER COLUMN id SET DEFAULT nextval('public.operation_billing_entries_id_seq'::regclass);


--
-- Name: operation_billing_goals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_billing_goals ALTER COLUMN id SET DEFAULT nextval('public.operation_billing_goals_id_seq'::regclass);


--
-- Name: permission_definitions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_definitions ALTER COLUMN id SET DEFAULT nextval('public.permission_definitions_id_seq'::regclass);


--
-- Name: personal_accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_accounts ALTER COLUMN id SET DEFAULT nextval('public.personal_accounts_id_seq'::regclass);


--
-- Name: personal_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_categories ALTER COLUMN id SET DEFAULT nextval('public.personal_categories_id_seq'::regclass);


--
-- Name: personal_cost_centers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_cost_centers ALTER COLUMN id SET DEFAULT nextval('public.personal_cost_centers_id_seq'::regclass);


--
-- Name: personal_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_transactions ALTER COLUMN id SET DEFAULT nextval('public.personal_transactions_id_seq'::regclass);


--
-- Name: product_cost_structures id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_cost_structures ALTER COLUMN id SET DEFAULT nextval('public.product_cost_structures_id_seq'::regclass);


--
-- Name: product_media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_media ALTER COLUMN id SET DEFAULT nextval('public.product_media_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: proposal_routes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_routes ALTER COLUMN id SET DEFAULT nextval('public.proposal_routes_id_seq'::regclass);


--
-- Name: rfis id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfis ALTER COLUMN id SET DEFAULT nextval('public.rfis_id_seq'::regclass);


--
-- Name: saved_routes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_routes ALTER COLUMN id SET DEFAULT nextval('public.saved_routes_id_seq'::regclass);


--
-- Name: storage_calculations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storage_calculations ALTER COLUMN id SET DEFAULT nextval('public.storage_calculations_id_seq'::regclass);


--
-- Name: store_order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_order_items ALTER COLUMN id SET DEFAULT nextval('public.store_order_items_id_seq'::regclass);


--
-- Name: store_orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_orders ALTER COLUMN id SET DEFAULT nextval('public.store_orders_id_seq'::regclass);


--
-- Name: store_product_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_product_categories ALTER COLUMN id SET DEFAULT nextval('public.store_product_categories_id_seq'::regclass);


--
-- Name: store_products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_products ALTER COLUMN id SET DEFAULT nextval('public.store_products_id_seq'::regclass);


--
-- Name: subscription_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans ALTER COLUMN id SET DEFAULT nextval('public.subscription_plans_id_seq'::regclass);


--
-- Name: support_ticket_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_ticket_messages ALTER COLUMN id SET DEFAULT nextval('public.support_ticket_messages_id_seq'::regclass);


--
-- Name: support_tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets ALTER COLUMN id SET DEFAULT nextval('public.support_tickets_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: user_role_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_assignments ALTER COLUMN id SET DEFAULT nextval('public.user_role_assignments_id_seq'::regclass);


--
-- Name: whatsapp_agents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_agents ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_agents_id_seq'::regclass);


--
-- Name: whatsapp_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_config ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_config_id_seq'::regclass);


--
-- Name: whatsapp_conversations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_conversations ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_conversations_id_seq'::regclass);


--
-- Name: whatsapp_journey_steps id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_journey_steps ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_journey_steps_id_seq'::regclass);


--
-- Name: whatsapp_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_messages ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_messages_id_seq'::regclass);


--
-- Name: _sync_status id; Type: DEFAULT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe._sync_status ALTER COLUMN id SET DEFAULT nextval('stripe._sync_status_id_seq'::regclass);


--
-- Data for Name: accounting_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounting_entries (id, company_id, dre_account_id, cost_center_id, bank_account_id, entry_date, competence_date, document_number, document_type, description, entry_type, value, status, reconciled, reconciled_at, nfse_invoice_id, financial_record_id, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_contracts (id, proposal_id, lead_id, contract_number, client_name, client_cnpj, service_type, description, value, payment_terms, start_date, end_date, status, signed_at, signed_by, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_financial_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_financial_records (id, type, category, subcategory, description, client_name, contract_id, value, due_date, paid_at, status, payment_method, nfse_number, nfse_issued_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_leads (id, company_name, trade_name, cnpj, contact_name, contact_email, contact_phone, city, state, segment, source, interest, stage, estimated_value, probability, notes, next_follow_up, assigned_to, lost_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_partnerships; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_partnerships (id, partner_name, partner_type, contact_name, contact_email, contact_phone, website, description, benefits, status, start_date, end_date, owner_name, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_posts (id, title, slug, content, excerpt, category, tags, target_audience, featured_image, status, publish_at, published_at, author_name, views, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_project_deliverables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_project_deliverables (id, project_id, phase_id, name, description, due_date, completed_at, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_project_phases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_project_phases (id, project_id, name, description, order_index, start_date, target_end_date, actual_end_date, status, progress, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_projects (id, contract_id, lead_id, name, client_name, project_type, description, start_date, target_end_date, actual_end_date, status, progress, value, assigned_to, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_proposals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_proposals (id, lead_id, proposal_number, title, client_name, service_type, description, value, discount, final_value, valid_until, status, sent_at, accepted_at, rejected_reason, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: antt_freight_table; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.antt_freight_table (id, operation_type, cargo_type, axles, ccd, cc, valid_from, valid_until) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, company_id, user_id, user_email, user_name, action, entity_type, entity_id, entity_name, details, ip_address, user_agent, created_at) FROM stdin;
1	1	51563272	\N	\N	update	client	1	\N	\N	10.81.9.131	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36	2025-12-27 01:30:47.425892
2	1	51563272	\N	\N	update	subscription_plan	2	\N	\N	10.81.13.178	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-09 16:45:18.148186
3	1	51563272	\N	\N	update	subscription_plan	3	\N	\N	10.81.13.178	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-09 16:45:41.094485
4	1	51563272	\N	\N	update	subscription_plan	2	\N	\N	10.81.11.228	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-09 16:46:44.019774
5	1	51563272	\N	\N	update	subscription_plan	3	\N	\N	10.81.11.228	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	2026-01-09 16:47:29.65327
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_accounts (id, company_id, bank_code, bank_name, agency, agency_digit, account_number, account_digit, account_type, holder_name, holder_cnpj, pix_key, pix_key_type, open_banking_enabled, open_banking_token, is_main, is_active, notes, created_at, updated_at, external_account_id) FROM stdin;
1	\N	336	C6 Bank	0001		013908408	8	corrente	MCG CONSULTORIA LTDA	08670140000189	08670140000189	cnpj	f	\N	t	t		2025-12-24 00:53:41.456273	2025-12-24 00:53:41.456273	\N
\.


--
-- Data for Name: bank_integrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_integrations (id, company_id, bank_account_id, provider, client_id, client_secret, access_token, refresh_token, token_expires_at, webhook_url, webhook_secret, sandbox_mode, permissions, last_sync_at, sync_status, error_message, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: bank_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_transactions (id, company_id, bank_account_id, external_id, transaction_date, transaction_type, description, counterparty_name, counterparty_document, counterparty_bank, pix_key, end_to_end_id, value, balance, accounting_entry_id, reconciled, reconciled_at, raw_data, created_at) FROM stdin;
\.


--
-- Data for Name: business_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_types (id, name, is_default, created_at) FROM stdin;
1	Consultoria	f	2026-01-02 05:05:52.90888
\.


--
-- Data for Name: checklist_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checklist_attachments (id, checklist_id, company_id, categoria, nome, descricao, arquivo, data_validade, lembrete_15_dias_enviado, lembrete_enviado_em, emails_notificacao, section_key, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: checklist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checklist_items (id, checklist_id, department, question, answer, checked, notes, order_index, created_at, section_id) FROM stdin;
\.


--
-- Data for Name: checklist_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checklist_sections (id, checklist_id, section_key, section_name, responsavel_nome, responsavel_email, data_recebimento, data_retorno, is_perfil, parecer, documentos_atualizados, documentos_observacao, status, progress, order_index, created_at, updated_at, prestador_nome, prestador_telefone, prestador_email, prestador_aniversario, prestador_cargo, cliente_contato_nome, cliente_contato_telefone, cliente_contato_email, cliente_contato_aniversario, cliente_contato_cargo, aprovado_prestador, aprovado_prestador_data, aprovado_prestador_por, aprovado_cliente, aprovado_cliente_data, aprovado_cliente_por) FROM stdin;
\.


--
-- Data for Name: checklist_template_purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checklist_template_purchases (id, template_id, user_id, company_id, stripe_payment_intent_id, stripe_session_id, amount_paid, status, resulting_checklist_id, purchased_at, created_at) FROM stdin;
1	3	51563272	1	\N	cs_test_a1Z8CZcQMGFsbYrl1afVfIPp2qmXREXlnRGMm9NHVjzwnFcLWnrRDBA59u	12900	pending	\N	\N	2025-12-23 16:13:25.693175
2	3	51563272	1	\N	cs_test_a1fJV23RocoA2kPOV2TeJ8jvE2zywDijmmfwmbCMop5QgnHoNPjkjsstjb	12900	pending	\N	\N	2025-12-23 16:18:44.052369
3	3	51563272	1	\N	cs_test_a1NEd1I9WoeBlHiDaCfC5YFvspylTXcCnxUCHIIZ12LPFnVzp9PpJ42klO	12900	pending	\N	\N	2025-12-23 17:14:55.824555
4	3	51563272	1	\N	cs_test_a17UnxVlg1QjuXVU9BPYMuaJXWCN3kftbvyauNBn3gWBeWwMlroumFWSle	12900	pending	\N	\N	2025-12-23 17:18:26.630442
5	2	51563272	1	\N	cs_test_a15nw4VN7WsDBfZFr4cNmOkzLENMIh6MTyq6H2A8c8HCGQQ7RGTz7bY3Eg	9900	pending	\N	\N	2025-12-23 17:22:40.151967
6	3	51563272	1	\N	cs_test_a1dxjJi2V0fYjvOMH5GPc9QLhoiKxKHhF0kyDRKXvnhpaEZabQlPV1jV7N	12900	pending	\N	\N	2025-12-23 17:41:23.108802
7	3	51563272	1	\N	cs_test_a17flwALDyuasZKJ9UYmHWgvFJI35iIg5Pj0x3E2IqXAyxlWoPs3at53TU	12900	pending	\N	\N	2025-12-23 17:44:31.139835
\.


--
-- Data for Name: checklist_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checklist_templates (id, name, description, segment, industry_name, price_in_cents, stripe_price_id, is_active, preview_image_url, template_data, section_updates, created_at, updated_at) FROM stdin;
5	Checklist Transporte - Diagnóstico Completo	Template completo para diagnóstico de operações de transporte rodoviário. Inclui análise comercial, operacional, frota, qualidade, financeiro e gestão de riscos.	Transporte	\N	16990	\N	t	\N	{"sections": [{"id": "comercial", "items": [{"id": "com1", "text": "Possui contrato formal de prestação de serviços?", "checked": false}, {"id": "com2", "text": "Tem tabela de frete atualizada?", "checked": false}, {"id": "com3", "text": "Realiza follow-up com clientes regularmente?", "checked": false}], "title": "Comercial"}, {"id": "operacional", "items": [{"id": "op1", "text": "Frota própria ou terceirizada documentada?", "checked": false}, {"id": "op2", "text": "Controle de manutenção preventiva?", "checked": false}, {"id": "op3", "text": "Sistema de rastreamento ativo?", "checked": false}, {"id": "op4", "text": "Roteirização de entregas otimizada?", "checked": false}], "title": "Operacional - Transporte"}, {"id": "qualidade", "items": [{"id": "q1", "text": "Possui certificação ISO ou equivalente?", "checked": false}, {"id": "q2", "text": "Indicadores de performance definidos (OTIF, custo/km)?", "checked": false}], "title": "Qualidade"}, {"id": "financeiro", "items": [{"id": "f1", "text": "Controle de custos por viagem/rota?", "checked": false}, {"id": "f2", "text": "Margem de contribuição por cliente calculada?", "checked": false}], "title": "Financeiro"}, {"id": "grisco", "items": [{"id": "g1", "text": "Gerenciamento de riscos implementado?", "checked": false}, {"id": "g2", "text": "Seguro de carga ativo e atualizado?", "checked": false}], "title": "GRISCO"}]}	\N	2026-01-21 16:33:49.055991	2026-01-21 16:33:49.055991
6	Checklist Indústria - Expedição e Distribuição	Template para avaliação de processos de expedição industrial. Foco em picking, packing, carregamento, distribuição e indicadores de produtividade.	Indústria	\N	14990	\N	t	\N	{"sections": [{"id": "comercial", "items": [{"id": "com1", "text": "Possui política comercial definida?", "checked": false}, {"id": "com2", "text": "Controle de pedidos integrado?", "checked": false}], "title": "Comercial"}, {"id": "expedicao", "items": [{"id": "e1", "text": "Área de expedição organizada e sinalizada?", "checked": false}, {"id": "e2", "text": "Processo de picking padronizado?", "checked": false}, {"id": "e3", "text": "Conferência de carga documentada?", "checked": false}], "title": "Expedição"}, {"id": "distribuicao", "items": [{"id": "d1", "text": "Roteirização de entregas otimizada?", "checked": false}, {"id": "d2", "text": "Controle de entregas realizadas?", "checked": false}], "title": "Distribuição"}, {"id": "indicadores", "items": [{"id": "i1", "text": "OTIF (On Time In Full) monitorado?", "checked": false}, {"id": "i2", "text": "Custo por entrega calculado?", "checked": false}], "title": "Indicadores"}]}	\N	2026-01-21 16:33:49.068644	2026-01-21 16:33:49.068644
7	Checklist Operador Logístico - Armazenagem	Diagnóstico completo de operações de operador logístico e armazenagem. Inclui avaliação de WMS, layout, endereçamento, acuracidade e gestão de estoque.	Operador Logístico	\N	12990	\N	t	\N	{"sections": [{"id": "comercial", "items": [{"id": "com1", "text": "Possui contrato formal de prestação de serviços?", "checked": false}, {"id": "com2", "text": "Tem tabela de preços de armazenagem atualizada?", "checked": false}, {"id": "com3", "text": "Realiza follow-up com clientes regularmente?", "checked": false}], "title": "Comercial"}, {"id": "wms", "items": [{"id": "w1", "text": "WMS implementado e funcionando?", "checked": false}, {"id": "w2", "text": "Integração com ERP do cliente ativa?", "checked": false}, {"id": "w3", "text": "Usuários treinados no sistema?", "checked": false}], "title": "Sistema WMS"}, {"id": "estoque", "items": [{"id": "es1", "text": "Inventário cíclico realizado?", "checked": false}, {"id": "es2", "text": "Acuracidade acima de 98%?", "checked": false}, {"id": "es3", "text": "FIFO/FEFO implementado?", "checked": false}], "title": "Controle de Estoque"}, {"id": "layout", "items": [{"id": "l1", "text": "Layout otimizado para fluxo?", "checked": false}, {"id": "l2", "text": "Endereçamento padronizado?", "checked": false}], "title": "Layout e Endereçamento"}, {"id": "qualidade", "items": [{"id": "q1", "text": "Possui certificação ISO ou equivalente?", "checked": false}, {"id": "q2", "text": "Indicadores de performance definidos?", "checked": false}], "title": "Qualidade"}]}	\N	2026-01-21 16:33:49.076283	2026-01-21 16:33:49.076283
\.


--
-- Data for Name: checklists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checklists (id, company_id, client_id, name, segment, status, completed_at, created_at, updated_at, cliente_nome, cliente_cnpj, focal_point_nome, focal_point_email, focal_point_celular, focal_point_regiao, historia, localizacao, segmento_detalhado, produto, numeros, noticias, site, linkedin, email_comercial, contato_comercial, abrangencia_nacional, abrangencia_regional, abrangencia_internacional, market_share, posicao_mercado, oportunidades, pipeline_segmento, pipeline_produto, pipeline_volume, pipeline_target, contatos_cliente, portais_senhas, documentos_empresa) FROM stdin;
1	1	\N	Check List 23/12/2025		in_progress	\N	2025-12-23 08:06:24.616463	2025-12-23 08:06:24.616463																	f	f	f			[]				\N	[]	[]	[]
\.


--
-- Data for Name: client_operations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client_operations (id, company_id, client_id, proposal_id, operation_name, origin_city, origin_state, destination_city, destination_state, product_type, packaging_type, agreed_freight, contract_start_date, contract_end_date, next_review_date, review_period_months, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, company_id, name, trade_name, cnpj, email, phone, address, city, state, segment, status, pipeline_stage, notes, contact_name, contact_phone, contact_email, estimated_value, created_at, updated_at, tipo_empresa, vendedor, meta_valor, inscricao_estadual, inscricao_estadual_isento, inscricao_municipal) FROM stdin;
1	1	MCG	MCG	08.670.140/0001-89						Operador Logístico	prospect	lead					\N	2025-12-20 01:09:37.598	2025-12-27 01:30:47.409	\N	\N	100000.00	\N	f	\N
\.


--
-- Data for Name: commercial_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.commercial_events (id, company_id, client_id, user_id, title, description, event_type, start_date, end_date, all_day, location, pipeline_stage, meeting_record_id, recurrence, status, notes, created_at, updated_at) FROM stdin;
1	1	\N	74cbc1a7-e8d2-44c1-beee-920df3a49983	Reuniao: INDICADORES	xxx	meeting	2025-12-27 00:00:00	\N	t	MATRIZ GO	\N	4	\N	scheduled	\N	2025-12-19 03:07:02.167625	2025-12-19 03:07:02.167625
2	1	\N	74cbc1a7-e8d2-44c1-beee-920df3a49983	Revisao: INDICADORES	Proxima revisao da ata: INDICADORES	followup	2026-01-01 00:00:00	\N	t	\N	\N	4	\N	scheduled	\N	2025-12-19 03:07:02.176769	2025-12-19 03:07:02.176769
3	1	\N	74cbc1a7-e8d2-44c1-beee-920df3a49983	Tarefa: Criar tabela	Responsavel: Marcia\nAta: INDICADORES	deadline	2025-12-31 00:00:00	\N	t	\N	\N	\N	\N	scheduled	\N	2025-12-19 03:07:02.467347	2025-12-19 03:07:02.467347
\.


--
-- Data for Name: commercial_flowcharts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.commercial_flowcharts (id, user_id, company_id, name, nodes, edges, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: commercial_proposals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.commercial_proposals (id, company_id, client_id, proposal_number, client_name, client_email, client_phone, client_cnpj, status, valid_until, approved_at, contract_type, next_review_date, notes, total_value, created_at, updated_at, proposal_type, proposal_data) FROM stdin;
1	1	\N	MCG-2025-00001	MCG	comercial@mcgconsultoria.com.br	41998903362	\N	draft	2026-01-03 13:45:19.587	\N	spot	\N	ag retorno	6181.82	2025-12-19 13:45:19.588756	2025-12-19 13:45:19.588756	freight	\N
2	1	1	MCG-2025-00002	MCG	marciacguimaraes@gmail.com		\N	awaiting_approval	2026-01-19 01:10:07.231	\N	\N	\N		5000.00	2025-12-20 01:10:07.232348	2025-12-20 01:10:07.232348	consulting	{"phases": [{"id": "diagnostico", "name": "Diagnóstico", "price": 5000}], "contactName": "MARCIA", "hasCommission": false, "commissionPercent": 0}
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.companies (id, name, cnpj, email, phone, address, city, state, subscription_status, subscription_end_date, created_at, updated_at, logo, nome_fantasia, inscricao_estadual, inscricao_estadual_isento, inscricao_municipal, allowed_email_domain, enforce_email_domain, cnpj_raiz, tipo_unidade, selected_plan, max_users, current_users, primary_admin_id, stripe_customer_id, stripe_subscription_id, cancellation_requested_at, cancellation_effective_date, cancellation_reason, renewal_price, renewal_due_date, renewal_approved, renewal_approved_at, contract_start_date, last_access_warning_email_sent) FROM stdin;
1	MCG CONSULTORIA LTDA	08.670.140/0001-89	\N	\N	\N	\N	\N	trial	\N	2025-12-23 05:49:16.645416	2026-01-15 00:24:22.907	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKMAAADSCAYAAAAmEnDkAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOxAAADsQBlSsOGwAAFtRJREFUeF7tXQnUTVUb/jNPocyisKTMMhbRhFgkKXMplKKUCBGSZEmSpiXVQsNqURKrWqLBlBDKkKVMyxCS6avMqv1/z/t/7/2Pe/f97pnuPfvc733Wetb9vn322Wfvs5/z7rP3fvc+/8mEuuiiixR+hcJACSHmzZtX5cmTRygMlJmCFMsoNIbaQBKoUOgXWVPWXw21gUJhEIwNLFiwoCpfvrwqXbq0UOgrL7vsMlWoUKEYzWUxNrBLly5q7969avPmzWrTpk30KxR65caNG9WePXtU//79YzSXxdjABx54QAH//vtv5Fco9Mp//vmH9DR69OgYzWUxNtAqRlAg8AOspSeffDJGc1mMDWQxspIFAj/AehIxCgKHiFFgDESMAmMgYhQYAxGjwBiIGAXGQMQoMAYiRoExEDEKjIGIUWAMRIwCYyBiFBgDEaPAGIgYfYK403mHiNEniBi9Q8ToM1iUuDegiNQ+RIw2EC0m/t8qOLtgcUaf5ySNdIWI0SZYeH///fcF5T537pw6ceKEOn78uDp27Jj6/fff1f79+9WuXbvUtm3b1L59+9ShQ4fU0aNHKc7JkyfV6dOnKR3G+fPnI+nnZFHyfRUxxgFbMQiGcerUKRLWunXr1LRp01Tfvn1Vw4YNaZll8eLFVbFixVTRokXVxRdfTL9g2bJlVc2aNVX37t3VmDFj1Ny5c9Xu3bvVH3/8EbmPfB385kRR8n0QMWYCArDSisOHD6u1a9eq6dOnq549e5LwsH48f/78KleuXDH3KB6xWwL2jSlQoIAqXLiwqlevnho3bpxasWIFWdFo5CRRihgzYRVfdOWvWbNGPffcc6pZs2Yx94EJgUGQIP6OR+txXTrVqlVTQ4cOVZ9++ilZTCvYWqazOEWMWYguy/Lly9Xtt9+uSpYsGVP+7ATllLp0YG1r166thgwZQu+gDBGjJjBdxBhduXiHmzRpkqpSpYpvYvPKfPnyqT59+qgff/wxK5f/QzoKM8eKERXJ+UenYcaMGapq1aoxZTWF2H8Grwt4dwWie/XpgBwpRqtFQa+4VatWMWU0iVYrXatWLbVs2bKs3KcXcpwYrUJcvHgxDbmgTKY0y9kxd+7ckb979+4d6X2nS3Odo8SISuOKW7RoEb0b6spnMq3DSD169KDBdAB1EXZR5jjLCCxcuDDSSw6DRdSR892+fXua0QGsD1sYkSPEyPlERQ0aNMjRILXJZEE2atSI3n25jGFFWovRaikwh9yuXbtIGcJqEeOxbt26tIErEFZB5gjLCHTt2jWmHOlCfrAwP56RkUHlDVPdMNJWjFbrcO+991K+g2qeU2GF+RpNmjSJOHWETZBpJ0Zr0wwMHz6c8uy3IOykhzi6eBxuJw0n5IetY8eO6siRI1T+MAkyrcX4xRdf0DyvrgxuqbOumLlp27atuu+++9TgwYPJC2f8+PE0YwIOGzaM3MwgEsw5w7XMer6fFhsCR3oY9uEm2/pwmoy0EyMDeWvZsmVM3r0wWjTNmzcn8S1YsCDSm80OZ86cUd98842aPHmyuvvuu1XlypUjafltJeHeNnPmTLquyfVkRdqIkZ9+/p0yZUokv35WdJEiRVTnzp3VnDlzIgPObrFhwwY1derUC0TpJytUqEAe54C1xTAVaSVGzs+qVatUiRIlYvLthdz0YSkBDzIDuCZfN1GF83HQuuwAbmLw/oZHOF/PrwcIHj+cp+zyZgLSSowAvFpuvPHGmDx7ISzX/PnzKX2ABaWrZOvf0UgUH5YSvWFdHrwQc/BAdnkzAWkhRutN7tevX0x+vRDTbdblAMmoUKTJ9/Ls2bM0AoBlDbr8OCFb1zp16lxgzU1FWokRvWcshtLl2Q179eql/vrrL0ob12D6DV3acBPDAi7kw48mG+/QQDLy7xfSQowApvsgHuTPj8obOHAg9X4Bq1iSVZm6dHfu3KmqV6+uzZ9TNmjQwPj567QR45YtWyIi9CJGdCKeeuopWo7KCKLy+JooF1tIr5w3bx6laVK9WRF6MXKlYYhEl1enHDBgQESISJuZKlivx78ffPBBdp+9tU1Ye6SJektlmewi1GK03tCmTZtS3txYRT4HTSJ2fwCCrDC+Lv9irhlrta15dUI+B+OOPE0oYvQZfH0M7GJRvC6vdokZi61bt1J61jFAU4A8QUy6vDshHIs5PdMQajHy0z1y5EjKlxergRsAoExI1wTLwXng+zx79uyYfNslx8dacEAsY5Jwww03xOTRCStWrKh27NhBaZkiRIDzwb/YYMrrfDsWoFlfRUxCaMXIFfTDDz+oMmXKxOTRCTFlBpgiQh04b9hoyouXD7yYsF8QIGL0GVh8jzy5aaJBVA7v1mBa5VjBYsQ8duPGjbVlsUt4vVthykMYWjHyDYTvIPLkVoxXX301pQOEwTICGH7yYh3h+nbw4EFKy6Qyh9oyYjwQ7ly6PNolFsMDJvYurYBoWDhwX/Myd12pUqXIALiI0Sf89ttvqn79+jH5c8JZs2ZRWiZVSjxwHuG44aXc8MmcOHEipWUSQi1GLM30Ova2efPmrNScC9KrgL1cr02bNtry2CFeabB+3DSEWozbt2+n3V91ebTDUqVKRTyh3QDi8Eq3wNQeyuB2vBErJgEvefAboRYjZkx0+bPL66677oLNOFMNN0Lge471Ldi7UVcuO8Te4oCI0SP4BsKjRZc/u+zUqRN9fcBphXB8DEIfOHCAvMvtEMLnXww8u+k08ZroJUuWeHKe6NatG6UjYvQIvu5PP/0UkzcnhFc4BOG0Qvj6EyZMoGWqNWrUIDcvu8RwEhw7eHzTyfVZwCh79JJXJ+zSpQulI2L0CL4uW0a3Y4xPPPEEpeO0HBwfm8Hr0rXDSy65hD7dAbgRI741w17tTsrPcdEqACJGj+Droiesy59dwokWcCtGdtBww3Llyqn169dTOk4EwdeGKxgErUs7O7IYTXSY4LKFUoxo5nT5s0ssDwWclsPGTYtLFgMcFjCv7hQsHnyaw4sYO3ToQGmJGD2Cr4uPBOnyZ5fPPPMMpRNGMf7555+exIjtAdEZEjF6BN/A1atXx+TNCceOHUvpuBXjiBEjtOlmR1MsI/YGwiI2kxBqMa5cuTImb07oVYxhtoyYweHVj6Yg1GLEV6x0+bPLnCzG1q1bX7AC0gSEWoxLly6NyZsThrmZ9ipGeIxj0B7gNIOGiDETbsUYZssIMfJuGUHVYzRCLUbsdajLn13mZDHiq2DWrVtMgIgxE27FGPZmWsToA0wRY5gt4y233BIRoykItRi//vrrmLw5YU4XI9IwxSoCoRajNNPexWgSQi1GsYxiGUWMIsakINRilGZammmxjIlvWlyKZYwPEWMmRIxmINRilGZammmxjIlvWlyKZYwPEWMmRIxmINRilGZammmxjIlvWlyKZYwPEWMmRIxmINRilGZammmxjIlvWlyKZYwPEWMmRIxmINRilGZammmxjIlvWlyKZYwPEWMmRIxmINRilGZammmxjIlvWlyKZYwPEWMmRIxmINRilGZammmxjIlvWlyKZYwPEWMmRIxmINRi9NpMu925ljd5d9NMM61idCIIzqtbMTJFjD6Bb+DixYtj8uaEo0aNonSclAPX5vhDhgzRpmuHl156qfr+++8pHSfgsmdkZHj69EaLFi1o91sRo0fwdbFzLb4ueuWVV6pq1arZ5lVXXaVKly6tXn75ZUrHaTm4AidPnqyuuOIKSk93HR0RF9+Owde58C0XwIkgOK+watdcc42qUqWK9jrxiOtXrFhR9ezZUzZ+8gN+3zyn6QVZeUGXPZkIpRgF6QkRo8AYiBgFxkDEKDAGIkaBMRAxCoyBiFFgDESMAmMgYhQYAxGjwBiIGAXGQMQoMAYiRoExEDEKjIGIUWAMRIwCYyBiFBgDEaPAGIgYBcZAxCgwBiJGgTEQMQqMgYhRYAwciZH3aRExCpKBaDGy3iy84B+iiFGQDDiyjEwWo0m7EQjSB3HFmDt3bpUvXz6VJ08eIgIfeeSRrNMEAv8xbtw40hlrLm/evP/TXrly5WijoAoVKtAvNkyqV6+euvPOO1WHDh2EQt942223ka4aN26soDtojnWH30yB/v9FUvNCKRSmktpAoTBpzMboiUUUBkvoL0uD+ghCYQDUBgqFQVAbKBQGQW2gUBgEtYFCYRDUBgqFQVAbKBQGQW2gUBgEtYEpZ65cuYjWAXj8jTBrvOzI8b2k4ZbW/Ef/6uL7SS4fXwu/qby+j9QGBkZ4cBQoUIDIXkROifO8puGW8ILCNfGrO54MQnDwvMqfPz8Rf7NAQ0ZtYEpofWrxnbzmzZuTr9srr7yipk2bRq5sNWrUoBtsPS8eixUrpmrWrKn69OmjXnvtNeKjjz7qKA27tOa9UKFC5O107bXXqq5du9L177rrLvrcWokSJeihsJ7rFyG6MmXKqFtvvVWNHDmSyotP1A0fPlx17NhRVapUifKmO9dQagNTRogElbd7927ydcMXTU+cOEFk595ly5aR21G8JgfWtFOnTmrr1q0UH8D5+HYeexd/+eWX9D0/3flOaM0DBHjPPfeo5cuXq3PnztF1AKtTMvKxYMEC1a5dOxKmNS23hABbtmypPvroI3XmzBm6ztmzZ6m8uJ7VQ3/VqlX0gODDmrq0DKM2MCWExVq4cCHdtD179pBFfOyxx1S3bt1Uly5d1NChQ9WsWbPoRgOvv/56zE3Fxxtnz55Nxw8ePKjeeustNWbMGNWjRw+qhMGDB6u3335bnTp1iuI8/fTT9HFKaxpOiU/vwmrv3LmT0jxw4ICaO3eumjp1Kn1WGNb92WefJUu1aNGiiGA2bdpE4i1YsKA23URE89+rVy+1Y8cOSg8fu5wzZ456/vnn1YABA+ie4QOWjz/+OIV9+OGH6vjx4xQXnxvu3r17JK14D3bA1AYmnXDg/fnnn+lGQWTly5fXxgPR3OFD6MDGjRtV/fr1Kbxy5coRazhjxgz6Amv0ucxatWpF0li7dq1q2LChNl4iwkF0/fr1lM6xY8dU79696cunurggLD8euvHjx9M5AL6jje9B6+JHk0UDqwpxAfv371f9+/enMkXHj2b16tXp4WS8+OKLkTQNFKQ2MCnkwsO6rV69mm7O6NGjY+LpiHefN954g8755ZdfqCI+//xz+n/QoEHac5h8Xby7zZw5k87Bt6BLlSoVEzc79uvXj849f/48WWy8s+niWWmtcDwsK1asoDSA+++//4K48QivaJQZwDuhm3dQPBB4nQA+/vhjEqkuXsDUBiaNqBwIEECTag23xtMRnZzPPvuMzoV1A6ZMmaKNG4/o5EyfPp3ORVOqi2Ml5wtNIIAmEu+n0cej/7bSGg4h4bp4v4M4EpUb76X8RX+8cuji2CWuNW/ePEoL38LOcvVPmIcUUhvoO7nAl19+uTp58qT69ddfIzfDDvl8fNybhYhmHpUVHTceOQ30MlEZ6Czx+1t2FYL4R44cUYcPH6Yesy6OU6LXX7ZsWe0xJoZn8MACeBfVxXHD999/n9JE68RhhghSG5gUolnDUAuAl31dHDtExQDoIOB/Nzdy7NixlAYWCumOW4lOCJCqDgCPEd500010XVzfj3FLzjPSf+GFFyhtdHai4wVIbWBSWKRIEfXuu+/STYAodXGyI99MdBrQw+Ylj26I9zUgkcVp0qQJDZd899132uNuGU/MCOdj8+fPpzzefPPNMfG8sk6dOurQoUPUw9cdD4jawKSwaNGiaunSpTTUgSWLujh2iE0G0Ingd754Fasjx8VAMfKBXnh0HJDj8fstxgmt4ckip4/RBYxd4n75PWDPxLszXlXat2+vPR4AtYFJIcSI9xSMj0EMujh2CDGiotyIkYnZHnQi3nvvPe1xsGTJkjSUtGvXrkjTmWwxMnk4JtFIgRtyk4/ePfDSSy/R/6kqWzbUBiaFECOaO69ixBCLWzFy3BYtWpAY33nnnZg4TAx/ABCG7ngyCYuIcUx0nnTH/SJGB5YsWUJ1ozueYmoDk0IUeOXKlSSCNm3aaOPYoZdmmgnLiHdBnRg5vVatWpEY27ZtGxMnGeTrYoQAFhlCiY7jF/laGHfFIHp2A/cppDYwKQybGB9++GESI+Jaw5PNunXrqu3bt9MAue64n4RTBeay0aHRHU8xtYFJYVjEyBwxYgS94KNHjf9TJUaMZcJxBEM6uuN+8qGHHqIHjqdYU1XGONQGJoVhEyM6D0DTpk3p/1RVFObtt23blhLL+OCDD1IZGzRooD2eYmoDk8KwiJF7znfccQdVVOvWren/VIkRLmIY/8MMk+64nxQxhuSdERUEwC0rOk6yCT9EuMSxc2yyHgQRY0iaafg9Yh4dHjq648kkPJTgg5nsnryIMSRixFw6nFfR22Sn3mRZKCa/IrBVhiij4/hJEWNIxAhiLQsAxwLdcb9pLQtczDBBAF9Eaxw/KWIMkRgxdfbtt99SXPRyEcbWyy9G55//b9asGQkFLl+6435QxBgiMYLXX389VdiaNWsi/o9eBYl570RuYbjGm2++SdfGeKAujleKGH0Qox+OEnbFCOKaAMb+MPSii2OX8JKBg7Cd90F4t2/evJmujTl5XRwvzPFixHuQFzGiUtxaRo4LRwknYgSxcAzYsGEDLRXl8ERW0nocDiJ4GAH2lklEvDPi4UNHKlqQ2ZUdxxLlTcRogBidWEY+p3Dhwuqrr76iysPyVLsLqpio+KNHj9L5EDacjXXxrORrd+7cmc7DUBOWoRYvXjwmrhvmWDFiMRQGc015Z0TFZufPGI9w1d+yZQtVIjxr8HA0atSI3L3wLohy4heeMNh8AMtK4RkDoPxuNxOANecmG8AqP8wOYaUknHGxnhtLWjE+Wrt2bdpVYtKkSRSuSw/EIi+AO2cBUxuYFOJpxjQXmhusP9bFscOBAwfSDZw8ebL2uB1i3TJ2fkCF6o4nIpa5YkMAFiWAjQjwLoj3ynXr1kUECGCYBkstvG51gns4atQocqLgnSuwBANTh+j1w3kZzsBw8ABwr9EBw7nWh5abb1hoLDbDZgh8LEBqA5NC3AA4HWBWAZZDF8cOsaoQYuYb6MYywlqgI+HGIlivhzXNsLLDhg1Tn3zyCa3HxgMHUWJIBg8OmkBrs+omv6D1PHRsYBGxc8arr75KGwPguljWiuW8GBfF8lq4o2W3gwXef5FnL/XhI7WBQht0K6pUMzqfbBXxgADx1gEFQG1gKOhVDDjfD0EhDV2vNV64n8wu/URlw+pKoG/fvtrjAVAbKExTskCrVq2q9u3bR9umoMMVHS8gagOFaUirpcTwEIANqaxxAqY2UGgoEzW90eT41vOwnOL06dMqIyPDJKsIagOFhpBFhL15/NjnZ8iQIWQRMaMDT3ZdnACpDRQaRoxnYuwQy2c5LJGVjD4+ceJEEiJmjzDzYj1mCLWBQsOIgWvehRb7nWOM0c62J/AMwjgo74eJAXlDlqXqqA0UGkgM8vP+igAG2THViN3KsIsvBvIxeI2dMGBB4XYGT3UGdm2Df4AubUOoDRQaRm5ysZk+tvHDnDpP+WGtzN69e2mYBov/sZCL9xEH4AzCa78NpzZQGALCysFRAu+CmALEtB6aYez9PWHCBJoyje4tJ3rPDJjaQKHhdDKzY7gArdQGCkPC7IQWIhEytYFCYRDUBgqFQVAbKBQGQW2gUBgEtYFCYRDUBgqFQVAbKBQGQW2gUBgEtYFCYRDUBgqFQVAbKBQGQW2gUBgEtYFCYRDUBgqFQVAbKBQGQW2gUBgEtYFCYRDUBgqFQVAbKBSmmP9R/wXdHwM5VMwZ9wAAAABJRU5ErkJggg==	M. VESTE	90938061-80	f	17 12 680.821-4	\N	f	\N	matriz	free	1	1	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	\N
\.


--
-- Data for Name: company_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_roles (id, company_id, code, name, description, color, permissions, is_system, is_active, sort_order, created_by, created_at, updated_at) FROM stdin;
1	\N	owner	Proprietário	Acesso total a todas as funcionalidades	#8B5CF6	{crm.view,crm.create,crm.edit,crm.delete,crm.export,financial.view,financial.create,financial.edit,financial.delete,financial.approve,financial.export,checklist.view,checklist.create,checklist.edit,checklist.delete,rfi.view,rfi.create,rfi.edit,rfi.delete,calculator.view,calculator.export,loja.view,loja.purchase,calendar.view,calendar.create,calendar.edit,calendar.delete,tasks.view,tasks.create,tasks.edit,tasks.delete,projects.view,projects.create,projects.edit,projects.delete,atas.view,atas.create,atas.edit,atas.delete,support.view,support.create,reports.view,reports.export,admin.users,admin.roles,admin.settings,admin.billing}	t	t	1	\N	2026-01-09 19:21:13.469125	2026-01-09 19:21:13.469125
2	\N	manager	Gerente	Gerenciamento de equipe e operações	#3B82F6	{crm.view,crm.create,crm.edit,crm.export,financial.view,financial.create,financial.edit,financial.export,checklist.view,checklist.create,checklist.edit,rfi.view,rfi.create,rfi.edit,calculator.view,calculator.export,loja.view,loja.purchase,calendar.view,calendar.create,calendar.edit,calendar.delete,tasks.view,tasks.create,tasks.edit,tasks.delete,projects.view,projects.create,projects.edit,atas.view,atas.create,atas.edit,support.view,support.create,reports.view,reports.export,admin.users}	t	t	2	\N	2026-01-09 19:21:13.576494	2026-01-09 19:21:13.576494
3	\N	sales	Vendedor	Foco em vendas e relacionamento com clientes	#10B981	{crm.view,crm.create,crm.edit,checklist.view,checklist.create,checklist.edit,rfi.view,rfi.create,rfi.edit,calculator.view,calendar.view,calendar.create,calendar.edit,tasks.view,tasks.create,tasks.edit,atas.view,atas.create,atas.edit,support.view,support.create}	t	t	3	\N	2026-01-09 19:21:13.586421	2026-01-09 19:21:13.586421
4	\N	financial_analyst	Analista Financeiro	Gestão financeira e relatórios	#F59E0B	{financial.view,financial.create,financial.edit,financial.export,reports.view,reports.export,support.view,support.create}	t	t	4	\N	2026-01-09 19:21:13.591549	2026-01-09 19:21:13.591549
5	\N	viewer	Visualizador	Acesso somente leitura	#6B7280	{crm.view,financial.view,checklist.view,rfi.view,calculator.view,calendar.view,tasks.view,projects.view,atas.view,reports.view,support.view}	t	t	5	\N	2026-01-09 19:21:13.67427	2026-01-09 19:21:13.67427
\.


--
-- Data for Name: company_team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_team_members (id, company_id, user_id, role, department, permissions, is_active, invited_by, invited_at, joined_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: consulting_quote_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consulting_quote_requests (id, contact_name, email, phone, message, phases, has_expansao, status, response_notes, quoted_value, responded_at, responded_by, created_at, updated_at) FROM stdin;
1	marcia guimaraes	mcgconsultoriacomercial@gmail.com	41998903362	\N	[{"id":"diagnóstico","name":"Diagnóstico","duration":"1 mês"},{"id":"implementação","name":"Implementação","duration":"1 mês"},{"id":"execução","name":"Execução","duration":"1 mês"},{"id":"expansao","name":"Expansão","duration":"Contínuo"}]	t	pending	\N	\N	\N	\N	2026-01-04 02:38:56.696793	2026-01-04 02:38:56.696793
\.


--
-- Data for Name: contract_agreements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contract_agreements (id, company_id, template_id, contract_type, status, provider_name, provider_envelope_id, provider_sign_url, signed_pdf_url, issued_at, viewed_at, signed_at, expires_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: contract_signatures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contract_signatures (id, agreement_id, signer_role, signer_user_id, signer_name, signer_email, signer_cpf, signature_type, certificate_info, signed_at, ip_address, status, created_at) FROM stdin;
\.


--
-- Data for Name: contract_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contract_templates (id, type, name, version, content, is_active, valid_from, valid_until, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cost_centers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cost_centers (id, company_id, parent_id, code, name, type, description, budget, is_active, created_at) FROM stdin;
1	\N	\N	ADM	Administrativo	administrativo	\N	\N	t	2025-12-23 23:10:43.624546
2	\N	1	ADM.01	Recursos Humanos	administrativo	\N	\N	t	2025-12-23 23:10:43.627138
3	\N	1	ADM.02	Financeiro	administrativo	\N	\N	t	2025-12-23 23:10:43.629479
4	\N	1	ADM.03	Juridico	administrativo	\N	\N	t	2025-12-23 23:10:43.634555
5	\N	\N	COM	Comercial	comercial	\N	\N	t	2025-12-23 23:10:43.637428
6	\N	5	COM.01	Vendas	comercial	\N	\N	t	2025-12-23 23:10:43.640324
7	\N	5	COM.02	Marketing	comercial	\N	\N	t	2025-12-23 23:10:43.642421
8	\N	5	COM.03	Relacionamento	comercial	\N	\N	t	2025-12-23 23:10:43.645063
9	\N	\N	OPE	Operacional	operacional	\N	\N	t	2025-12-23 23:10:43.648348
10	\N	9	OPE.01	Consultoria	operacional	\N	\N	t	2025-12-23 23:10:43.651474
11	\N	9	OPE.02	Implantacao	operacional	\N	\N	t	2025-12-23 23:10:43.657235
12	\N	9	OPE.03	Suporte	operacional	\N	\N	t	2025-12-23 23:10:43.659949
13	\N	\N	PRJ	Projetos	projeto	\N	\N	t	2025-12-23 23:10:43.663729
14	\N	13	PRJ.01	Desenvolvimento MCG	projeto	\N	\N	t	2025-12-23 23:10:43.66722
15	\N	13	PRJ.02	Parcerias	projeto	\N	\N	t	2025-12-23 23:10:43.670208
\.


--
-- Data for Name: diagnostic_leads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diagnostic_leads (id, name, email, company, phone, segment, score, max_score, percentage, maturity_level, answers, status, notes, follow_up_date, assigned_to, source, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: digital_certificates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.digital_certificates (id, company_id, name, type, cnpj, serial_number, issuer, valid_from, valid_until, certificate_data, password_hash, is_active, created_at, updated_at) FROM stdin;
1	\N	Certificado	A1	\N	\N	\N	\N	\N	\N	\N	t	2025-12-24 00:56:54.67449	2025-12-24 00:56:54.67449
\.


--
-- Data for Name: dre_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dre_accounts (id, company_id, parent_id, code, name, nature, type, level, report_order, is_active, created_at) FROM stdin;
1	\N	\N	1	RECEITA BRUTA	receita	\N	1	\N	t	2025-12-23 23:07:54.552814
2	\N	1	1.1	Receita de Servicos	receita	\N	2	\N	t	2025-12-23 23:07:54.561515
3	\N	2	1.1.1	Consultoria	receita	\N	3	\N	t	2025-12-23 23:07:54.564872
4	\N	2	1.1.2	Licencas de Software	receita	\N	3	\N	t	2025-12-23 23:07:54.567808
5	\N	2	1.1.3	Treinamentos	receita	\N	3	\N	t	2025-12-23 23:07:54.570829
6	\N	\N	2	(-) DEDUCOES DA RECEITA	custo	\N	1	\N	t	2025-12-23 23:07:54.574394
7	\N	6	2.1	Impostos sobre Servicos	custo	\N	2	\N	t	2025-12-23 23:07:54.579264
8	\N	7	2.1.1	ISS	custo	\N	3	\N	t	2025-12-23 23:07:54.587308
9	\N	7	2.1.2	PIS	custo	\N	3	\N	t	2025-12-23 23:07:54.590251
10	\N	7	2.1.3	COFINS	custo	\N	3	\N	t	2025-12-23 23:07:54.596591
11	\N	\N	3	CUSTOS DOS SERVICOS PRESTADOS	custo	\N	1	\N	t	2025-12-23 23:07:54.599853
12	\N	11	3.1	Custos Diretos	custo	\N	2	\N	t	2025-12-23 23:07:54.603345
13	\N	12	3.1.1	Mao de Obra Direta	custo	\N	3	\N	t	2025-12-23 23:07:54.61135
14	\N	12	3.1.2	Materiais e Insumos	custo	\N	3	\N	t	2025-12-23 23:07:54.615312
15	\N	\N	4	DESPESAS OPERACIONAIS	despesa	\N	1	\N	t	2025-12-23 23:07:54.619064
16	\N	15	4.1	Despesas Administrativas	despesa	\N	2	\N	t	2025-12-23 23:07:54.624553
17	\N	16	4.1.1	Salarios e Encargos	despesa	\N	3	\N	t	2025-12-23 23:07:54.628774
18	\N	16	4.1.2	Aluguel e Condominio	despesa	\N	3	\N	t	2025-12-23 23:07:54.631779
19	\N	16	4.1.3	Energia e Telecom	despesa	\N	3	\N	t	2025-12-23 23:07:54.634606
20	\N	16	4.1.4	Servicos de Terceiros	despesa	\N	3	\N	t	2025-12-23 23:07:54.637462
21	\N	15	4.2	Despesas Comerciais	despesa	\N	2	\N	t	2025-12-23 23:07:54.640464
22	\N	21	4.2.1	Marketing e Publicidade	despesa	\N	3	\N	t	2025-12-23 23:07:54.64285
23	\N	21	4.2.2	Comissoes de Vendas	despesa	\N	3	\N	t	2025-12-23 23:07:54.645543
24	\N	15	4.3	Despesas Financeiras	despesa	\N	2	\N	t	2025-12-23 23:07:54.648616
25	\N	24	4.3.1	Juros e Multas	despesa	\N	3	\N	t	2025-12-23 23:07:54.651246
26	\N	24	4.3.2	Tarifas Bancarias	despesa	\N	3	\N	t	2025-12-23 23:07:54.653871
27	\N	\N	5	RESULTADO ANTES DO IR/CSLL	receita	\N	1	\N	t	2025-12-23 23:07:54.656873
28	\N	\N	6	(-) IR/CSLL	custo	\N	1	\N	t	2025-12-23 23:07:54.658889
29	\N	\N	7	RESULTADO LIQUIDO	receita	\N	1	\N	t	2025-12-23 23:07:54.661633
\.


--
-- Data for Name: ebook_volumes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ebook_volumes (id, product_id, volume_number, title, subtitle, author_name, author_bio, teaser_html, manuscript_status, release_date, digital_file_url, print_isbn, digital_isbn, page_count, is_published, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: financial_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financial_accounts (id, company_id, client_id, type, description, value, due_date, paid_date, status, category, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: freight_calculations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.freight_calculations (id, company_id, client_id, origin_city, origin_state, destination_city, destination_state, weight, cargo_value, freight_value, icms_rate, icms_value, gris_rate, gris_value, adv_rate, adv_value, toll_value, unloading_value, total_value, created_at) FROM stdin;
\.


--
-- Data for Name: irpf_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.irpf_assets (id, declaration_id, code, type, description, location, acquisition_date, acquisition_value, current_value, previous_year_value, notes, created_at) FROM stdin;
\.


--
-- Data for Name: irpf_declarations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.irpf_declarations (id, user_id, year, status, cpf, full_name, birth_date, occupation, total_income, total_deductions, total_tax_paid, estimated_tax, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: irpf_deductions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.irpf_deductions (id, declaration_id, type, description, beneficiary_name, beneficiary_cpf_cnpj, amount, notes, created_at) FROM stdin;
\.


--
-- Data for Name: irpf_dependents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.irpf_dependents (id, declaration_id, name, cpf, birth_date, relationship, created_at) FROM stdin;
\.


--
-- Data for Name: irpf_incomes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.irpf_incomes (id, declaration_id, type, source_name, source_cnpj, gross_amount, tax_withheld, inss_withheld, thirteenth_salary, notes, created_at) FROM stdin;
\.


--
-- Data for Name: irpj_das_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.irpj_das_payments (id, summary_id, competence_month, competence_year, revenue_base, aliquot, das_value, due_date, payment_date, is_paid, notes, created_at) FROM stdin;
\.


--
-- Data for Name: irpj_summaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.irpj_summaries (id, year, status, cnpj, razao_social, regime_tributario, total_revenue, total_expenses, net_profit, total_das, total_prolabore, total_dividends, total_inss, monthly_data, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: market_segments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.market_segments (id, name, is_default, created_at) FROM stdin;
1	Consultoria	f	2026-01-02 05:06:06.668799
\.


--
-- Data for Name: marketing_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketing_materials (id, company_id, title, description, segment, type, file_url, is_public, created_at) FROM stdin;
\.


--
-- Data for Name: meeting_action_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meeting_action_items (id, meeting_record_id, description, responsible, responsible_user_id, due_date, priority, status, completed_at, notes, order_index, created_at, responsible_email, linked_task_id) FROM stdin;
\.


--
-- Data for Name: meeting_objectives; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meeting_objectives (id, company_id, label, is_custom, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: meeting_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meeting_records (id, company_id, client_id, user_id, title, meeting_type, meeting_date, participants, summary, objectives, decisions, next_steps, next_review_date, pipeline_stage, status, created_at, updated_at, selected_objectives, meeting_mode, meeting_location) FROM stdin;
\.


--
-- Data for Name: nfse_invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nfse_invoices (id, company_id, provider_id, client_id, rps_number, rps_series, rps_type, nfse_number, verification_code, issue_date, competence_date, status, service_description, service_value, deduction_value, iss_rate, iss_value, iss_retained, pis_value, cofins_value, ir_value, csll_value, inss_value, total_value, xml_content, pdf_url, xml_url, api_response, error_message, cancelled_at, cancellation_reason, financial_record_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nfse_providers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nfse_providers (id, company_id, city_code, city_name, state, provider_type, homologation_url, production_url, api_token, api_provider, inscricao_municipal, codigo_tributacao, item_lista_servico, cnae, certificate_id, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: operation_billing_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operation_billing_entries (id, company_id, operation_id, client_id, billing_date, amount, description, invoice_number, source, created_at) FROM stdin;
\.


--
-- Data for Name: operation_billing_goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operation_billing_goals (id, company_id, operation_id, goal_month, goal_amount, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: permission_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permission_definitions (id, code, name, description, module, category, is_active, sort_order, created_at) FROM stdin;
1	crm.view	Visualizar CRM	Visualizar clientes e pipeline	crm	view	t	1	2026-01-09 19:21:13.091491
2	crm.create	Criar Clientes	Adicionar novos clientes	crm	create	t	2	2026-01-09 19:21:13.112279
3	crm.edit	Editar Clientes	Editar informações de clientes	crm	edit	t	3	2026-01-09 19:21:13.12516
4	crm.delete	Excluir Clientes	Remover clientes do sistema	crm	delete	t	4	2026-01-09 19:21:13.137976
5	crm.export	Exportar CRM	Exportar dados de clientes	crm	export	t	5	2026-01-09 19:21:13.144578
6	financial.view	Visualizar Financeiro	Visualizar contas e movimentações	financial	view	t	1	2026-01-09 19:21:13.151998
7	financial.create	Criar Lançamentos	Adicionar lançamentos financeiros	financial	create	t	2	2026-01-09 19:21:13.161808
8	financial.edit	Editar Lançamentos	Editar lançamentos existentes	financial	edit	t	3	2026-01-09 19:21:13.166853
9	financial.delete	Excluir Lançamentos	Remover lançamentos financeiros	financial	delete	t	4	2026-01-09 19:21:13.171585
10	financial.approve	Aprovar Pagamentos	Aprovar pagamentos e transferências	financial	approve	t	5	2026-01-09 19:21:13.176728
11	financial.export	Exportar Financeiro	Exportar relatórios financeiros	financial	export	t	6	2026-01-09 19:21:13.181461
12	checklist.view	Visualizar Checklists	Visualizar diagnósticos	checklist	view	t	1	2026-01-09 19:21:13.187582
13	checklist.create	Criar Checklists	Iniciar novos diagnósticos	checklist	create	t	2	2026-01-09 19:21:13.192043
14	checklist.edit	Editar Checklists	Editar diagnósticos existentes	checklist	edit	t	3	2026-01-09 19:21:13.196494
15	checklist.delete	Excluir Checklists	Remover diagnósticos	checklist	delete	t	4	2026-01-09 19:21:13.201359
16	rfi.view	Visualizar RFI	Visualizar formulários RFI	rfi	view	t	1	2026-01-09 19:21:13.204805
17	rfi.create	Criar RFI	Criar novos formulários RFI	rfi	create	t	2	2026-01-09 19:21:13.208893
18	rfi.edit	Editar RFI	Editar formulários RFI	rfi	edit	t	3	2026-01-09 19:21:13.213111
19	rfi.delete	Excluir RFI	Remover formulários RFI	rfi	delete	t	4	2026-01-09 19:21:13.217595
20	calculator.view	Usar Calculadoras	Acessar calculadoras de frete e armazenagem	calculator	view	t	1	2026-01-09 19:21:13.222662
21	calculator.export	Exportar Cálculos	Exportar resultados de cálculos	calculator	export	t	2	2026-01-09 19:21:13.226167
22	loja.view	Visualizar Loja	Acessar a loja MCG	loja	view	t	1	2026-01-09 19:21:13.229674
23	loja.purchase	Realizar Compras	Comprar produtos na loja	loja	create	t	2	2026-01-09 19:21:13.234858
24	calendar.view	Visualizar Calendário	Ver eventos do calendário	calendar	view	t	1	2026-01-09 19:21:13.241951
25	calendar.create	Criar Eventos	Adicionar eventos ao calendário	calendar	create	t	2	2026-01-09 19:21:13.247144
26	calendar.edit	Editar Eventos	Editar eventos existentes	calendar	edit	t	3	2026-01-09 19:21:13.25342
27	calendar.delete	Excluir Eventos	Remover eventos do calendário	calendar	delete	t	4	2026-01-09 19:21:13.257765
28	tasks.view	Visualizar Tarefas	Ver lista de tarefas	tasks	view	t	1	2026-01-09 19:21:13.266734
29	tasks.create	Criar Tarefas	Adicionar novas tarefas	tasks	create	t	2	2026-01-09 19:21:13.274325
30	tasks.edit	Editar Tarefas	Editar tarefas existentes	tasks	edit	t	3	2026-01-09 19:21:13.279211
31	tasks.delete	Excluir Tarefas	Remover tarefas	tasks	delete	t	4	2026-01-09 19:21:13.283274
32	projects.view	Visualizar Projetos	Ver projetos da empresa	projects	view	t	1	2026-01-09 19:21:13.28738
33	projects.create	Criar Projetos	Adicionar novos projetos	projects	create	t	2	2026-01-09 19:21:13.292762
34	projects.edit	Editar Projetos	Editar projetos existentes	projects	edit	t	3	2026-01-09 19:21:13.295955
35	projects.delete	Excluir Projetos	Remover projetos	projects	delete	t	4	2026-01-09 19:21:13.299756
36	atas.view	Visualizar Atas	Ver atas de reunião	atas	view	t	1	2026-01-09 19:21:13.307564
37	atas.create	Criar Atas	Registrar novas atas	atas	create	t	2	2026-01-09 19:21:13.312608
38	atas.edit	Editar Atas	Editar atas existentes	atas	edit	t	3	2026-01-09 19:21:13.316565
39	atas.delete	Excluir Atas	Remover atas de reunião	atas	delete	t	4	2026-01-09 19:21:13.321401
40	support.view	Visualizar Suporte	Ver tickets de suporte	support	view	t	1	2026-01-09 19:21:13.324623
41	support.create	Criar Tickets	Abrir novos tickets	support	create	t	2	2026-01-09 19:21:13.330639
42	reports.view	Visualizar Relatórios	Acessar relatórios e dashboards	reports	view	t	1	2026-01-09 19:21:13.334325
43	reports.export	Exportar Relatórios	Exportar relatórios em PDF/Excel	reports	export	t	2	2026-01-09 19:21:13.339681
44	admin.users	Gerenciar Usuários	Adicionar e editar membros da equipe	admin	manage	t	1	2026-01-09 19:21:13.345217
45	admin.roles	Gerenciar Cargos	Criar e editar cargos e permissões	admin	manage	t	2	2026-01-09 19:21:13.349774
46	admin.settings	Configurações	Alterar configurações da empresa	admin	manage	t	3	2026-01-09 19:21:13.448733
47	admin.billing	Gerenciar Assinatura	Gerenciar plano e pagamentos	admin	manage	t	4	2026-01-09 19:21:13.455683
\.


--
-- Data for Name: personal_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_accounts (id, user_id, name, bank_name, account_type, initial_balance, current_balance, color, is_active, created_at, updated_at, agency, account_number, pix_key, notes, is_main) FROM stdin;
\.


--
-- Data for Name: personal_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_categories (id, user_id, name, type, icon, color, is_default, created_at) FROM stdin;
\.


--
-- Data for Name: personal_cost_centers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_cost_centers (id, owner_user_id, parent_id, code, name, type, description, budget, is_active, created_at) FROM stdin;
1	51563272	\N	BAN	Bancos	bancos	\N	\N	t	2026-01-04 08:04:00.726006
2	51563272	1	BAN.01	Conta Corrente	bancos	\N	\N	t	2026-01-04 08:04:00.729846
3	51563272	1	BAN.02	Poupanca	bancos	\N	\N	t	2026-01-04 08:04:00.733918
4	51563272	\N	SAU	Saude	saude	\N	\N	t	2026-01-04 08:04:00.73704
5	51563272	4	SAU.01	Plano de Saude	saude	\N	\N	t	2026-01-04 08:04:00.74145
6	51563272	4	SAU.02	Medicamentos	saude	\N	\N	t	2026-01-04 08:04:00.744757
7	51563272	\N	ALI	Alimentacao	alimentacao	\N	\N	t	2026-01-04 08:04:00.746948
8	51563272	7	ALI.01	Supermercado	alimentacao	\N	\N	t	2026-01-04 08:04:00.749796
9	51563272	7	ALI.02	Restaurantes	alimentacao	\N	\N	t	2026-01-04 08:04:00.751546
10	51563272	\N	TRA	Transporte	transporte	\N	\N	t	2026-01-04 08:04:00.754498
11	51563272	10	TRA.01	Combustivel	transporte	\N	\N	t	2026-01-04 08:04:00.757136
12	51563272	10	TRA.02	Manutencao Veiculo	transporte	\N	\N	t	2026-01-04 08:04:00.759401
13	51563272	\N	MOR	Moradia	moradia	\N	\N	t	2026-01-04 08:04:00.761479
14	51563272	13	MOR.01	Aluguel/Financiamento	moradia	\N	\N	t	2026-01-04 08:04:00.764363
15	51563272	13	MOR.02	Condominio	moradia	\N	\N	t	2026-01-04 08:04:00.76617
16	51563272	13	MOR.03	Agua/Luz/Gas	moradia	\N	\N	t	2026-01-04 08:04:00.768778
17	51563272	\N	EDU	Educacao	educacao	\N	\N	t	2026-01-04 08:04:00.77166
18	51563272	17	EDU.01	Cursos	educacao	\N	\N	t	2026-01-04 08:04:00.774515
19	51563272	17	EDU.02	Livros	educacao	\N	\N	t	2026-01-04 08:04:00.777234
20	51563272	\N	VES	Vestuario	vestuario	\N	\N	t	2026-01-04 08:04:00.786753
21	51563272	20	VES.01	Roupas	vestuario	\N	\N	t	2026-01-04 08:04:00.789744
22	51563272	20	VES.02	Calcados	vestuario	\N	\N	t	2026-01-04 08:04:00.79299
23	51563272	\N	LAZ	Lazer	lazer	\N	\N	t	2026-01-04 08:04:00.795807
24	51563272	23	LAZ.01	Viagens	lazer	\N	\N	t	2026-01-04 08:04:00.798523
25	51563272	23	LAZ.02	Entretenimento	lazer	\N	\N	t	2026-01-04 08:04:00.801322
26	51563272	\N	INV	Investimentos	investimentos	\N	\N	t	2026-01-04 08:04:00.80417
27	51563272	26	INV.01	Renda Fixa	investimentos	\N	\N	t	2026-01-04 08:04:00.807513
28	51563272	26	INV.02	Renda Variavel	investimentos	\N	\N	t	2026-01-04 08:04:00.810254
\.


--
-- Data for Name: personal_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_transactions (id, user_id, account_id, category_id, type, description, amount, date, is_paid, is_recurring, recurring_type, notes, linked_to_mcg, mcg_record_id, mcg_record_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_cost_structures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_cost_structures (id, company_id, product_name, product_type, cost_components, fixed_costs, variable_costs, margin_target, suggested_price, current_price, is_active, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_media (id, product_id, media_type, url, "position", alt_text, file_size, mime_type, created_at) FROM stdin;
1	2	video	https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4	1	Vídeo demonstrativo da caneca MCG	\N	\N	2026-01-22 19:40:21.520724
2	2	image	https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400	2	Foto da caneca MCG	\N	\N	2026-01-22 19:40:31.340402
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, company_id, client_id, name, description, status, priority, start_date, end_date, progress, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: proposal_routes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proposal_routes (id, proposal_id, origin_city, origin_state, destination_city, destination_state, distance_km, product_type, packaging_type, weight, cargo_value, vehicle_axles, antt_min_freight, freight_value, toll_value, toll_in_icms_base, icms_rate, icms_value, iss_rate, iss_value, gris_rate, gris_value, adv_rate, adv_value, unloading_value, total_value, operation_name, created_at) FROM stdin;
1	1	Curitiba	PR	Goiânia	GO	700.00	glp	pallet	13250.00	\N	3	4223.16	5000.00	500.00	f	12.00	681.82	\N	\N	0.0000	0.00	0.0000	0.00	\N	6181.82	copa PR	2025-12-19 13:45:19.610297
\.


--
-- Data for Name: rfis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rfis (id, company_id, razao_social, nome_fantasia, cnpj, endereco, bairro, cep, cidade, estado, contato, telefone, email, site, ramo_atividade, inicio_atividades, faturamento_anual, unidades, fornecedores, concorrentes, principais_clientes, linha_produtos, frequencia_coleta, procedimentos_embarque, cobertura_regional, detalhes_regionais, permite_terceirizacao, tipos_veiculos, perfil_veiculos, disponibiliza_xml, prazo_pagamento, segmentos_atuacao, modais_atuacao, tipos_acondicionamento, tipos_operacao, frota, responsavel_preenchimento, cargo_responsavel, telefone_responsavel, email_responsavel, status, observacoes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: saved_routes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_routes (id, company_id, name, origin_city, origin_state, destination_city, destination_state, distance_km, toll_2_axles, toll_3_axles, toll_4_axles, toll_5_axles, toll_6_axles, toll_7_axles, toll_9_axles, notes, is_active, created_at, updated_at, toll_per_axle, route_date, route_number, itinerary) FROM stdin;
1	1	Curitiba/PR - São Paulo/SP	Curitiba	PR	São Paulo	SP	450.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	\N	t	2025-12-24 09:10:39.521569	2025-12-24 09:10:39.521569	11.00	2025-12-24 00:00:00	\N	\N
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (sid, sess, expire) FROM stdin;
YCjYT9pirPkwu74RsRn81XhsIY5jB-u8	{"cookie": {"path": "/", "secure": false, "expires": "2026-01-11T02:26:03.511Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "replit.com": {"code_verifier": "2SAvZ7LY03kjLEHqgcGeSDhz6niyLbFZzMOdkQvuO14"}}	2026-01-11 10:34:21
\.


--
-- Data for Name: storage_calculations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storage_calculations (id, company_id, client_id, area, period, product_type, movement_rate, storage_rate, handling_value, total_value, created_at) FROM stdin;
\.


--
-- Data for Name: store_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_order_items (id, order_id, product_id, product_snapshot, quantity, unit_price, total_price, created_at) FROM stdin;
\.


--
-- Data for Name: store_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_orders (id, order_number, company_id, user_id, status, subtotal, tax_amount, shipping_amount, total_amount, currency, stripe_payment_intent_id, stripe_checkout_session_id, customer_email, customer_name, customer_phone, shipping_address, is_gift, gift_recipient_name, gift_note, gift_acceptance_acknowledged, tracking_code, tracking_url, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: store_product_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_product_categories (id, slug, name, description, display_order, is_active, created_at, code) FROM stdin;
3	ebooks	E-books	Livros digitais e Materiais educativos	1	t	2026-01-22 20:41:18.345862	EBK
2	brindes	Brindes	Brindes e itens promocionais	2	t	2026-01-22 20:41:18.345862	BRDS
5	vestuario	Vestuario	Uniformes e roupas corporativas	4	t	2026-01-22 20:41:18.345862	VEST
4	escritorio	Escritorio	Materiais para escritório	3	t	2026-01-22 20:41:18.345862	ESCR
\.


--
-- Data for Name: store_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.store_products (id, category_id, name, slug, short_description, long_description, product_type, fulfillment_type, price_amount, compare_at_price, price_currency, inventory_qty, allow_backorder, sku, stripe_product_id, stripe_price_id, primary_image_url, gallery_urls, is_featured, is_active, seo_title, seo_description, created_at, updated_at, sizes) FROM stdin;
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_plans (id, code, name, description, price, "interval", base_users, additional_user_price, features, popular, active, sort_order, created_at, updated_at) FROM stdin;
1	free	Gratuito	Acesso as calculadoras de frete e armazenagem	0	always	1	0	{"Calculadora de Frete com ICMS","Calculadora de Armazenagem","3 calculos gratuitos","1 usuario incluido"}	f	t	1	2026-01-04 10:11:28.371874	2026-01-04 10:11:28.371874
2	professional	Profissional	Todas as ferramentas para gestão comercial completa	39900	month	1	4900	{"Tudo do plano Gratuito","Calculos ilimitados","CRM de Clientes","Pipeline de Vendas (Kanban)","Checklists 20 Departamentos","Calendario Comercial","Ata Plano de Acao","Gestao Financeira","1 usuário incluso (+ R$49 adicional)","Suporte por email"}	t	t	2	2026-01-04 10:11:28.377921	2026-01-09 16:46:43.999
3	corporate	Corporativo	Para operações em grande escala com múltiplas filiais	129900	month	1	4900	{"Tudo do plano Profissional","Gestao de Tarefas e Projetos","Indicadores e Curva ABC","Modulo de Marketing","Integracoes com ERP (KMM/QualP)","Multi-empresas (Matriz/Filiais)","1 usuário incluso (+ R$49 adicional)","Suporte prioritario","Canal Dedicado de Atendimento"}	f	t	3	2026-01-04 10:11:28.386901	2026-01-09 16:47:29.632
\.


--
-- Data for Name: support_ticket_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_ticket_messages (id, ticket_id, user_id, message, is_internal, attachments, created_at) FROM stdin;
1	1	51563272	teste	f	[]	2026-01-23 00:27:24.980878
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_tickets (id, company_id, user_id, ticket_number, subject, description, category, priority, status, assigned_to, resolution, resolved_at, closed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, company_id, project_id, client_id, meeting_record_id, action_item_id, title, description, assigned_to, assigned_user_id, priority, status, due_date, completed_at, estimated_hours, actual_hours, tags, created_at, updated_at, assigned_email, reminder_sent) FROM stdin;
1	1	\N	\N	3	1	Criar nova tabela	Acao da ata: INDICADORES	Marcia	\N	medium	todo	2025-12-26 00:00:00	\N	\N	\N	\N	2025-12-19 02:56:52.406905	2025-12-19 02:56:52.406905	marciacguimaraes@gmail.com	f
2	1	\N	\N	4	2	Criar tabela	Acao da ata: INDICADORES	Marcia	\N	medium	todo	2025-12-31 00:00:00	\N	\N	\N	\N	2025-12-19 03:07:02.460045	2025-12-19 03:07:02.460045	marciacguimaraes@gmail.com	t
\.


--
-- Data for Name: user_role_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_role_assignments (id, user_id, company_id, role_id, assigned_by, assigned_at, expires_at, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, first_name, last_name, profile_image_url, company_id, role, created_at, updated_at, phone, cnpj, stripe_customer_id, stripe_subscription_id, subscription_status, subscription_end_date, active_session_token, lgpd_consent_at, cookie_consent_at, password, free_calculations_remaining, total_calculations_used, last_calculation_at, razao_social, tipo_empresa, segmento, departamento, vendedor, perfil_conta, inscricao_estadual, inscricao_estadual_isento, inscricao_municipal, nome_fantasia, password_reset_token, password_reset_expiry, user_categories, segmentos, account_status, account_status_reason, approved_at, approved_by, selected_plan, additional_users, full_access_granted, full_access_granted_at, full_access_granted_by, is_active, deactivated_at, deactivated_by) FROM stdin;
74cbc1a7-e8d2-44c1-beee-920df3a49983	marciacguimaraes@gmail.com	marcia	guimaraes	\N	1	user	2025-12-18 23:48:37.526506	2026-01-04 09:38:24.404	41998903362	08670140000189	cus_TejV345Z7nKSqB	\N	free	\N	ce3de6c90dda9c6dbb4b3a607430a43f6ee080887e0417999573887d7ca03e27	\N	\N	$2b$12$OLYH4ybkrQYxkLTRDJ09GuM3KK7nv6QwLVtCGXmUKHxKrz4wcv/Py	3	0	\N	\N	\N	\N	\N	\N	colaborador	\N	f	\N	\N	\N	\N	\N	\N	approved	\N	2026-01-04 04:39:15.795378	setup-api	free	0	f	\N	\N	t	\N	\N
51563272	comercial@mcgconsultoria.com.br	Admin	MCG	https://storage.googleapis.com/replit/images/1766078494112_10061d41e32c4ac981aa261a561e42c7.png	1	admin_mcg	2025-12-18 20:32:53.087922	2026-01-22 23:14:20.066	\N	\N	\N	\N	free	\N	53e71e61a39a747b22d9003a13c9bb23e305040605cddf0de3474a4d65fbb773	\N	\N	$2b$12$4wMwq.WqPEmBVYBCpFu.1e6LMEacf/AGb.JeJaLF3B6OaS6aQz3VC	3	0	\N	\N	\N	\N	\N	\N	administrador	\N	f	\N	\N	2e81a899c822f16f3f213bda356e2284a41dd7fb8b9f71950a480d1056ce84a1	2025-12-23 08:26:27.973	\N	\N	approved	\N	2026-01-02 07:55:57.651928	\N	free	0	f	\N	\N	t	\N	\N
85878cbd-4139-480a-a772-b66ee26a61f6	mcgconsultoriacomercial@gmail.com	Marcia	Guimaraes	\N	\N	user	2026-01-04 04:39:19.549368	2026-01-04 09:43:23.998	\N	25806775852	\N	\N	free	\N	\N	\N	\N	$2b$12$OLYH4ybkrQYxkLTRDJ09GuM3KK7nv6QwLVtCGXmUKHxKrz4wcv/Py	3	0	\N	\N	\N	\N	\N	\N	administrador	\N	f	\N	\N	\N	\N	\N	\N	approved	\N	2026-01-04 04:39:19.549368	setup-api	free	0	f	\N	\N	t	\N	\N
\.


--
-- Data for Name: whatsapp_agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.whatsapp_agents (id, name, email, phone, is_available, max_concurrent_chats, current_chat_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.whatsapp_config (id, phone_number, business_name, provider, api_key, webhook_url, welcome_message, business_hours_start, business_hours_end, outside_hours_message, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.whatsapp_conversations (id, customer_phone, customer_name, current_step_id, status, assigned_agent_id, last_message_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_journey_steps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.whatsapp_journey_steps (id, name, description, step_type, parent_id, "order", trigger_keywords, message_template, button_options, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.whatsapp_messages (id, conversation_id, direction, message_type, content, media_url, sender_type, agent_id, status, created_at) FROM stdin;
\.


--
-- Data for Name: _managed_webhooks; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe._managed_webhooks (id, object, url, enabled_events, description, enabled, livemode, metadata, secret, status, api_version, created, updated_at, last_synced_at, account_id) FROM stdin;
we_1Sfo5mI42aQf1ax4ES4RqBXS	webhook_endpoint	https://7270f3b0-6278-475b-9d6c-57a4c9feb702-00-r2u8waium5k6.picard.replit.dev/api/stripe/webhook	["charge.captured", "charge.dispute.closed", "charge.dispute.created", "charge.dispute.funds_reinstated", "charge.dispute.funds_withdrawn", "charge.dispute.updated", "charge.expired", "charge.failed", "charge.pending", "charge.refund.updated", "charge.refunded", "charge.succeeded", "charge.updated", "checkout.session.async_payment_failed", "checkout.session.async_payment_succeeded", "checkout.session.completed", "checkout.session.expired", "credit_note.created", "credit_note.updated", "credit_note.voided", "customer.created", "customer.deleted", "customer.subscription.created", "customer.subscription.deleted", "customer.subscription.paused", "customer.subscription.pending_update_applied", "customer.subscription.pending_update_expired", "customer.subscription.resumed", "customer.subscription.trial_will_end", "customer.subscription.updated", "customer.tax_id.created", "customer.tax_id.deleted", "customer.tax_id.updated", "customer.updated", "entitlements.active_entitlement_summary.updated", "invoice.created", "invoice.deleted", "invoice.finalization_failed", "invoice.finalized", "invoice.marked_uncollectible", "invoice.paid", "invoice.payment_action_required", "invoice.payment_failed", "invoice.payment_succeeded", "invoice.sent", "invoice.upcoming", "invoice.updated", "invoice.voided", "payment_intent.amount_capturable_updated", "payment_intent.canceled", "payment_intent.created", "payment_intent.partially_funded", "payment_intent.payment_failed", "payment_intent.processing", "payment_intent.requires_action", "payment_intent.succeeded", "payment_method.attached", "payment_method.automatically_updated", "payment_method.card_automatically_updated", "payment_method.detached", "payment_method.updated", "plan.created", "plan.deleted", "plan.updated", "price.created", "price.deleted", "price.updated", "product.created", "product.deleted", "product.updated", "radar.early_fraud_warning.created", "radar.early_fraud_warning.updated", "refund.created", "refund.failed", "refund.updated", "review.closed", "review.opened", "setup_intent.canceled", "setup_intent.created", "setup_intent.requires_action", "setup_intent.setup_failed", "setup_intent.succeeded", "subscription_schedule.aborted", "subscription_schedule.canceled", "subscription_schedule.completed", "subscription_schedule.created", "subscription_schedule.expiring", "subscription_schedule.released", "subscription_schedule.updated"]	\N	\N	f	{"managed_by": "stripe-sync"}	whsec_txmQ3bnay86sEGR5u9IbsvAEXqxI9Rc3	enabled	\N	1766090794	2025-12-18 20:46:34.293529+00	2025-12-18 20:46:34.292+00	acct_1SfkJ6I42aQf1ax4
\.


--
-- Data for Name: _migrations; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe._migrations (id, name, hash, executed_at) FROM stdin;
0	initial_migration	c18983eedaa79cc2f6d92727d70c4f772256ef3d	2025-12-18 20:46:24.832975
1	products	b99ffc23df668166b94156f438bfa41818d4e80c	2025-12-18 20:46:24.837292
2	customers	33e481247ddc217f4e27ad10dfe5430097981670	2025-12-18 20:46:24.846206
3	prices	7d5ff35640651606cc24cec8a73ff7c02492ecdf	2025-12-18 20:46:24.854164
4	subscriptions	2cc6121a943c2a623c604e5ab12118a57a6c329a	2025-12-18 20:46:24.86944
5	invoices	7fbb4ccb4ed76a830552520739aaa163559771b1	2025-12-18 20:46:24.882123
6	charges	fb284ed969f033f5ce19f479b7a7e27871bddf09	2025-12-18 20:46:24.892109
7	coupons	7ed6ec4133f120675fd7888c0477b6281743fede	2025-12-18 20:46:24.900109
8	disputes	29bdb083725efe84252647f043f5f91cd0dabf43	2025-12-18 20:46:24.907817
9	events	b28cb55b5b69a9f52ef519260210cd76eea3c84e	2025-12-18 20:46:24.917011
10	payouts	69d1050b88bba1024cea4a671f9633ce7bfe25ff	2025-12-18 20:46:24.925379
11	plans	fc1ae945e86d1222a59cbcd3ae7e81a3a282a60c	2025-12-18 20:46:24.93516
12	add_updated_at	1d80945ef050a17a26e35e9983a58178262470f2	2025-12-18 20:46:24.943887
13	add_subscription_items	2aa63409bfe910add833155ad7468cdab844e0f1	2025-12-18 20:46:24.956858
14	migrate_subscription_items	8c2a798b44a8a0d83ede6f50ea7113064ecc1807	2025-12-18 20:46:24.964913
15	add_customer_deleted	6886ddfd8c129d3c4b39b59519f92618b397b395	2025-12-18 20:46:24.969091
16	add_invoice_indexes	d6bb9a09d5bdf580986ed14f55db71227a4d356d	2025-12-18 20:46:24.973051
17	drop_charges_unavailable_columns	61cd5adec4ae2c308d2c33d1b0ed203c7d074d6a	2025-12-18 20:46:24.981998
18	setup_intents	1d45d0fa47fc145f636c9e3c1ea692417fbb870d	2025-12-18 20:46:24.992716
19	payment_methods	705bdb15b50f1a97260b4f243008b8a34d23fb09	2025-12-18 20:46:25.004721
20	disputes_payment_intent_created_idx	18b2cecd7c097a7ea3b3f125f228e8790288d5ca	2025-12-18 20:46:25.016153
21	payment_intent	b1f194ff521b373c4c7cf220c0feadc253ebff0b	2025-12-18 20:46:25.023121
22	adjust_plans	e4eae536b0bc98ee14d78e818003952636ee877c	2025-12-18 20:46:25.040357
23	invoice_deleted	78e864c3146174fee7d08f05226b02d931d5b2ae	2025-12-18 20:46:25.045301
24	subscription_schedules	85fa6adb3815619bb17e1dafb00956ff548f7332	2025-12-18 20:46:25.052375
25	tax_ids	3f9a1163533f9e60a53d61dae5e451ab937584d9	2025-12-18 20:46:25.061647
26	credit_notes	e099b6b04ee607ee868d82af5193373c3fc266d2	2025-12-18 20:46:25.07372
27	add_marketing_features_to_products	6ed1774b0a9606c5937b2385d61057408193e8a7	2025-12-18 20:46:25.087486
28	early_fraud_warning	e615b0b73fa13d3b0508a1956d496d516f0ebf40	2025-12-18 20:46:25.091693
29	reviews	dd3f914139725a7934dc1062de4cc05aece77aea	2025-12-18 20:46:25.106365
30	refunds	f76c4e273eccdc96616424d73967a9bea3baac4e	2025-12-18 20:46:25.120149
31	add_default_price	6d10566a68bc632831fa25332727d8ff842caec5	2025-12-18 20:46:25.138068
32	update_subscription_items	e894858d46840ba4be5ea093cdc150728bd1d66f	2025-12-18 20:46:25.141706
33	add_last_synced_at	43124eb65b18b70c54d57d2b4fcd5dae718a200f	2025-12-18 20:46:25.145913
34	remove_foreign_keys	e72ec19f3232cf6e6b7308ebab80341c2341745f	2025-12-18 20:46:25.150455
35	checkout_sessions	dc294f5bb1a4d613be695160b38a714986800a75	2025-12-18 20:46:25.154627
36	checkout_session_line_items	82c8cfce86d68db63a9fa8de973bfe60c91342dd	2025-12-18 20:46:25.173175
37	add_features	c68a2c2b7e3808eed28c8828b2ffd3a2c9bf2bd4	2025-12-18 20:46:25.187351
38	active_entitlement	5b3858e7a52212b01e7f338cf08e29767ab362af	2025-12-18 20:46:25.197828
39	add_paused_to_subscription_status	09012b5d128f6ba25b0c8f69a1203546cf1c9f10	2025-12-18 20:46:25.213063
40	managed_webhooks	1d453dfd0e27ff0c2de97955c4ec03919af0af7f	2025-12-18 20:46:25.216409
41	rename_managed_webhooks	ad7cd1e4971a50790bf997cd157f3403d294484f	2025-12-18 20:46:25.233127
42	convert_to_jsonb_generated_columns	e0703a0e5cd9d97db53d773ada1983553e37813c	2025-12-18 20:46:25.236534
43	add_account_id	9a6beffdd0972e3657b7118b2c5001be1f815faf	2025-12-18 20:46:28.825453
44	make_account_id_required	05c1e9145220e905e0c1ca5329851acaf7e9e506	2025-12-18 20:46:28.836221
45	sync_status	2f88c4883fa885a6eaa23b8b02da958ca77a1c21	2025-12-18 20:46:28.859229
46	sync_status_per_account	b1f1f3d4fdb4b4cf4e489d4b195c7f0f97f9f27c	2025-12-18 20:46:28.874461
47	api_key_hashes	8046e4c57544b8eae277b057d201a28a4529ffe3	2025-12-18 20:46:28.907013
48	rename_reserved_columns	e32290f655550ed308a7f2dcb5b0114e49a0558e	2025-12-18 20:46:28.910661
49	remove_redundant_underscores_from_metadata_tables	96d6f3a54e17d8e19abd022a030a95a6161bf73e	2025-12-18 20:46:32.933929
50	rename_id_to_match_stripe_api	c5300c5a10081c033dab9961f4e3cd6a2440c2b6	2025-12-18 20:46:32.948727
51	remove_webhook_uuid	289bee08167858dbf4d04ca184f42681660ebb66	2025-12-18 20:46:33.251044
52	webhook_url_uniqueness	d02aec1815ce3a108b8a1def1ff24e865b26db70	2025-12-18 20:46:33.255182
\.


--
-- Data for Name: _sync_status; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe._sync_status (id, resource, status, last_synced_at, last_incremental_cursor, error_message, updated_at, account_id) FROM stdin;
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.accounts (_raw_data, first_synced_at, _last_synced_at, _updated_at, api_key_hashes) FROM stdin;
{"id": "acct_1SfkJ6I42aQf1ax4", "type": "standard", "email": null, "object": "account", "country": "US", "settings": {"payouts": {"schedule": {"interval": "daily", "delay_days": 2}, "statement_descriptor": null, "debit_negative_balances": true}, "branding": {"icon": null, "logo": null, "primary_color": null, "secondary_color": null}, "invoices": {"default_account_tax_ids": null, "hosted_payment_method_save": "offer"}, "payments": {"statement_descriptor": null, "statement_descriptor_kana": null, "statement_descriptor_kanji": null}, "dashboard": {"timezone": "Etc/UTC", "display_name": "app Sandbox"}, "card_issuing": {"tos_acceptance": {"ip": null, "date": null}}, "card_payments": {"statement_descriptor_prefix": null, "statement_descriptor_prefix_kana": null, "statement_descriptor_prefix_kanji": null}, "bacs_debit_payments": {"display_name": null, "service_user_number": null}, "sepa_debit_payments": {}}, "controller": {"type": "account"}, "capabilities": {}, "business_type": null, "charges_enabled": false, "payouts_enabled": false, "business_profile": {"mcc": null, "url": null, "name": null, "support_url": null, "support_email": null, "support_phone": null, "annual_revenue": null, "support_address": null, "estimated_worker_count": null, "minority_owned_business_designation": null}, "default_currency": "usd", "details_submitted": false}	2025-12-18 20:46:33.811425+00	2025-12-18 20:46:33.811425+00	2025-12-18 20:46:33.811425+00	{7b514941e279b57a4bd06272194bbf97f9275d5eec80630dc55d98aeeea70e20}
\.


--
-- Data for Name: active_entitlements; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.active_entitlements (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: charges; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.charges (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: checkout_session_line_items; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.checkout_session_line_items (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
2025-12-24 07:30:08.186311+00	2025-12-24 07:30:07+00	{"id": "li_1ShQ2lI42aQf1ax4hS9b6Moz", "price": "price_1ShP2lI42aQf1ax4G7LfLrZm", "object": "item", "currency": "brl", "metadata": {}, "quantity": 1, "amount_tax": 0, "description": "Profissional", "amount_total": 0, "amount_discount": 0, "amount_subtotal": 0, "checkout_session": "cs_test_b1QVmkNS7Ojxctr1NC0uNzllKcoHyiBFGLJAJFgLSeNmz0we8OYEUlGgNd"}	acct_1SfkJ6I42aQf1ax4
2025-12-24 07:30:35.997311+00	2025-12-24 07:30:35+00	{"id": "li_1ShQ3DI42aQf1ax4Vbyq9tQu", "price": "price_1ShP2mI42aQf1ax42AJm8gPA", "object": "item", "currency": "brl", "metadata": {}, "quantity": 1, "amount_tax": 0, "description": "Corporativo", "amount_total": 0, "amount_discount": 0, "amount_subtotal": 0, "checkout_session": "cs_test_b1Q5fcZFKnconlKZNOnjL3LWrdwf6rsEofPXzenWP4u7weHMq32eRyz1yb"}	acct_1SfkJ6I42aQf1ax4
2025-12-24 07:31:03.92733+00	2025-12-24 07:31:03+00	{"id": "li_1ShQ3fI42aQf1ax4H8H8zhJY", "price": "price_1ShP2nI42aQf1ax42JKN6mTw", "object": "item", "currency": "brl", "metadata": {}, "quantity": 1, "amount_tax": 0, "description": "Checklist Operacional", "amount_total": 0, "amount_discount": 0, "amount_subtotal": 0, "checkout_session": "cs_test_b1hKtIGxUhck3i0PZq1r2DVbcSXb1O4XnleiByin0FijReXXIg61VqN8Yu"}	acct_1SfkJ6I42aQf1ax4
\.


--
-- Data for Name: checkout_sessions; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.checkout_sessions (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
2025-12-24 07:30:07.825248+00	2025-12-24 07:30:07+00	{"id": "cs_test_b1QVmkNS7Ojxctr1NC0uNzllKcoHyiBFGLJAJFgLSeNmz0we8OYEUlGgNd", "url": null, "mode": "subscription", "locale": "pt-BR", "object": "checkout.session", "status": "expired", "consent": null, "created": 1766475007, "invoice": null, "ui_mode": "hosted", "currency": "brl", "customer": "cus_TejV345Z7nKSqB", "livemode": false, "metadata": {}, "discounts": [], "cancel_url": "https://7270f3b0-6278-475b-9d6c-57a4c9feb702-00-r2u8waium5k6.picard.replit.dev/checkout/cancel", "expires_at": 1766561407, "custom_text": {"submit": null, "after_submit": null, "shipping_address": null, "terms_of_service_acceptance": null}, "permissions": null, "submit_type": null, "success_url": "https://7270f3b0-6278-475b-9d6c-57a4c9feb702-00-r2u8waium5k6.picard.replit.dev/checkout/success", "amount_total": 0, "payment_link": null, "setup_intent": null, "subscription": null, "automatic_tax": {"status": null, "enabled": false, "provider": null, "liability": null}, "client_secret": null, "custom_fields": [], "shipping_cost": null, "total_details": {"amount_tax": 0, "amount_discount": 0, "amount_shipping": 0}, "customer_email": null, "origin_context": null, "payment_intent": null, "payment_status": "unpaid", "recovered_from": null, "wallet_options": null, "amount_subtotal": 0, "adaptive_pricing": {"enabled": false}, "after_expiration": null, "customer_account": null, "customer_details": {"name": null, "email": "marciacguimaraes@gmail.com", "phone": null, "address": null, "tax_ids": null, "tax_exempt": "none", "business_name": null, "individual_name": null}, "invoice_creation": null, "shipping_options": [], "branding_settings": {"icon": null, "logo": null, "font_family": "default", "border_style": "rounded", "button_color": "#0074d4", "display_name": "app Sandbox", "background_color": "#ffffff"}, "customer_creation": null, "consent_collection": null, "client_reference_id": null, "currency_conversion": null, "payment_method_types": ["card"], "allow_promotion_codes": true, "collected_information": {"business_name": null, "individual_name": null, "shipping_details": null}, "payment_method_options": {"card": {"request_three_d_secure": "automatic"}}, "phone_number_collection": {"enabled": false}, "payment_method_collection": "always", "billing_address_collection": null, "shipping_address_collection": null, "saved_payment_method_options": {"payment_method_save": null, "payment_method_remove": "disabled", "allow_redisplay_filters": ["always"]}, "payment_method_configuration_details": null}	acct_1SfkJ6I42aQf1ax4
2025-12-24 07:30:35.768481+00	2025-12-24 07:30:35+00	{"id": "cs_test_b1Q5fcZFKnconlKZNOnjL3LWrdwf6rsEofPXzenWP4u7weHMq32eRyz1yb", "url": null, "mode": "subscription", "locale": "pt-BR", "object": "checkout.session", "status": "expired", "consent": null, "created": 1766475035, "invoice": null, "ui_mode": "hosted", "currency": "brl", "customer": "cus_TejV345Z7nKSqB", "livemode": false, "metadata": {}, "discounts": [], "cancel_url": "https://7270f3b0-6278-475b-9d6c-57a4c9feb702-00-r2u8waium5k6.picard.replit.dev/checkout/cancel", "expires_at": 1766561435, "custom_text": {"submit": null, "after_submit": null, "shipping_address": null, "terms_of_service_acceptance": null}, "permissions": null, "submit_type": null, "success_url": "https://7270f3b0-6278-475b-9d6c-57a4c9feb702-00-r2u8waium5k6.picard.replit.dev/checkout/success", "amount_total": 0, "payment_link": null, "setup_intent": null, "subscription": null, "automatic_tax": {"status": null, "enabled": false, "provider": null, "liability": null}, "client_secret": null, "custom_fields": [], "shipping_cost": null, "total_details": {"amount_tax": 0, "amount_discount": 0, "amount_shipping": 0}, "customer_email": null, "origin_context": null, "payment_intent": null, "payment_status": "unpaid", "recovered_from": null, "wallet_options": null, "amount_subtotal": 0, "adaptive_pricing": {"enabled": false}, "after_expiration": null, "customer_account": null, "customer_details": {"name": null, "email": "marciacguimaraes@gmail.com", "phone": null, "address": null, "tax_ids": null, "tax_exempt": "none", "business_name": null, "individual_name": null}, "invoice_creation": null, "shipping_options": [], "branding_settings": {"icon": null, "logo": null, "font_family": "default", "border_style": "rounded", "button_color": "#0074d4", "display_name": "app Sandbox", "background_color": "#ffffff"}, "customer_creation": null, "consent_collection": null, "client_reference_id": null, "currency_conversion": null, "payment_method_types": ["card"], "allow_promotion_codes": true, "collected_information": {"business_name": null, "individual_name": null, "shipping_details": null}, "payment_method_options": {"card": {"request_three_d_secure": "automatic"}}, "phone_number_collection": {"enabled": false}, "payment_method_collection": "always", "billing_address_collection": null, "shipping_address_collection": null, "saved_payment_method_options": {"payment_method_save": null, "payment_method_remove": "disabled", "allow_redisplay_filters": ["always"]}, "payment_method_configuration_details": null}	acct_1SfkJ6I42aQf1ax4
2025-12-24 07:31:03.749867+00	2025-12-24 07:31:03+00	{"id": "cs_test_b1hKtIGxUhck3i0PZq1r2DVbcSXb1O4XnleiByin0FijReXXIg61VqN8Yu", "url": null, "mode": "subscription", "locale": "pt-BR", "object": "checkout.session", "status": "expired", "consent": null, "created": 1766475063, "invoice": null, "ui_mode": "hosted", "currency": "brl", "customer": "cus_TejV345Z7nKSqB", "livemode": false, "metadata": {}, "discounts": [], "cancel_url": "https://7270f3b0-6278-475b-9d6c-57a4c9feb702-00-r2u8waium5k6.picard.replit.dev/checkout/cancel", "expires_at": 1766561463, "custom_text": {"submit": null, "after_submit": null, "shipping_address": null, "terms_of_service_acceptance": null}, "permissions": null, "submit_type": null, "success_url": "https://7270f3b0-6278-475b-9d6c-57a4c9feb702-00-r2u8waium5k6.picard.replit.dev/checkout/success", "amount_total": 0, "payment_link": null, "setup_intent": null, "subscription": null, "automatic_tax": {"status": null, "enabled": false, "provider": null, "liability": null}, "client_secret": null, "custom_fields": [], "shipping_cost": null, "total_details": {"amount_tax": 0, "amount_discount": 0, "amount_shipping": 0}, "customer_email": null, "origin_context": null, "payment_intent": null, "payment_status": "unpaid", "recovered_from": null, "wallet_options": null, "amount_subtotal": 0, "adaptive_pricing": {"enabled": false}, "after_expiration": null, "customer_account": null, "customer_details": {"name": null, "email": "marciacguimaraes@gmail.com", "phone": null, "address": null, "tax_ids": null, "tax_exempt": "none", "business_name": null, "individual_name": null}, "invoice_creation": null, "shipping_options": [], "branding_settings": {"icon": null, "logo": null, "font_family": "default", "border_style": "rounded", "button_color": "#0074d4", "display_name": "app Sandbox", "background_color": "#ffffff"}, "customer_creation": null, "consent_collection": null, "client_reference_id": null, "currency_conversion": null, "payment_method_types": ["card"], "allow_promotion_codes": true, "collected_information": {"business_name": null, "individual_name": null, "shipping_details": null}, "payment_method_options": {"card": {"request_three_d_secure": "automatic"}}, "phone_number_collection": {"enabled": false}, "payment_method_collection": "always", "billing_address_collection": null, "shipping_address_collection": null, "saved_payment_method_options": {"payment_method_save": null, "payment_method_remove": "disabled", "allow_redisplay_filters": ["always"]}, "payment_method_configuration_details": null}	acct_1SfkJ6I42aQf1ax4
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.coupons (_updated_at, _last_synced_at, _raw_data) FROM stdin;
\.


--
-- Data for Name: credit_notes; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.credit_notes (_last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.customers (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
2025-12-23 07:30:07.291355+00	2025-12-23 07:30:06+00	{"id": "cus_TejV345Z7nKSqB", "name": null, "email": "marciacguimaraes@gmail.com", "phone": "41998903362", "object": "customer", "address": null, "balance": 0, "created": 1766475006, "currency": null, "discount": null, "livemode": false, "metadata": {"cnpj": "08670140000189", "userId": "74cbc1a7-e8d2-44c1-beee-920df3a49983"}, "shipping": null, "delinquent": false, "tax_exempt": "none", "test_clock": null, "description": null, "default_source": null, "invoice_prefix": "JX9Q0YJU", "customer_account": null, "invoice_settings": {"footer": null, "custom_fields": null, "rendering_options": null, "default_payment_method": null}, "preferred_locales": [], "next_invoice_sequence": 1}	acct_1SfkJ6I42aQf1ax4
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.disputes (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: early_fraud_warnings; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.early_fraud_warnings (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.events (_updated_at, _last_synced_at, _raw_data) FROM stdin;
\.


--
-- Data for Name: features; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.features (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.invoices (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: payment_intents; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.payment_intents (_last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.payment_methods (_last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: payouts; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.payouts (_updated_at, _last_synced_at, _raw_data) FROM stdin;
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.plans (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
2025-12-23 06:26:03.591273+00	2025-12-23 06:26:03+00	{"id": "price_1ShP2lI42aQf1ax41vUoZxyD", "meter": null, "active": true, "amount": 0, "object": "plan", "created": 1766471163, "product": "prod_TeiT0cZEivrlPv", "currency": "brl", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "0", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:05.013743+00	2025-12-23 06:26:04+00	{"id": "price_1ShP2mI42aQf1ax4lzjdQ6vl", "meter": null, "active": true, "amount": 4700, "object": "plan", "created": 1766471164, "product": "prod_TeiTaOHj4ILZqI", "currency": "brl", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "4700", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:05.49935+00	2025-12-23 06:26:05+00	{"id": "price_1ShP2nI42aQf1ax4RNzJWtDV", "meter": null, "active": true, "amount": 4700, "object": "plan", "created": 1766471165, "product": "prod_TeiT7bJtlTlTBV", "currency": "brl", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "4700", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:06.091293+00	2025-12-23 06:26:05+00	{"id": "price_1ShP2nI42aQf1ax42JKN6mTw", "meter": null, "active": true, "amount": 9700, "object": "plan", "created": 1766471165, "product": "prod_TeiTnGMb4IzoZh", "currency": "brl", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "9700", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:06.517499+00	2025-12-23 06:26:06+00	{"id": "price_1ShP2oI42aQf1ax4rUOxjPCj", "meter": null, "active": true, "amount": 4700, "object": "plan", "created": 1766471166, "product": "prod_TeiTgEsZFgb8iT", "currency": "brl", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "4700", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:06.948175+00	2025-12-23 06:26:06+00	{"id": "price_1ShP2oI42aQf1ax4hdcI2kFm", "meter": null, "active": true, "amount": 4700, "object": "plan", "created": 1766471166, "product": "prod_TeiTijXFPBs50v", "currency": "brl", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "4700", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1SfkJ6I42aQf1ax4
2026-01-04 02:24:19.75324+00	2026-01-04 02:24:19+00	{"id": "price_1ShP2mI42aQf1ax42AJm8gPA", "meter": null, "active": false, "amount": 59700, "object": "plan", "created": 1766471164, "product": "prod_TeiTxm653fPLFQ", "currency": "brl", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "59700", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1SfkJ6I42aQf1ax4
2026-01-04 02:24:19.846064+00	2026-01-04 02:24:19+00	{"id": "price_1SlgzPI42aQf1ax4JK6PAFyz", "meter": null, "active": true, "amount": 149900, "object": "plan", "created": 1767493459, "product": "prod_TeiTxm653fPLFQ", "currency": "brl", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "149900", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1SfkJ6I42aQf1ax4
2026-01-04 02:24:20.405242+00	2026-01-04 02:24:19+00	{"id": "price_1ShP2lI42aQf1ax4G7LfLrZm", "meter": null, "active": false, "amount": 29700, "object": "plan", "created": 1766471163, "product": "prod_TeiTr8JcVQq2WM", "currency": "brl", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "29700", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1SfkJ6I42aQf1ax4
2026-01-04 02:24:20.498243+00	2026-01-04 02:24:20+00	{"id": "price_1SlgzQI42aQf1ax4KTyL0HwA", "meter": null, "active": true, "amount": 49900, "object": "plan", "created": 1767493460, "product": "prod_TeiTr8JcVQq2WM", "currency": "brl", "interval": "month", "livemode": false, "metadata": {}, "nickname": null, "tiers_mode": null, "usage_type": "licensed", "amount_decimal": "49900", "billing_scheme": "per_unit", "interval_count": 1, "transform_usage": null, "trial_period_days": null}	acct_1SfkJ6I42aQf1ax4
\.


--
-- Data for Name: prices; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.prices (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
2025-12-23 06:26:03.649022+00	2025-12-23 06:26:03+00	{"id": "price_1ShP2lI42aQf1ax41vUoZxyD", "type": "recurring", "active": true, "object": "price", "created": 1766471163, "product": "prod_TeiT0cZEivrlPv", "currency": "brl", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 0, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "0"}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:05.062717+00	2025-12-23 06:26:04+00	{"id": "price_1ShP2mI42aQf1ax4lzjdQ6vl", "type": "recurring", "active": true, "object": "price", "created": 1766471164, "product": "prod_TeiTaOHj4ILZqI", "currency": "brl", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 4700, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "4700"}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:05.507546+00	2025-12-23 06:26:05+00	{"id": "price_1ShP2nI42aQf1ax4RNzJWtDV", "type": "recurring", "active": true, "object": "price", "created": 1766471165, "product": "prod_TeiT7bJtlTlTBV", "currency": "brl", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 4700, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "4700"}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:06.147146+00	2025-12-23 06:26:05+00	{"id": "price_1ShP2nI42aQf1ax42JKN6mTw", "type": "recurring", "active": true, "object": "price", "created": 1766471165, "product": "prod_TeiTnGMb4IzoZh", "currency": "brl", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 9700, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "9700"}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:06.534243+00	2025-12-23 06:26:06+00	{"id": "price_1ShP2oI42aQf1ax4rUOxjPCj", "type": "recurring", "active": true, "object": "price", "created": 1766471166, "product": "prod_TeiTgEsZFgb8iT", "currency": "brl", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 4700, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "4700"}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:06.982755+00	2025-12-23 06:26:06+00	{"id": "price_1ShP2oI42aQf1ax4hdcI2kFm", "type": "recurring", "active": true, "object": "price", "created": 1766471166, "product": "prod_TeiTijXFPBs50v", "currency": "brl", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 4700, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "4700"}	acct_1SfkJ6I42aQf1ax4
2026-01-04 02:24:19.697154+00	2026-01-04 02:24:19+00	{"id": "price_1ShP2mI42aQf1ax42AJm8gPA", "type": "recurring", "active": false, "object": "price", "created": 1766471164, "product": "prod_TeiTxm653fPLFQ", "currency": "brl", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 59700, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "59700"}	acct_1SfkJ6I42aQf1ax4
2026-01-04 02:24:20.396318+00	2026-01-04 02:24:19+00	{"id": "price_1ShP2lI42aQf1ax4G7LfLrZm", "type": "recurring", "active": false, "object": "price", "created": 1766471163, "product": "prod_TeiTr8JcVQq2WM", "currency": "brl", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 29700, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "29700"}	acct_1SfkJ6I42aQf1ax4
2026-01-04 02:24:19.892609+00	2026-01-04 02:24:19+00	{"id": "price_1SlgzPI42aQf1ax4JK6PAFyz", "type": "recurring", "active": true, "object": "price", "created": 1767493459, "product": "prod_TeiTxm653fPLFQ", "currency": "brl", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 149900, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "149900"}	acct_1SfkJ6I42aQf1ax4
2026-01-04 02:24:20.536219+00	2026-01-04 02:24:20+00	{"id": "price_1SlgzQI42aQf1ax4KTyL0HwA", "type": "recurring", "active": true, "object": "price", "created": 1767493460, "product": "prod_TeiTr8JcVQq2WM", "currency": "brl", "livemode": false, "metadata": {}, "nickname": null, "recurring": {"meter": null, "interval": "month", "usage_type": "licensed", "interval_count": 1, "trial_period_days": null}, "lookup_key": null, "tiers_mode": null, "unit_amount": 49900, "tax_behavior": "unspecified", "billing_scheme": "per_unit", "custom_unit_amount": null, "transform_quantity": null, "unit_amount_decimal": "49900"}	acct_1SfkJ6I42aQf1ax4
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.products (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
2025-12-23 06:26:03.397956+00	2025-12-23 06:26:02+00	{"id": "prod_TeiT0cZEivrlPv", "url": null, "name": "Gratuito", "type": "service", "active": true, "images": [], "object": "product", "created": 1766471162, "updated": 1766471162, "livemode": false, "metadata": {"order": "1", "features": "Calculadora de Frete com ICMS,Calculadora de Armazenagem,3 cálculos gratuitos", "plan_type": "free"}, "tax_code": null, "shippable": null, "attributes": [], "unit_label": null, "description": "Acesso às calculadoras de frete e armazenagem", "default_price": null, "marketing_features": [], "package_dimensions": null, "statement_descriptor": null}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:03.974402+00	2025-12-23 06:26:03+00	{"id": "prod_TeiTr8JcVQq2WM", "url": null, "name": "Profissional", "type": "service", "active": true, "images": [], "object": "product", "created": 1766471163, "updated": 1766471163, "livemode": false, "metadata": {"order": "2", "popular": "true", "features": "Tudo do plano Gratuito,Cálculos ilimitados,CRM de Clientes,Pipeline de Vendas (Kanban),Checklists de 15 Departamentos,Calendário Comercial,Ata Plano de Ação,Gestão Financeira,Suporte por email", "plan_type": "professional"}, "tax_code": null, "shippable": null, "attributes": [], "unit_label": null, "description": "Todas as ferramentas para gestão comercial completa", "default_price": null, "marketing_features": [], "package_dimensions": null, "statement_descriptor": null}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:04.349331+00	2025-12-23 06:26:03+00	{"id": "prod_TeiTxm653fPLFQ", "url": null, "name": "Corporativo", "type": "service", "active": true, "images": [], "object": "product", "created": 1766471163, "updated": 1766471163, "livemode": false, "metadata": {"order": "3", "features": "Tudo do plano Profissional,Multi-usuários (até 10),Gestão de Tarefas e Projetos,Indicadores e Curva ABC,Módulo de Marketing,Integrações personalizadas,Suporte prioritário,Treinamento dedicado", "plan_type": "enterprise"}, "tax_code": null, "shippable": null, "attributes": [], "unit_label": null, "description": "Para operações em grande escala", "default_price": null, "marketing_features": [], "package_dimensions": null, "statement_descriptor": null}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:04.784434+00	2025-12-23 06:26:04+00	{"id": "prod_TeiTaOHj4ILZqI", "url": null, "name": "Calculadora de Frete", "type": "service", "active": true, "images": [], "object": "product", "created": 1766471164, "updated": 1766471164, "livemode": false, "metadata": {"features": "Cálculo de frete,ICMS para todos os estados,Pedágios incluídos", "plan_type": "addon"}, "tax_code": null, "shippable": null, "attributes": [], "unit_label": null, "description": "Cálculo de frete com ICMS para 27 estados", "default_price": null, "marketing_features": [], "package_dimensions": null, "statement_descriptor": null}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:05.283202+00	2025-12-23 06:26:04+00	{"id": "prod_TeiT7bJtlTlTBV", "url": null, "name": "Calculadora de Armazenagem", "type": "service", "active": true, "images": [], "object": "product", "created": 1766471164, "updated": 1766471164, "livemode": false, "metadata": {"features": "Cálculo de armazenagem,Custos operacionais,Análise de paletização", "plan_type": "addon"}, "tax_code": null, "shippable": null, "attributes": [], "unit_label": null, "description": "Cálculo completo de custos de armazenagem", "default_price": null, "marketing_features": [], "package_dimensions": null, "statement_descriptor": null}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:05.738681+00	2025-12-23 06:26:05+00	{"id": "prod_TeiTnGMb4IzoZh", "url": null, "name": "Checklist Operacional", "type": "service", "active": true, "images": [], "object": "product", "created": 1766471165, "updated": 1766471165, "livemode": false, "metadata": {"features": "18 seções de checklist,Acompanhamento de progresso,Diagnóstico completo", "plan_type": "addon"}, "tax_code": null, "shippable": null, "attributes": [], "unit_label": null, "description": "Checklists para 20 departamentos de logística", "default_price": null, "marketing_features": [], "package_dimensions": null, "statement_descriptor": null}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:06.251791+00	2025-12-23 06:26:05+00	{"id": "prod_TeiTgEsZFgb8iT", "url": null, "name": "Ata Plano de Ação", "type": "service", "active": true, "images": [], "object": "product", "created": 1766471165, "updated": 1766471165, "livemode": false, "metadata": {"features": "Registro de reuniões,Itens de ação,Geração de PDF,Envio por email", "plan_type": "addon"}, "tax_code": null, "shippable": null, "attributes": [], "unit_label": null, "description": "Registro de reuniões com itens de ação e PDF", "default_price": null, "marketing_features": [], "package_dimensions": null, "statement_descriptor": null}	acct_1SfkJ6I42aQf1ax4
2025-12-23 06:26:06.741524+00	2025-12-23 06:26:06+00	{"id": "prod_TeiTijXFPBs50v", "url": null, "name": "RFI", "type": "service", "active": true, "images": [], "object": "product", "created": 1766471166, "updated": 1766471166, "livemode": false, "metadata": {"features": "Perfil técnico completo,Dados da empresa,Pronto para BIDs", "plan_type": "addon"}, "tax_code": null, "shippable": null, "attributes": [], "unit_label": null, "description": "Perfil técnico da empresa para participação em BIDs", "default_price": null, "marketing_features": [], "package_dimensions": null, "statement_descriptor": null}	acct_1SfkJ6I42aQf1ax4
\.


--
-- Data for Name: refunds; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.refunds (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.reviews (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: setup_intents; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.setup_intents (_last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: subscription_items; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.subscription_items (_last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: subscription_schedules; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.subscription_schedules (_last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.subscriptions (_updated_at, _last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Data for Name: tax_ids; Type: TABLE DATA; Schema: stripe; Owner: postgres
--

COPY stripe.tax_ids (_last_synced_at, _raw_data, _account_id) FROM stdin;
\.


--
-- Name: accounting_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accounting_entries_id_seq', 1, false);


--
-- Name: admin_contracts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_contracts_id_seq', 1, false);


--
-- Name: admin_financial_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_financial_records_id_seq', 1, false);


--
-- Name: admin_leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_leads_id_seq', 1, false);


--
-- Name: admin_partnerships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_partnerships_id_seq', 1, false);


--
-- Name: admin_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_posts_id_seq', 1, false);


--
-- Name: admin_project_deliverables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_project_deliverables_id_seq', 1, false);


--
-- Name: admin_project_phases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_project_phases_id_seq', 1, false);


--
-- Name: admin_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_projects_id_seq', 1, false);


--
-- Name: admin_proposals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_proposals_id_seq', 1, false);


--
-- Name: antt_freight_table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.antt_freight_table_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 5, true);


--
-- Name: bank_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_accounts_id_seq', 1, true);


--
-- Name: bank_integrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_integrations_id_seq', 1, false);


--
-- Name: bank_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_transactions_id_seq', 1, false);


--
-- Name: business_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.business_types_id_seq', 1, true);


--
-- Name: checklist_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checklist_attachments_id_seq', 1, false);


--
-- Name: checklist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checklist_items_id_seq', 1, false);


--
-- Name: checklist_sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checklist_sections_id_seq', 1, false);


--
-- Name: checklist_template_purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checklist_template_purchases_id_seq', 7, true);


--
-- Name: checklist_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checklist_templates_id_seq', 10, true);


--
-- Name: checklists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checklists_id_seq', 1, true);


--
-- Name: client_operations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_operations_id_seq', 1, false);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_id_seq', 1, true);


--
-- Name: commercial_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.commercial_events_id_seq', 3, true);


--
-- Name: commercial_flowcharts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.commercial_flowcharts_id_seq', 1, false);


--
-- Name: commercial_proposals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.commercial_proposals_id_seq', 2, true);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.companies_id_seq', 1, false);


--
-- Name: company_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_roles_id_seq', 5, true);


--
-- Name: company_team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_team_members_id_seq', 1, false);


--
-- Name: consulting_quote_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.consulting_quote_requests_id_seq', 1, true);


--
-- Name: contract_agreements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contract_agreements_id_seq', 1, false);


--
-- Name: contract_signatures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contract_signatures_id_seq', 1, false);


--
-- Name: contract_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contract_templates_id_seq', 1, false);


--
-- Name: cost_centers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cost_centers_id_seq', 15, true);


--
-- Name: diagnostic_leads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diagnostic_leads_id_seq', 1, false);


--
-- Name: digital_certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.digital_certificates_id_seq', 1, true);


--
-- Name: dre_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dre_accounts_id_seq', 29, true);


--
-- Name: ebook_volumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ebook_volumes_id_seq', 1, false);


--
-- Name: financial_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.financial_accounts_id_seq', 1, false);


--
-- Name: freight_calculations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.freight_calculations_id_seq', 1, false);


--
-- Name: irpf_assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.irpf_assets_id_seq', 1, false);


--
-- Name: irpf_declarations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.irpf_declarations_id_seq', 1, false);


--
-- Name: irpf_deductions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.irpf_deductions_id_seq', 1, false);


--
-- Name: irpf_dependents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.irpf_dependents_id_seq', 1, false);


--
-- Name: irpf_incomes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.irpf_incomes_id_seq', 1, false);


--
-- Name: irpj_das_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.irpj_das_payments_id_seq', 1, false);


--
-- Name: irpj_summaries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.irpj_summaries_id_seq', 1, false);


--
-- Name: market_segments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.market_segments_id_seq', 1, true);


--
-- Name: marketing_materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.marketing_materials_id_seq', 1, false);


--
-- Name: meeting_action_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meeting_action_items_id_seq', 2, true);


--
-- Name: meeting_objectives_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meeting_objectives_id_seq', 1, false);


--
-- Name: meeting_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.meeting_records_id_seq', 4, true);


--
-- Name: nfse_invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nfse_invoices_id_seq', 1, false);


--
-- Name: nfse_providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nfse_providers_id_seq', 1, false);


--
-- Name: operation_billing_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operation_billing_entries_id_seq', 1, false);


--
-- Name: operation_billing_goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operation_billing_goals_id_seq', 1, false);


--
-- Name: permission_definitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permission_definitions_id_seq', 47, true);


--
-- Name: personal_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_accounts_id_seq', 1, false);


--
-- Name: personal_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_categories_id_seq', 1, false);


--
-- Name: personal_cost_centers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_cost_centers_id_seq', 28, true);


--
-- Name: personal_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_transactions_id_seq', 1, false);


--
-- Name: product_cost_structures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_cost_structures_id_seq', 1, false);


--
-- Name: product_media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_media_id_seq', 2, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 1, false);


--
-- Name: proposal_routes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proposal_routes_id_seq', 1, true);


--
-- Name: rfis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rfis_id_seq', 1, false);


--
-- Name: saved_routes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.saved_routes_id_seq', 1, true);


--
-- Name: storage_calculations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.storage_calculations_id_seq', 1, false);


--
-- Name: store_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.store_order_items_id_seq', 1, false);


--
-- Name: store_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.store_orders_id_seq', 1, false);


--
-- Name: store_product_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.store_product_categories_id_seq', 5, true);


--
-- Name: store_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.store_products_id_seq', 2, true);


--
-- Name: subscription_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscription_plans_id_seq', 3, true);


--
-- Name: support_ticket_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.support_ticket_messages_id_seq', 1, true);


--
-- Name: support_tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.support_tickets_id_seq', 1, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 2, true);


--
-- Name: user_role_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_role_assignments_id_seq', 1, false);


--
-- Name: whatsapp_agents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.whatsapp_agents_id_seq', 1, false);


--
-- Name: whatsapp_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.whatsapp_config_id_seq', 1, false);


--
-- Name: whatsapp_conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.whatsapp_conversations_id_seq', 1, false);


--
-- Name: whatsapp_journey_steps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.whatsapp_journey_steps_id_seq', 1, false);


--
-- Name: whatsapp_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.whatsapp_messages_id_seq', 1, false);


--
-- Name: _sync_status_id_seq; Type: SEQUENCE SET; Schema: stripe; Owner: postgres
--

SELECT pg_catalog.setval('stripe._sync_status_id_seq', 1, false);


--
-- Name: accounting_entries accounting_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounting_entries
    ADD CONSTRAINT accounting_entries_pkey PRIMARY KEY (id);


--
-- Name: admin_contracts admin_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_contracts
    ADD CONSTRAINT admin_contracts_pkey PRIMARY KEY (id);


--
-- Name: admin_financial_records admin_financial_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_financial_records
    ADD CONSTRAINT admin_financial_records_pkey PRIMARY KEY (id);


--
-- Name: admin_leads admin_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_leads
    ADD CONSTRAINT admin_leads_pkey PRIMARY KEY (id);


--
-- Name: admin_partnerships admin_partnerships_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_partnerships
    ADD CONSTRAINT admin_partnerships_pkey PRIMARY KEY (id);


--
-- Name: admin_posts admin_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_posts
    ADD CONSTRAINT admin_posts_pkey PRIMARY KEY (id);


--
-- Name: admin_project_deliverables admin_project_deliverables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_project_deliverables
    ADD CONSTRAINT admin_project_deliverables_pkey PRIMARY KEY (id);


--
-- Name: admin_project_phases admin_project_phases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_project_phases
    ADD CONSTRAINT admin_project_phases_pkey PRIMARY KEY (id);


--
-- Name: admin_projects admin_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_projects
    ADD CONSTRAINT admin_projects_pkey PRIMARY KEY (id);


--
-- Name: admin_proposals admin_proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_proposals
    ADD CONSTRAINT admin_proposals_pkey PRIMARY KEY (id);


--
-- Name: antt_freight_table antt_freight_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.antt_freight_table
    ADD CONSTRAINT antt_freight_table_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: bank_integrations bank_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_integrations
    ADD CONSTRAINT bank_integrations_pkey PRIMARY KEY (id);


--
-- Name: bank_transactions bank_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_transactions
    ADD CONSTRAINT bank_transactions_pkey PRIMARY KEY (id);


--
-- Name: business_types business_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_types
    ADD CONSTRAINT business_types_pkey PRIMARY KEY (id);


--
-- Name: checklist_attachments checklist_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_attachments
    ADD CONSTRAINT checklist_attachments_pkey PRIMARY KEY (id);


--
-- Name: checklist_items checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_pkey PRIMARY KEY (id);


--
-- Name: checklist_sections checklist_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_sections
    ADD CONSTRAINT checklist_sections_pkey PRIMARY KEY (id);


--
-- Name: checklist_template_purchases checklist_template_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_template_purchases
    ADD CONSTRAINT checklist_template_purchases_pkey PRIMARY KEY (id);


--
-- Name: checklist_templates checklist_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_templates
    ADD CONSTRAINT checklist_templates_pkey PRIMARY KEY (id);


--
-- Name: checklists checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_pkey PRIMARY KEY (id);


--
-- Name: client_operations client_operations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_operations
    ADD CONSTRAINT client_operations_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: commercial_events commercial_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commercial_events
    ADD CONSTRAINT commercial_events_pkey PRIMARY KEY (id);


--
-- Name: commercial_flowcharts commercial_flowcharts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commercial_flowcharts
    ADD CONSTRAINT commercial_flowcharts_pkey PRIMARY KEY (id);


--
-- Name: commercial_proposals commercial_proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commercial_proposals
    ADD CONSTRAINT commercial_proposals_pkey PRIMARY KEY (id);


--
-- Name: commercial_proposals commercial_proposals_proposal_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.commercial_proposals
    ADD CONSTRAINT commercial_proposals_proposal_number_unique UNIQUE (proposal_number);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_roles company_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_roles
    ADD CONSTRAINT company_roles_pkey PRIMARY KEY (id);


--
-- Name: company_team_members company_team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_team_members
    ADD CONSTRAINT company_team_members_pkey PRIMARY KEY (id);


--
-- Name: consulting_quote_requests consulting_quote_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consulting_quote_requests
    ADD CONSTRAINT consulting_quote_requests_pkey PRIMARY KEY (id);


--
-- Name: contract_agreements contract_agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_agreements
    ADD CONSTRAINT contract_agreements_pkey PRIMARY KEY (id);


--
-- Name: contract_signatures contract_signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_signatures
    ADD CONSTRAINT contract_signatures_pkey PRIMARY KEY (id);


--
-- Name: contract_templates contract_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract_templates
    ADD CONSTRAINT contract_templates_pkey PRIMARY KEY (id);


--
-- Name: cost_centers cost_centers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_pkey PRIMARY KEY (id);


--
-- Name: diagnostic_leads diagnostic_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostic_leads
    ADD CONSTRAINT diagnostic_leads_pkey PRIMARY KEY (id);


--
-- Name: digital_certificates digital_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_certificates
    ADD CONSTRAINT digital_certificates_pkey PRIMARY KEY (id);


--
-- Name: dre_accounts dre_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dre_accounts
    ADD CONSTRAINT dre_accounts_pkey PRIMARY KEY (id);


--
-- Name: ebook_volumes ebook_volumes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ebook_volumes
    ADD CONSTRAINT ebook_volumes_pkey PRIMARY KEY (id);


--
-- Name: financial_accounts financial_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_accounts
    ADD CONSTRAINT financial_accounts_pkey PRIMARY KEY (id);


--
-- Name: freight_calculations freight_calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.freight_calculations
    ADD CONSTRAINT freight_calculations_pkey PRIMARY KEY (id);


--
-- Name: irpf_assets irpf_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irpf_assets
    ADD CONSTRAINT irpf_assets_pkey PRIMARY KEY (id);


--
-- Name: irpf_declarations irpf_declarations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irpf_declarations
    ADD CONSTRAINT irpf_declarations_pkey PRIMARY KEY (id);


--
-- Name: irpf_deductions irpf_deductions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irpf_deductions
    ADD CONSTRAINT irpf_deductions_pkey PRIMARY KEY (id);


--
-- Name: irpf_dependents irpf_dependents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irpf_dependents
    ADD CONSTRAINT irpf_dependents_pkey PRIMARY KEY (id);


--
-- Name: irpf_incomes irpf_incomes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irpf_incomes
    ADD CONSTRAINT irpf_incomes_pkey PRIMARY KEY (id);


--
-- Name: irpj_das_payments irpj_das_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irpj_das_payments
    ADD CONSTRAINT irpj_das_payments_pkey PRIMARY KEY (id);


--
-- Name: irpj_summaries irpj_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irpj_summaries
    ADD CONSTRAINT irpj_summaries_pkey PRIMARY KEY (id);


--
-- Name: market_segments market_segments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_segments
    ADD CONSTRAINT market_segments_pkey PRIMARY KEY (id);


--
-- Name: marketing_materials marketing_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_materials
    ADD CONSTRAINT marketing_materials_pkey PRIMARY KEY (id);


--
-- Name: meeting_action_items meeting_action_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_action_items
    ADD CONSTRAINT meeting_action_items_pkey PRIMARY KEY (id);


--
-- Name: meeting_objectives meeting_objectives_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_objectives
    ADD CONSTRAINT meeting_objectives_pkey PRIMARY KEY (id);


--
-- Name: meeting_records meeting_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meeting_records
    ADD CONSTRAINT meeting_records_pkey PRIMARY KEY (id);


--
-- Name: nfse_invoices nfse_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nfse_invoices
    ADD CONSTRAINT nfse_invoices_pkey PRIMARY KEY (id);


--
-- Name: nfse_providers nfse_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nfse_providers
    ADD CONSTRAINT nfse_providers_pkey PRIMARY KEY (id);


--
-- Name: operation_billing_entries operation_billing_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_billing_entries
    ADD CONSTRAINT operation_billing_entries_pkey PRIMARY KEY (id);


--
-- Name: operation_billing_goals operation_billing_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operation_billing_goals
    ADD CONSTRAINT operation_billing_goals_pkey PRIMARY KEY (id);


--
-- Name: permission_definitions permission_definitions_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_definitions
    ADD CONSTRAINT permission_definitions_code_unique UNIQUE (code);


--
-- Name: permission_definitions permission_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_definitions
    ADD CONSTRAINT permission_definitions_pkey PRIMARY KEY (id);


--
-- Name: personal_accounts personal_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_accounts
    ADD CONSTRAINT personal_accounts_pkey PRIMARY KEY (id);


--
-- Name: personal_categories personal_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_categories
    ADD CONSTRAINT personal_categories_pkey PRIMARY KEY (id);


--
-- Name: personal_cost_centers personal_cost_centers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_cost_centers
    ADD CONSTRAINT personal_cost_centers_pkey PRIMARY KEY (id);


--
-- Name: personal_transactions personal_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_transactions
    ADD CONSTRAINT personal_transactions_pkey PRIMARY KEY (id);


--
-- Name: product_cost_structures product_cost_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_cost_structures
    ADD CONSTRAINT product_cost_structures_pkey PRIMARY KEY (id);


--
-- Name: product_media product_media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_media
    ADD CONSTRAINT product_media_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: proposal_routes proposal_routes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proposal_routes
    ADD CONSTRAINT proposal_routes_pkey PRIMARY KEY (id);


--
-- Name: rfis rfis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfis
    ADD CONSTRAINT rfis_pkey PRIMARY KEY (id);


--
-- Name: saved_routes saved_routes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_routes
    ADD CONSTRAINT saved_routes_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: storage_calculations storage_calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storage_calculations
    ADD CONSTRAINT storage_calculations_pkey PRIMARY KEY (id);


--
-- Name: store_order_items store_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_order_items
    ADD CONSTRAINT store_order_items_pkey PRIMARY KEY (id);


--
-- Name: store_orders store_orders_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_orders
    ADD CONSTRAINT store_orders_order_number_unique UNIQUE (order_number);


--
-- Name: store_orders store_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_orders
    ADD CONSTRAINT store_orders_pkey PRIMARY KEY (id);


--
-- Name: store_product_categories store_product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_product_categories
    ADD CONSTRAINT store_product_categories_pkey PRIMARY KEY (id);


--
-- Name: store_product_categories store_product_categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_product_categories
    ADD CONSTRAINT store_product_categories_slug_unique UNIQUE (slug);


--
-- Name: store_products store_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_products
    ADD CONSTRAINT store_products_pkey PRIMARY KEY (id);


--
-- Name: store_products store_products_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.store_products
    ADD CONSTRAINT store_products_slug_unique UNIQUE (slug);


--
-- Name: subscription_plans subscription_plans_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_code_unique UNIQUE (code);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: support_ticket_messages support_ticket_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_ticket_messages
    ADD CONSTRAINT support_ticket_messages_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: user_role_assignments user_role_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_assignments
    ADD CONSTRAINT user_role_assignments_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_agents whatsapp_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_agents
    ADD CONSTRAINT whatsapp_agents_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_config whatsapp_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_config
    ADD CONSTRAINT whatsapp_config_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_conversations whatsapp_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_conversations
    ADD CONSTRAINT whatsapp_conversations_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_journey_steps whatsapp_journey_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_journey_steps
    ADD CONSTRAINT whatsapp_journey_steps_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_messages whatsapp_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.whatsapp_messages
    ADD CONSTRAINT whatsapp_messages_pkey PRIMARY KEY (id);


--
-- Name: _migrations _migrations_name_key; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe._migrations
    ADD CONSTRAINT _migrations_name_key UNIQUE (name);


--
-- Name: _migrations _migrations_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe._migrations
    ADD CONSTRAINT _migrations_pkey PRIMARY KEY (id);


--
-- Name: _sync_status _sync_status_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe._sync_status
    ADD CONSTRAINT _sync_status_pkey PRIMARY KEY (id);


--
-- Name: _sync_status _sync_status_resource_account_key; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe._sync_status
    ADD CONSTRAINT _sync_status_resource_account_key UNIQUE (resource, account_id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: active_entitlements active_entitlements_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.active_entitlements
    ADD CONSTRAINT active_entitlements_pkey PRIMARY KEY (id);


--
-- Name: charges charges_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.charges
    ADD CONSTRAINT charges_pkey PRIMARY KEY (id);


--
-- Name: checkout_session_line_items checkout_session_line_items_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.checkout_session_line_items
    ADD CONSTRAINT checkout_session_line_items_pkey PRIMARY KEY (id);


--
-- Name: checkout_sessions checkout_sessions_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.checkout_sessions
    ADD CONSTRAINT checkout_sessions_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: credit_notes credit_notes_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.credit_notes
    ADD CONSTRAINT credit_notes_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: early_fraud_warnings early_fraud_warnings_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.early_fraud_warnings
    ADD CONSTRAINT early_fraud_warnings_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: features features_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.features
    ADD CONSTRAINT features_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: _managed_webhooks managed_webhooks_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe._managed_webhooks
    ADD CONSTRAINT managed_webhooks_pkey PRIMARY KEY (id);


--
-- Name: _managed_webhooks managed_webhooks_url_account_unique; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe._managed_webhooks
    ADD CONSTRAINT managed_webhooks_url_account_unique UNIQUE (url, account_id);


--
-- Name: payment_intents payment_intents_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.payment_intents
    ADD CONSTRAINT payment_intents_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: payouts payouts_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.payouts
    ADD CONSTRAINT payouts_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: prices prices_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.prices
    ADD CONSTRAINT prices_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: setup_intents setup_intents_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.setup_intents
    ADD CONSTRAINT setup_intents_pkey PRIMARY KEY (id);


--
-- Name: subscription_items subscription_items_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.subscription_items
    ADD CONSTRAINT subscription_items_pkey PRIMARY KEY (id);


--
-- Name: subscription_schedules subscription_schedules_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.subscription_schedules
    ADD CONSTRAINT subscription_schedules_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tax_ids tax_ids_pkey; Type: CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.tax_ids
    ADD CONSTRAINT tax_ids_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: bank_transactions_unique_external; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX bank_transactions_unique_external ON public.bank_transactions USING btree (bank_account_id, external_id);


--
-- Name: active_entitlements_lookup_key_key; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE UNIQUE INDEX active_entitlements_lookup_key_key ON stripe.active_entitlements USING btree (lookup_key) WHERE (lookup_key IS NOT NULL);


--
-- Name: features_lookup_key_key; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE UNIQUE INDEX features_lookup_key_key ON stripe.features USING btree (lookup_key) WHERE (lookup_key IS NOT NULL);


--
-- Name: idx_accounts_api_key_hashes; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX idx_accounts_api_key_hashes ON stripe.accounts USING gin (api_key_hashes);


--
-- Name: idx_accounts_business_name; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX idx_accounts_business_name ON stripe.accounts USING btree (business_name);


--
-- Name: idx_sync_status_resource_account; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX idx_sync_status_resource_account ON stripe._sync_status USING btree (resource, account_id);


--
-- Name: stripe_active_entitlements_customer_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_active_entitlements_customer_idx ON stripe.active_entitlements USING btree (customer);


--
-- Name: stripe_active_entitlements_feature_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_active_entitlements_feature_idx ON stripe.active_entitlements USING btree (feature);


--
-- Name: stripe_checkout_session_line_items_price_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_checkout_session_line_items_price_idx ON stripe.checkout_session_line_items USING btree (price);


--
-- Name: stripe_checkout_session_line_items_session_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_checkout_session_line_items_session_idx ON stripe.checkout_session_line_items USING btree (checkout_session);


--
-- Name: stripe_checkout_sessions_customer_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_checkout_sessions_customer_idx ON stripe.checkout_sessions USING btree (customer);


--
-- Name: stripe_checkout_sessions_invoice_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_checkout_sessions_invoice_idx ON stripe.checkout_sessions USING btree (invoice);


--
-- Name: stripe_checkout_sessions_payment_intent_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_checkout_sessions_payment_intent_idx ON stripe.checkout_sessions USING btree (payment_intent);


--
-- Name: stripe_checkout_sessions_subscription_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_checkout_sessions_subscription_idx ON stripe.checkout_sessions USING btree (subscription);


--
-- Name: stripe_credit_notes_customer_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_credit_notes_customer_idx ON stripe.credit_notes USING btree (customer);


--
-- Name: stripe_credit_notes_invoice_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_credit_notes_invoice_idx ON stripe.credit_notes USING btree (invoice);


--
-- Name: stripe_dispute_created_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_dispute_created_idx ON stripe.disputes USING btree (created);


--
-- Name: stripe_early_fraud_warnings_charge_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_early_fraud_warnings_charge_idx ON stripe.early_fraud_warnings USING btree (charge);


--
-- Name: stripe_early_fraud_warnings_payment_intent_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_early_fraud_warnings_payment_intent_idx ON stripe.early_fraud_warnings USING btree (payment_intent);


--
-- Name: stripe_invoices_customer_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_invoices_customer_idx ON stripe.invoices USING btree (customer);


--
-- Name: stripe_invoices_subscription_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_invoices_subscription_idx ON stripe.invoices USING btree (subscription);


--
-- Name: stripe_managed_webhooks_enabled_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_managed_webhooks_enabled_idx ON stripe._managed_webhooks USING btree (enabled);


--
-- Name: stripe_managed_webhooks_status_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_managed_webhooks_status_idx ON stripe._managed_webhooks USING btree (status);


--
-- Name: stripe_payment_intents_customer_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_payment_intents_customer_idx ON stripe.payment_intents USING btree (customer);


--
-- Name: stripe_payment_intents_invoice_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_payment_intents_invoice_idx ON stripe.payment_intents USING btree (invoice);


--
-- Name: stripe_payment_methods_customer_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_payment_methods_customer_idx ON stripe.payment_methods USING btree (customer);


--
-- Name: stripe_refunds_charge_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_refunds_charge_idx ON stripe.refunds USING btree (charge);


--
-- Name: stripe_refunds_payment_intent_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_refunds_payment_intent_idx ON stripe.refunds USING btree (payment_intent);


--
-- Name: stripe_reviews_charge_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_reviews_charge_idx ON stripe.reviews USING btree (charge);


--
-- Name: stripe_reviews_payment_intent_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_reviews_payment_intent_idx ON stripe.reviews USING btree (payment_intent);


--
-- Name: stripe_setup_intents_customer_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_setup_intents_customer_idx ON stripe.setup_intents USING btree (customer);


--
-- Name: stripe_tax_ids_customer_idx; Type: INDEX; Schema: stripe; Owner: postgres
--

CREATE INDEX stripe_tax_ids_customer_idx ON stripe.tax_ids USING btree (customer);


--
-- Name: _managed_webhooks handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe._managed_webhooks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_metadata();


--
-- Name: _sync_status handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe._sync_status FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_metadata();


--
-- Name: accounts handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: active_entitlements handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.active_entitlements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: charges handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.charges FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: checkout_session_line_items handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.checkout_session_line_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: checkout_sessions handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.checkout_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: coupons handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.coupons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: customers handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: disputes handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.disputes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: early_fraud_warnings handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.early_fraud_warnings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: events handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: features handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.features FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: invoices handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: payouts handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.payouts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: plans handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: prices handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.prices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: products handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: refunds handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.refunds FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: reviews handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: subscriptions handle_updated_at; Type: TRIGGER; Schema: stripe; Owner: postgres
--

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON stripe.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: active_entitlements fk_active_entitlements_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.active_entitlements
    ADD CONSTRAINT fk_active_entitlements_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: charges fk_charges_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.charges
    ADD CONSTRAINT fk_charges_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: checkout_session_line_items fk_checkout_session_line_items_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.checkout_session_line_items
    ADD CONSTRAINT fk_checkout_session_line_items_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: checkout_sessions fk_checkout_sessions_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.checkout_sessions
    ADD CONSTRAINT fk_checkout_sessions_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: credit_notes fk_credit_notes_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.credit_notes
    ADD CONSTRAINT fk_credit_notes_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: customers fk_customers_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.customers
    ADD CONSTRAINT fk_customers_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: disputes fk_disputes_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.disputes
    ADD CONSTRAINT fk_disputes_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: early_fraud_warnings fk_early_fraud_warnings_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.early_fraud_warnings
    ADD CONSTRAINT fk_early_fraud_warnings_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: features fk_features_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.features
    ADD CONSTRAINT fk_features_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: invoices fk_invoices_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.invoices
    ADD CONSTRAINT fk_invoices_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: _managed_webhooks fk_managed_webhooks_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe._managed_webhooks
    ADD CONSTRAINT fk_managed_webhooks_account FOREIGN KEY (account_id) REFERENCES stripe.accounts(id);


--
-- Name: payment_intents fk_payment_intents_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.payment_intents
    ADD CONSTRAINT fk_payment_intents_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: payment_methods fk_payment_methods_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.payment_methods
    ADD CONSTRAINT fk_payment_methods_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: plans fk_plans_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.plans
    ADD CONSTRAINT fk_plans_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: prices fk_prices_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.prices
    ADD CONSTRAINT fk_prices_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: products fk_products_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.products
    ADD CONSTRAINT fk_products_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: refunds fk_refunds_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.refunds
    ADD CONSTRAINT fk_refunds_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: reviews fk_reviews_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.reviews
    ADD CONSTRAINT fk_reviews_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: setup_intents fk_setup_intents_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.setup_intents
    ADD CONSTRAINT fk_setup_intents_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: subscription_items fk_subscription_items_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.subscription_items
    ADD CONSTRAINT fk_subscription_items_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: subscription_schedules fk_subscription_schedules_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.subscription_schedules
    ADD CONSTRAINT fk_subscription_schedules_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: subscriptions fk_subscriptions_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.subscriptions
    ADD CONSTRAINT fk_subscriptions_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- Name: _sync_status fk_sync_status_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe._sync_status
    ADD CONSTRAINT fk_sync_status_account FOREIGN KEY (account_id) REFERENCES stripe.accounts(id);


--
-- Name: tax_ids fk_tax_ids_account; Type: FK CONSTRAINT; Schema: stripe; Owner: postgres
--

ALTER TABLE ONLY stripe.tax_ids
    ADD CONSTRAINT fk_tax_ids_account FOREIGN KEY (_account_id) REFERENCES stripe.accounts(id);


--
-- PostgreSQL database dump complete
--

\unrestrict PbKM1Xb9sIv9gV1Szc16poFuKP5ZQOtPbpG13Wueb2bPFl1ctElislh9BI5fH9f


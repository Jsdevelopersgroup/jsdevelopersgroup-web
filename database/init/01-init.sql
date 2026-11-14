-- Database initialization for Vertex Construction Group Portfolio Template
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.projects (
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    overview text,
    location text,
    project_date date,
    category text,
    is_active boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    client text
);

CREATE TABLE IF NOT EXISTS public.project_images (
    id SERIAL PRIMARY KEY,
    project_id integer NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    is_featured boolean DEFAULT false,
    display_order integer DEFAULT 0,
    alt_text text
);

CREATE TABLE IF NOT EXISTS public.project_specifications (
    id SERIAL PRIMARY KEY,
    project_id integer NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    icon_name text NOT NULL,
    title text NOT NULL,
    value text NOT NULL
);

-- Seed Admin User (password: admin123)
COPY public.users (id, email, password_hash, created_at) FROM stdin;
47dfecfb-cf6b-4f96-8f2f-439618ef6415	admin@vertexconstruction.local	$2a$12$GiVSIeFPnGK9vpXVKJvc2.Xf/j0VRp/LZyY8Y6XYzn8NkHbOtprji	2026-01-01 00:00:00+00
\.

-- Seed Generic Construction Projects
COPY public.projects (id, title, slug, overview, location, project_date, category, is_active, is_featured, created_at, client) FROM stdin;
1	Apex Horizon Commercial Plaza	apex-horizon-plaza	A premier 25,000 sq ft contemporary commercial plaza featuring sustainable steel-and-glass architecture, high-efficiency climate systems, and open-plan executive suites designed for leading regional enterprises.	Metro City, Central Boulevard	2024-06-15	COMMERCIAL BUILDING	t	t	2024-06-15 10:00:00	Horizon Real Estate Holdings
2	Emerald Heights Luxury Residences	emerald-heights-residences	Exclusive residential development comprising 16 contemporary apartments, private underground parking, landscaped rooftop terrace, and acoustic soundproofing throughout.	Greenfield Heights	2023-11-20	RESIDENTIAL BUILDING	t	t	2023-11-20 10:00:00	Highland Living Ltd
3	Nexus Logistics & Industrial Hub	nexus-logistics-park	High-bay industrial distribution center engineered for automated supply chain workflows, heavy vehicle reinforced slabs, and 30-foot clear ceiling heights with advanced fire suppression.	Harbor Gateway Logistics Zone	2024-02-10	INDUSTRIAL	t	t	2024-02-10 10:00:00	Global Freight Logistics
4	Serene Valley Modern Villas	serene-valley-villas	A gated enclave of 6 bespoke architectural villas designed with passive solar heating, natural stone facades, and integrated smart home automation for sustainable luxury living.	Pine Ridge Valley	2023-08-05	RESIDENTIAL	t	f	2023-08-05 10:00:00	Valley Development Co.
5	Metropolitan Civic Center	metropolitan-civic-center	A landmark public auditorium and community complex constructed under stringent municipal seismic standards, architectural acoustics, and sustainable urban infrastructure guidelines.	Central District Plaza	2022-09-30	PRESTIGIOUS PROJECTS	t	f	2022-09-30 10:00:00	Metropolitan Municipal Council
6	Cascade Heights Corporate Tower	cascade-heights-tower	12-story commercial tower featuring continuous curtain wall glazing, triple-tier security access, and state-of-the-art seismic vibration dampening.	Downtown West Financial Center	2024-04-18	COMMERCIAL BUILDING	t	f	2024-04-18 10:00:00	Cascade Financial Partners
\.

-- Seed Project Images
COPY public.project_images (id, project_id, image_url, is_featured, display_order, alt_text) FROM stdin;
1	1	/uploads/projects/apex-horizon-plaza/image_1.jpeg	t	0	Apex Horizon Commercial Plaza Front Elevation
2	1	/uploads/projects/apex-horizon-plaza/image_2.jpeg	f	1	Apex Horizon Commercial Plaza Atrium
3	1	/uploads/projects/apex-horizon-plaza/image_3.jpeg	f	2	Apex Horizon Commercial Plaza Exterior View
4	2	/uploads/projects/emerald-heights-residences/image_1.jpeg	t	0	Emerald Heights Luxury Residences
5	2	/uploads/projects/emerald-heights-residences/image_2.jpeg	f	1	Emerald Heights Living Spaces
6	2	/uploads/projects/emerald-heights-residences/image_3.jpeg	f	2	Emerald Heights Terrace
7	3	/uploads/projects/nexus-logistics-park/image_1.jpeg	t	0	Nexus Logistics & Industrial Hub Bay
8	3	/uploads/projects/nexus-logistics-park/image_2.jpeg	f	1	Nexus Logistics Warehouse Interior
9	3	/uploads/projects/nexus-logistics-park/image_3.jpeg	f	2	Nexus Logistics Loading Docks
10	4	/uploads/projects/serene-valley-villas/image_1.jpeg	t	0	Serene Valley Villa Exterior
11	4	/uploads/projects/serene-valley-villas/image_2.jpeg	f	1	Serene Valley Modern Facade
12	4	/uploads/projects/serene-valley-villas/image_3.jpeg	f	2	Serene Valley Landscaped Courtyard
13	5	/uploads/projects/metropolitan-civic-center/image_1.jpeg	t	0	Metropolitan Civic Center Plaza
14	5	/uploads/projects/metropolitan-civic-center/image_2.jpeg	f	1	Metropolitan Civic Center Auditorium
15	5	/uploads/projects/metropolitan-civic-center/image_3.jpeg	f	2	Metropolitan Civic Center Hall
16	6	/uploads/projects/cascade-heights-tower/image_1.jpeg	t	0	Cascade Heights Corporate Tower Facade
17	6	/uploads/projects/cascade-heights-tower/image_2.jpeg	f	1	Cascade Heights Glass Curtain Wall
18	6	/uploads/projects/cascade-heights-tower/image_3.jpeg	f	2	Cascade Heights Lobby
\.

-- Seed Project Specifications
COPY public.project_specifications (id, project_id, icon_name, title, value) FROM stdin;
1	1	Building2	Total Built-up Area	25,000 Sq. Ft.
2	1	Clock	Project Timeline	18 Months
3	1	Layers	Structural Frame	Post-Tensioned Concrete
4	1	CheckCircle	Compliance	LEED Silver Certified
5	2	Home	Residential Units	16 Luxury Suites
6	2	Ruler	Floor Area	1,800 - 3,200 Sq. Ft.
7	2	MapPin	Location	Greenfield Heights
8	2	Users	Capacity	60+ Residents
9	3	Building2	Logistics Capacity	150,000 Sq. Ft.
10	3	Layers	Floor Load Capacity	80 kN/sq.m Slab
11	3	Clock	Completion Period	14 Months
12	3	CheckCircle	Fire Safety	ESFR Sprinkler System
\.

SELECT pg_catalog.setval('public.projects_id_seq', 10, true);
SELECT pg_catalog.setval('public.project_images_id_seq', 25, true);
SELECT pg_catalog.setval('public.project_specifications_id_seq', 20, true);

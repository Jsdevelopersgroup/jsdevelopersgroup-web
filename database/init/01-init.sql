-- Database initialization for JS Developers Group
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

-- Seed Data
COPY public.users (id, email, password_hash, created_at) FROM stdin;
47dfecfb-cf6b-4f96-8f2f-439618ef6415	JS@jsdevelopersgroup.com	$2a$12$GiVSIeFPnGK9vpXVKJvc2.Xf/j0VRp/LZyY8Y6XYzn8NkHbOtprji	2026-01-03 14:44:12.070735+00
\.

COPY public.projects (id, title, slug, overview, location, project_date, category, is_active, is_featured, created_at, client) FROM stdin;
16	JS QUARTERS	js-quarters	12 STANDERD QUARTERS 3 BEEDROOM AND 4 BEDROOM	NILESWAR, KERALA ,INDIA	2026-01-01	RESIDENTIAL BUILDING	t	t	2026-04-20 14:33:21.893943	JS DEVOLOPERS
11	MH .COMPLEX	mh-.complex	🏗️ Project Update | Kovalpally Commercial Building\r\n\r\nStrong foundations define lasting structures.\r\nOur work at Kovalpally has progressed from precision footing preparation to reinforced column concreting, ensuring structural stability and long-term performance.\r\n\r\n✔️ Engineered isolated footings designed for soil conditions\r\n✔️ Proper reinforcement placement for load transfer and durability\r\n✔️ High-grade concrete with controlled curing process\r\n✔️ Column alignment checked for structural accuracy\r\n✔️ Drainage and base protection ensured before casting\r\n\r\nBuilding from the ground up—with strength, safety, and engineering excellence.\r\n\r\n🌐 jsdevelopersgroup.com\r\n\r\n#CivilEngineering #FoundationWork #StructuralEngineering #ConstructionSite #ConcreteWork #Reinforcement #BuildingStrong #EngineeringDesign #SiteExecution #QualityConstruction #Footing #ColumnWork #CommercialConstruction #ConstructionLife #BuildRight #ProjectUpdate #JSDevelopersGroup	 KOVALPALLY , KERALA ,INDIA	2026-01-01	COMMERCIAL BUILDING	t	t	2026-04-20 13:36:24.117077	
14	OFFAR'S HOUSE	offar's-house	3000 SQ FEET HOME-4XBEDROOMS\r\n\r\n2018 COMPLETED	KANHANGAD	2026-01-01	RESIDENTIAL BUILDING	t	t	2026-04-20 13:56:35.692429	OFFAR
15	MUJEEBS HEAVEN	mujeebs-heaven	8000 SQ FEET HOME-6XBEDROOMS\r\n\r\n2018 COMPLETED	KANHANGAD	2026-01-01	RESIDENTIAL BUILDING	t	t	2026-04-20 14:14:22.033673	MUJEEB
13	JS HOMES	js-homes	✨ FROM GROUND TO GREATNESS ✨\r\nA dream is taking shape… and your future home is waiting.\r\n\r\n🏡 Presenting Premium 4 Independent Homes by JS Developers\r\nDesigned for modern living, built with strong foundation, and crafted for a better lifestyle.\r\n\r\n🔹 Project Highlights:\r\n✔️ 4 Individual Homes with Private Partition Walls\r\n✔️ Strong & Durable Foundation Work\r\n✔️ Modern Elevation & Premium Finishing\r\n✔️ Spacious Layout with Independent Access\r\n✔️ Peaceful Location with Natural Surroundings\r\n✔️ Private road access for vehicles. \r\n\r\n💡 We don’t just build houses… we create good life homes.\r\n\r\n📍 Location: moovarikund,\r\n                  Route 2kms from padannakad 600 meters from pattakkakl ,kallooravi\r\n🌐 Website: jsdevelopersgroup.com\r\n\r\n✨ Make Life a Good Home ✨\r\n\r\n---\r\n\r\n🔥 Limited Units Available – Book Your Dream Home Today!\r\n\r\n---\r\n\r\n#JSDevelopers #DreamHome #LuxuryLiving #KanhangadHomes #KeralaHomes HouseForSale ModernHome ConstructionLife RealEstateIndia VillaForSale HomeGoals BuildYourDream QualityConstruction NewHomeKerala PremiumLiving	KALLOORAVI, KERALA ,INDIA	2026-01-01	RESIDENTIAL BUILDING	t	t	2026-04-20 13:43:57.974116	JS DEVOLOPERS
17	JS LUXURY FLATS	js-luxury-flats	16 LUXURY FLATS 2X BEDROOMS	PERIYA	2026-01-01	RESIDENTIAL	t	t	2026-04-20 14:39:38.201106	JS DEVOLOPERS
18	 JS HOMES 	home-project	✨ FROM GROUND TO GREATNESS ✨\r\nA dream is taking shape… and your future home is waiting.\r\n\r\n🏡 Presenting Premium 4 Independent Homes by JS Developers\r\nDesigned for modern living, built with strong foundation, and crafted for a better lifestyle.\r\n\r\n🔹 Project Highlights:\r\n✔️ 4 Individual Homes with Private Partition Walls\r\n✔️ Strong & Durable Foundation Work\r\n✔️ Modern Elevation & Premium Finishing\r\n✔️ Spacious Layout with Independent Access\r\n✔️ Peaceful Location with Natural Surroundings\r\n✔️ Private road access for vehicles. \r\n\r\n💡 We don’t just build houses… we create good life homes.\r\n\r\n📍 Location: moovarikund,\r\n                  Route 2kms from padannakad 600 meters from pattakkakl ,kallooravi\r\n🌐 Website: jsdevelopersgroup.com\r\n\r\n✨ Make Life a Good Home ✨\r\n\r\n---\r\n\r\n🔥 Limited Units Available – Book Your Dream Home Today!\r\n\r\n---\r\n\r\n#JSDevelopers #DreamHome #LuxuryLiving #KanhangadHomes #KeralaHomes HouseForSale ModernHome ConstructionLife RealEstateIndia VillaForSale HomeGoals BuildYourDream QualityConstruction NewHomeKerala PremiumLiving	KALLOORAVI	2026-01-01	RESIDENTIAL	t	t	2026-04-20 14:42:53.8988	JS DEVOLOPERS
20	HINDUSTHAN COMPLEX	hindusthan-complex	14000 SQ.FEET COMMERICIAL BUILDING.\r\n2017 COMPLETED	CHERUVATHUR	2017-01-01	COMMERCIAL BUILDING	t	f	2026-04-20 14:51:33.509539	MOHAMMED KUNHI
21	JS HOTEL AND RESORT	js-hotel-and-resort	LUXURIOUS RESORT \r\n13000 SQ FEET\r\nONGOING   STATUS	BEKAL	2026-01-01	PRESTIGIOUS PROJECTS	t	t	2026-04-20 14:56:05.200124	JS DEVOLOPERS
\.

COPY public.project_images (id, project_id, image_url, is_featured, display_order, alt_text) FROM stdin;
70	14	/uploads/projects/offar's-house/1776693956310-f4a05v.jpeg	t	0	OFFAR'S HOUSE
71	14	/uploads/projects/offar's-house/1776693395696-eenomh.jpeg	f	1	OFFAR'S HOUSE
72	15	/uploads/projects/mujeebs-heaven/1776694462035-hp5s1n.jpeg	t	0	MUJEEBS HEAVEN
73	15	/uploads/projects/mujeebs-heaven/1776694462037-3codr.jpeg	f	1	MUJEEBS HEAVEN
74	15	/uploads/projects/mujeebs-heaven/1776694462037-aeubfn.jpeg	f	2	MUJEEBS HEAVEN
75	13	/uploads/projects/js-homes/1776694509797-wv0fmp.jpeg	t	0	JS HOMES
76	13	/uploads/projects/js-homes/1776692637977-yhe5em.jpeg	f	1	JS HOMES
77	13	/uploads/projects/js-homes/1776692637979-mlkxwa.jpeg	f	2	JS HOMES
78	13	/uploads/projects/js-homes/1776692637981-i999x.jpeg	f	3	JS HOMES
79	13	/uploads/projects/js-homes/1776692637982-m1hzb5.jpeg	f	4	JS HOMES
80	16	/uploads/projects/js-quarters/1776695601896-4xj96b.jpeg	t	0	JS QUARTERS
81	16	/uploads/projects/js-quarters/1776695601899-50oton.jpeg	f	1	JS QUARTERS
82	16	/uploads/projects/js-quarters/1776695601901-hkufie.jpeg	f	2	JS QUARTERS
85	17	/uploads/projects/js-luxury-flats/1776695988979-z52yg.jpeg	t	0	JS LUXURY FLATS
86	17	/uploads/projects/js-luxury-flats/1776695978204-wrrao.jpeg	f	1	JS LUXURY FLATS
90	18	/uploads/projects/-js-homes-/1776696243907-tmsrko.jpeg	t	0	 JS HOMES 
91	18	/uploads/projects/home-project/1776696173902-04de7p.jpeg	f	1	 JS HOMES 
92	18	/uploads/projects/home-project/1776696173903-q275tc.jpeg	f	2	 JS HOMES 
96	20	/uploads/projects/hindusthan-complex/1776696724080-7zokb.jpeg	t	0	HINDUSTHAN COMPLEX
97	20	/uploads/projects/hindusthan-complex/1776696693585-aerd1q.jpeg	f	1	HINDUSTHAN COMPLEX
100	21	/uploads/projects/js-hotel-and-resort/1776696992895-0a2r5.jpeg	t	0	JS HOTEL AND RESORT
101	21	/uploads/projects/js-hotel-and-resort/1776696965203-50mshg.jpeg	f	1	JS HOTEL AND RESORT
63	11	/uploads/projects/mh-.complex/1776693875380-g4yegn.jpeg	t	0	MH .COMPLEX
64	11	/uploads/projects/mh-.complex/1776692184176-mnfjl.jpeg	f	1	MH .COMPLEX
65	11	/uploads/projects/mh-.complex/1776692184178-gp186.jpeg	f	2	MH .COMPLEX
66	11	/uploads/projects/mh-.complex/1776692184180-wp738q.jpeg	f	3	MH .COMPLEX
67	11	/uploads/projects/mh-.complex/1776693843397-ludq1r.jpeg	f	4	MH .COMPLEX
\.

COPY public.project_specifications (id, project_id, icon_name, title, value) FROM stdin;
\.


SELECT pg_catalog.setval('public.projects_id_seq', 25, true);
SELECT pg_catalog.setval('public.project_images_id_seq', 110, true);
SELECT pg_catalog.setval('public.project_specifications_id_seq', 20, true);

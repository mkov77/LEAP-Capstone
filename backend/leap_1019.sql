PGDMP                  	    |           LEAP    16.3    16.3 2    &           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            '           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            (           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            )           1262    16469    LEAP    DATABASE     �   CREATE DATABASE "LEAP" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE "LEAP";
                postgres    false            �            1259    16470    engagements    TABLE     �  CREATE TABLE public.engagements (
    sectionid character(3) NOT NULL,
    friendlyid character varying(20),
    enemyid character varying(20),
    friendlybasescore numeric,
    enemybasescore numeric,
    friendlytacticsscore numeric,
    enemytacticsscore numeric,
    iswin boolean,
    enemytotalscore numeric,
    friendlytotalscore numeric,
    engagementid integer NOT NULL,
    timestamp_column timestamp without time zone
);
    DROP TABLE public.engagements;
       public         heap    postgres    false            *           0    0    TABLE engagements    ACL     1   GRANT ALL ON TABLE public.engagements TO PUBLIC;
          public          postgres    false    215            �            1259    16475    engagements_engagementid_seq    SEQUENCE     �   ALTER TABLE public.engagements ALTER COLUMN engagementid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.engagements_engagementid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    215            +           0    0 %   SEQUENCE engagements_engagementid_seq    ACL     E   GRANT ALL ON SEQUENCE public.engagements_engagementid_seq TO PUBLIC;
          public          postgres    false    216            �            1259    24599    preset_tactics    TABLE     �   CREATE TABLE public.preset_tactics (
    unit_name character varying,
    awareness integer,
    logistics integer,
    coverage integer,
    gps integer,
    comms integer,
    fire integer,
    pattern integer
);
 "   DROP TABLE public.preset_tactics;
       public         heap    postgres    false            �            1259    24596    preset_units    TABLE     `  CREATE TABLE public.preset_units (
    unit_name character varying(15) NOT NULL,
    unit_type character varying,
    unit_role character varying,
    unit_size character varying,
    unit_posture character varying,
    unit_mobility character varying,
    unit_readiness character varying,
    unit_skill character varying,
    is_friendly boolean
);
     DROP TABLE public.preset_units;
       public         heap    postgres    false            �            1259    24593    section_tactics    TABLE     �   CREATE TABLE public.section_tactics (
    unit_id integer NOT NULL,
    awareness integer,
    logistics integer,
    coverage integer,
    gps integer,
    comms integer,
    fire integer,
    pattern integer
);
 #   DROP TABLE public.section_tactics;
       public         heap    postgres    false            �            1259    24641    section_tree    TABLE     [   CREATE TABLE public.section_tree (
    child_id integer NOT NULL,
    parent_id integer
);
     DROP TABLE public.section_tree;
       public         heap    postgres    false            �            1259    24590    section_units    TABLE     �  CREATE TABLE public.section_units (
    unit_id integer NOT NULL,
    unit_name character varying,
    unit_health integer,
    unit_type character varying,
    unit_role character varying,
    unit_size character varying,
    unit_posture character varying,
    unit_mobility character varying,
    unit_readiness character varying,
    unit_skill character varying,
    is_friendly character varying,
    is_root boolean,
    section_id character varying
);
 !   DROP TABLE public.section_units;
       public         heap    postgres    false            �            1259    24614    section_units_unit_id_seq    SEQUENCE     �   ALTER TABLE public.section_units ALTER COLUMN unit_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.section_units_unit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    223            �            1259    16476    sections    TABLE     n   CREATE TABLE public.sections (
    sectionid character varying(15) NOT NULL,
    isonline boolean NOT NULL
);
    DROP TABLE public.sections;
       public         heap    postgres    false            ,           0    0    TABLE sections    ACL     .   GRANT ALL ON TABLE public.sections TO PUBLIC;
          public          postgres    false    217            �            1259    16479    tactics    TABLE     �  CREATE TABLE public.tactics (
    friendlyawareness integer,
    enemyawareness integer,
    friendlylogistics integer,
    enemylogistics integer,
    friendlycoverage integer,
    enemycoverage integer,
    friendlygps integer,
    enemygps integer,
    friendlycomms integer,
    enemycomms integer,
    friendlyfire integer,
    enemyfire integer,
    friendlypattern integer,
    enemypattern integer,
    engagementid integer NOT NULL
);
    DROP TABLE public.tactics;
       public         heap    postgres    false            -           0    0    TABLE tactics    ACL     -   GRANT ALL ON TABLE public.tactics TO PUBLIC;
          public          postgres    false    218            �            1259    16482    tactics_engagementid_seq    SEQUENCE     �   ALTER TABLE public.tactics ALTER COLUMN engagementid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tactics_engagementid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    218            .           0    0 !   SEQUENCE tactics_engagementid_seq    ACL     A   GRANT ALL ON SEQUENCE public.tactics_engagementid_seq TO PUBLIC;
          public          postgres    false    219            �            1259    16483    unit_tactics    TABLE     �   CREATE TABLE public.unit_tactics (
    "ID" integer NOT NULL,
    awareness integer,
    logistics integer,
    coverage integer,
    gps integer,
    comms integer,
    fire integer,
    pattern integer
);
     DROP TABLE public.unit_tactics;
       public         heap    postgres    false            /           0    0    TABLE unit_tactics    ACL     2   GRANT ALL ON TABLE public.unit_tactics TO PUBLIC;
          public          postgres    false    220            �            1259    16486    units    TABLE     :  CREATE TABLE public.units (
    unit_id character varying(50) NOT NULL,
    unit_type character varying(50),
    unit_health integer,
    role_type character varying(50),
    unit_size character varying(50),
    force_posture character varying(50),
    force_mobility character varying(50),
    force_readiness character varying(50),
    force_skill character varying(50),
    children character varying[],
    section character varying(50),
    id integer NOT NULL,
    root boolean,
    "isFriendly" boolean,
    xcord numeric,
    ycord numeric,
    zcord numeric
);
    DROP TABLE public.units;
       public         heap    postgres    false            0           0    0    TABLE units    ACL     +   GRANT ALL ON TABLE public.units TO PUBLIC;
          public          postgres    false    221            �            1259    16491    units_id_seq    SEQUENCE     �   CREATE SEQUENCE public.units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.units_id_seq;
       public          postgres    false    221            1           0    0    units_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.units_id_seq OWNED BY public.units.id;
          public          postgres    false    222            2           0    0    SEQUENCE units_id_seq    ACL     5   GRANT ALL ON SEQUENCE public.units_id_seq TO PUBLIC;
          public          postgres    false    222            w           2604    16492    units id    DEFAULT     d   ALTER TABLE ONLY public.units ALTER COLUMN id SET DEFAULT nextval('public.units_id_seq'::regclass);
 7   ALTER TABLE public.units ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    222    221                      0    16470    engagements 
   TABLE DATA           �   COPY public.engagements (sectionid, friendlyid, enemyid, friendlybasescore, enemybasescore, friendlytacticsscore, enemytacticsscore, iswin, enemytotalscore, friendlytotalscore, engagementid, timestamp_column) FROM stdin;
    public          postgres    false    215   �<       !          0    24599    preset_tactics 
   TABLE DATA           n   COPY public.preset_tactics (unit_name, awareness, logistics, coverage, gps, comms, fire, pattern) FROM stdin;
    public          postgres    false    226   �<                  0    24596    preset_units 
   TABLE DATA           �   COPY public.preset_units (unit_name, unit_type, unit_role, unit_size, unit_posture, unit_mobility, unit_readiness, unit_skill, is_friendly) FROM stdin;
    public          postgres    false    225   �<                 0    24593    section_tactics 
   TABLE DATA           m   COPY public.section_tactics (unit_id, awareness, logistics, coverage, gps, comms, fire, pattern) FROM stdin;
    public          postgres    false    224   x=       #          0    24641    section_tree 
   TABLE DATA           ;   COPY public.section_tree (child_id, parent_id) FROM stdin;
    public          postgres    false    228   �=                 0    24590    section_units 
   TABLE DATA           �   COPY public.section_units (unit_id, unit_name, unit_health, unit_type, unit_role, unit_size, unit_posture, unit_mobility, unit_readiness, unit_skill, is_friendly, is_root, section_id) FROM stdin;
    public          postgres    false    223   >                 0    16476    sections 
   TABLE DATA           7   COPY public.sections (sectionid, isonline) FROM stdin;
    public          postgres    false    217   A?                 0    16479    tactics 
   TABLE DATA              COPY public.tactics (friendlyawareness, enemyawareness, friendlylogistics, enemylogistics, friendlycoverage, enemycoverage, friendlygps, enemygps, friendlycomms, enemycomms, friendlyfire, enemyfire, friendlypattern, enemypattern, engagementid) FROM stdin;
    public          postgres    false    218   �?                 0    16483    unit_tactics 
   TABLE DATA           g   COPY public.unit_tactics ("ID", awareness, logistics, coverage, gps, comms, fire, pattern) FROM stdin;
    public          postgres    false    220   �?                 0    16486    units 
   TABLE DATA           �   COPY public.units (unit_id, unit_type, unit_health, role_type, unit_size, force_posture, force_mobility, force_readiness, force_skill, children, section, id, root, "isFriendly", xcord, ycord, zcord) FROM stdin;
    public          postgres    false    221   �?       3           0    0    engagements_engagementid_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.engagements_engagementid_seq', 656, true);
          public          postgres    false    216            4           0    0    section_units_unit_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.section_units_unit_id_seq', 63, true);
          public          postgres    false    227            5           0    0    tactics_engagementid_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.tactics_engagementid_seq', 656, true);
          public          postgres    false    219            6           0    0    units_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.units_id_seq', 41, true);
          public          postgres    false    222                       2606    16494    unit_tactics enemy_tactics_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY public.unit_tactics
    ADD CONSTRAINT enemy_tactics_pkey PRIMARY KEY ("ID");
 I   ALTER TABLE ONLY public.unit_tactics DROP CONSTRAINT enemy_tactics_pkey;
       public            postgres    false    220            y           2606    16496    engagements engagements_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.engagements
    ADD CONSTRAINT engagements_pkey PRIMARY KEY (engagementid);
 F   ALTER TABLE ONLY public.engagements DROP CONSTRAINT engagements_pkey;
       public            postgres    false    215            �           2606    24605    preset_units presetunits_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.preset_units
    ADD CONSTRAINT presetunits_pkey PRIMARY KEY (unit_name);
 G   ALTER TABLE ONLY public.preset_units DROP CONSTRAINT presetunits_pkey;
       public            postgres    false    225            �           2606    24649    section_tree section_tree_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.section_tree
    ADD CONSTRAINT section_tree_pkey PRIMARY KEY (child_id);
 H   ALTER TABLE ONLY public.section_tree DROP CONSTRAINT section_tree_pkey;
       public            postgres    false    228            {           2606    32789    sections sections_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (sectionid);
 @   ALTER TABLE ONLY public.sections DROP CONSTRAINT sections_pkey;
       public            postgres    false    217            }           2606    16500    tactics tactics_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.tactics
    ADD CONSTRAINT tactics_pkey PRIMARY KEY (engagementid);
 >   ALTER TABLE ONLY public.tactics DROP CONSTRAINT tactics_pkey;
       public            postgres    false    218            �           2606    16502    units units_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.units DROP CONSTRAINT units_pkey;
       public            postgres    false    221            �           2606    16503    unit_tactics id    FK CONSTRAINT     k   ALTER TABLE ONLY public.unit_tactics
    ADD CONSTRAINT id FOREIGN KEY ("ID") REFERENCES public.units(id);
 9   ALTER TABLE ONLY public.unit_tactics DROP CONSTRAINT id;
       public          postgres    false    221    220    4737                  x������ � �      !   1   x�K+�L�Kɩ,(J-N-�4 BC0��R�Rs+KR�!�0h����� ��          �   x�u�K
1םS�	�: .�wn���nM��xz�҅����P"ħ�ZPa�*Y|��ta�oxڂ����P*���4� ��n�4�&����'��
Gi�y6T�^sf��w�6E�o���T�w�5N�y�� eh@�         <   x�35�4 BC0��L����,�,�A���'24�23DRa0BWa��"F��� ��      #   /   x�Ĺ  ��[�}��ׁ������r�#����_��6��_�         .  x���AO�0���Spԋtǹ��D����˳}���b[��酹�H�n���6m��/�!7��uiȒ!��@��vL�rFK���
�#ca�T�|IX@�礬X��)Y�L��;��9��9S8pd�%�V^����&�І��[�M�4�^�;�����e��q�C?LM����	_�b�UϽؼ����y�=7�w��G:	�u��gw�KtZ���h����Uv���^��Ӣ�v�rl�z/"�OB���?��x^���vc��j�EIL�����{�?ӆ�= �����3��></r�         7   x�3426153��40�8ӸJR�K�S�K2��8K�r+��S�R�2��r1z\\\ kHR            x������ � �            x������ � �            x������ � �     
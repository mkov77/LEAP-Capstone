PGDMP      "    
        
    |           LEAP    16.3    16.3 2    &           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            '           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            (           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            )           1262    16469    LEAP    DATABASE     �   CREATE DATABASE "LEAP" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE "LEAP";
                postgres    false            �            1259    16470    engagements    TABLE     �  CREATE TABLE public.engagements (
    sectionid character(15) NOT NULL,
    friendlyid character varying(30),
    enemyid character varying(30),
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
    public          postgres    false    226   4=                  0    24596    preset_units 
   TABLE DATA           �   COPY public.preset_units (unit_name, unit_type, unit_role, unit_size, unit_posture, unit_mobility, unit_readiness, unit_skill, is_friendly) FROM stdin;
    public          postgres    false    225   �=                 0    24593    section_tactics 
   TABLE DATA           m   COPY public.section_tactics (unit_id, awareness, logistics, coverage, gps, comms, fire, pattern) FROM stdin;
    public          postgres    false    224   \?       #          0    24641    section_tree 
   TABLE DATA           ;   COPY public.section_tree (child_id, parent_id) FROM stdin;
    public          postgres    false    228   �?                 0    24590    section_units 
   TABLE DATA           �   COPY public.section_units (unit_id, unit_name, unit_health, unit_type, unit_role, unit_size, unit_posture, unit_mobility, unit_readiness, unit_skill, is_friendly, is_root, section_id) FROM stdin;
    public          postgres    false    223   n@                 0    16476    sections 
   TABLE DATA           7   COPY public.sections (sectionid, isonline) FROM stdin;
    public          postgres    false    217   C                 0    16479    tactics 
   TABLE DATA              COPY public.tactics (friendlyawareness, enemyawareness, friendlylogistics, enemylogistics, friendlycoverage, enemycoverage, friendlygps, enemygps, friendlycomms, enemycomms, friendlyfire, enemyfire, friendlypattern, enemypattern, engagementid) FROM stdin;
    public          postgres    false    218   9C                 0    16483    unit_tactics 
   TABLE DATA           g   COPY public.unit_tactics ("ID", awareness, logistics, coverage, gps, comms, fire, pattern) FROM stdin;
    public          postgres    false    220   �C                 0    16486    units 
   TABLE DATA           �   COPY public.units (unit_id, unit_type, unit_health, role_type, unit_size, force_posture, force_mobility, force_readiness, force_skill, children, section, id, root, "isFriendly", xcord, ycord, zcord) FROM stdin;
    public          postgres    false    221   �C       3           0    0    engagements_engagementid_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('public.engagements_engagementid_seq', 662, true);
          public          postgres    false    216            4           0    0    section_units_unit_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.section_units_unit_id_seq', 194, true);
          public          postgres    false    227            5           0    0    tactics_engagementid_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.tactics_engagementid_seq', 662, true);
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
       public          postgres    false    220    4737    221               �   x���1�0��9EO`�q�$3b-�Z��"5�')�RX@|%����4�i���\�� j��Xǃ��f ��H�Q�y���Z$z[�_�!�vG(����۽{H9�������ؿݼz ��ZOIv�g����k~ᒵ۟A6YZ2�MvE�� �o`      !   �   x�s�
q��4D�\>���%���h�NE��)�h�^�n
N~h�����y�h��E%�99�E��A�y�E�������:�;�	�����q��PL�	�Bg,��A!�X���ݰ�I���I��qqq �=�          �  x����n�0D��+�l7�B�@!m�TU���K��چ*_�WyHE�K>3w<��h�JBUU �_���J�������i^�n�%�PZ�J�H)�Y�\I����yE� �##�3R%7����L��l^�J[�W����d�ZD���q�h��$VS.��}���Rk��Y��h֊��W����Pʞ��������W���ds\�w=�vKl�-��8
F����$��,}#<�K���:�-x��yܢcfQ�d5�4�Q/�dh�t���/tcO �,	I����1~�8s-g�	Bu>�=�8{����/����d�5h��39�^	{`x���Mz������;��ϒȻ�x���X^�A�^h�Ӫ';ȏ�N��Bh��         u   x�eϱ�@C��4�!�Ή�%��7��1~�{����W�Ͱ�!�'7�5G-��5�5�5�5��Ԕ��PJCi(��4��05ej�Դ��SS�&o8<7������U�Oj      #   }   x�%�ɑ@��֜rq�q�<��A]�a�S�.+(Q��5�A-hRZ���Pw�~MOx�U�}�M_���r���͌��
���ld1�%9L!��K��	28�@Ҙh�\��ܿ��s7o���G��#T         �  x���_o�0 ���S�q{Y $<&YCW��#HӤ�����%����ßV]�A��� ������ �&`[$kL�I�ƒJ&xE"Q�XA(�{*!�R�\� �b��BByF�b����H>�Y!�}�+�\�e�$�,7�o/Ƀ��0�gI�c�S�9eUEy�*�����i�������#�B�b��^ϣ��uhj�B?�~���R�p�4SJ)�� (ْfx1�%+�K�EuTYg���0c���A?p�s��u�:�	C3�S�#Ū�w]��#��Ђo|A�m�/-5��X�r�q�˻܈%�$K+p���$٬עT�P��[2�*g�`T���S� ���Y���(1#SLW��G��C�/�tJ�m�aL��L��5����ߣxZ	�V�Z	;Vtif�*gjoD���dy�gs'�	�މ�9�3ʗ�)�;�=�٢��[�-߁���D7����w�~o��b�Yn
��7p�6���=�����j��&�7֮o�=�;�4�đq��0	&0j�I��������[j/�-�����fwX����|HGov��t�NحS�x�������٬O;Q�nW�S:�Y������~,���ږ�T�n����O���ϧ��7γfq;34�8&�V�v_�dNl�o����t��ݧ�� ���z���>S            x���sU(3�,����� ��         7   x�3�4�4Ċ9�L͹����-� ,���Ԓ�,P�̀��!n�A�F\1z\\\ V�            x������ � �            x������ � �     
BEGIN;

CREATE TABLE IF NOT EXISTS public.carrito
(
    id serial NOT NULL,
    usuario_id integer,
    libro_id integer,
    cantidad integer DEFAULT 1,
    agregado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT carrito_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.carrito_items
(
    id serial NOT NULL,
    id_carrito integer NOT NULL,
    id_libro integer NOT NULL,
    cantidad integer NOT NULL DEFAULT 1,
    precio_unit numeric(10, 2) NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT carrito_items_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.carritos
(
    id serial NOT NULL,
    id_usuario integer NOT NULL,
    completado boolean DEFAULT false,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT carritos_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.libros
(
    id serial NOT NULL,
    titulo character varying(200) COLLATE pg_catalog."default" NOT NULL,
    autor character varying(150) COLLATE pg_catalog."default" NOT NULL,
    precio numeric(10, 2) NOT NULL,
    stock integer DEFAULT 0,
    imagen character varying(255) COLLATE pg_catalog."default",
    descripcion text COLLATE pg_catalog."default",
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    categoria character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT libros_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.orden_items
(
    id serial NOT NULL,
    orden_id integer,
    libro_id integer,
    cantidad integer NOT NULL,
    precio_unitario numeric(10, 2) NOT NULL,
    CONSTRAINT orden_items_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.ordenes
(
    id serial NOT NULL,
    usuario_id integer,
    total numeric(10, 2) NOT NULL,
    estado character varying(50) COLLATE pg_catalog."default" DEFAULT 'pendiente'::character varying,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ordenes_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.pedido_items
(
    id serial NOT NULL,
    id_pedido integer NOT NULL,
    id_libro integer NOT NULL,
    cantidad integer NOT NULL,
    precio_unit numeric(10, 2) NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pedido_items_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.pedidos
(
    id serial NOT NULL,
    id_usuario integer NOT NULL,
    total numeric(10, 2) NOT NULL,
    estado character varying(50) COLLATE pg_catalog."default" DEFAULT 'completado'::character varying,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pedidos_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.productos
(
    id serial NOT NULL,
    titulo character varying(255) COLLATE pg_catalog."default" NOT NULL,
    autor character varying(255) COLLATE pg_catalog."default",
    categoria character varying(100) COLLATE pg_catalog."default",
    precio numeric(12, 2) NOT NULL DEFAULT 0,
    stock integer NOT NULL DEFAULT 0,
    imagen character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT productos_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.roles
(
    id serial NOT NULL,
    nombre character varying(50) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT roles_pkey PRIMARY KEY (id),
    CONSTRAINT roles_nombre_key UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS public.usuarios
(
    id serial NOT NULL,
    nombre character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email character varying(150) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    rol_id integer DEFAULT 2,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    activo boolean DEFAULT true,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id),
    CONSTRAINT usuarios_email_key UNIQUE (email)
);

ALTER TABLE IF EXISTS public.carrito
    ADD CONSTRAINT carrito_libro_id_fkey FOREIGN KEY (libro_id)
    REFERENCES public.libros (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.carrito
    ADD CONSTRAINT carrito_usuario_id_fkey FOREIGN KEY (usuario_id)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.carrito_items
    ADD CONSTRAINT carrito_items_id_carrito_fkey FOREIGN KEY (id_carrito)
    REFERENCES public.carritos (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.carrito_items
    ADD CONSTRAINT carrito_items_id_libro_fkey FOREIGN KEY (id_libro)
    REFERENCES public.libros (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.carritos
    ADD CONSTRAINT carritos_id_usuario_fkey FOREIGN KEY (id_usuario)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.orden_items
    ADD CONSTRAINT orden_items_libro_id_fkey FOREIGN KEY (libro_id)
    REFERENCES public.libros (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.orden_items
    ADD CONSTRAINT orden_items_orden_id_fkey FOREIGN KEY (orden_id)
    REFERENCES public.ordenes (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.ordenes
    ADD CONSTRAINT ordenes_usuario_id_fkey FOREIGN KEY (usuario_id)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;


ALTER TABLE IF EXISTS public.pedido_items
    ADD CONSTRAINT pedido_items_id_libro_fkey FOREIGN KEY (id_libro)
    REFERENCES public.libros (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.pedido_items
    ADD CONSTRAINT pedido_items_id_pedido_fkey FOREIGN KEY (id_pedido)
    REFERENCES public.pedidos (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.pedidos
    ADD CONSTRAINT pedidos_id_usuario_fkey FOREIGN KEY (id_usuario)
    REFERENCES public.usuarios (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.usuarios
    ADD CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id)
    REFERENCES public.roles (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

END;
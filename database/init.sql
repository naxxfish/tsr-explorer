-- Adminer 4.7.5 PostgreSQL dump

\connect "tsrdb";

CREATE TABLE "public"."tsrs" (
    "tsr_id" text NOT NULL,
    "version" integer NOT NULL,
    "creation_date" timestamp,
    "publish_date" timestamp,
    "route_code" text,
    "route_order" text,
    "from_location" text,
    "to_location" text,
    "line_name" text,
    "subunit_type" text,
    "mileage_from" integer,
    "mileage_to" integer,
    "subunit_from" integer,
    "subunit_to" integer,
    "speed_passenger" integer,
    "speed_freight" integer,
    "valid_from" timestamp,
    "valid_to" timestamp,
    "reason" text,
    "comments" text,
    "requestor" text,
    "direction" text,
    "route_group_name" text,
    "tsr_key" text,
    "won_valid_from" timestamp,
    "won_valid_to" timestamp,
    "last_published_in_won" text,
    "tsr_reference" text,
    "route_group_code" smallint,
    CONSTRAINT "tsrs_tsr_key" UNIQUE ("tsr_key")
) WITH (oids = false);

CREATE INDEX "tsrs_tsr_id" ON "public"."tsrs" USING btree ("tsr_id");


-- 2020-01-10 23:03:53.792485+00

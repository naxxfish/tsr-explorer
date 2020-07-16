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

CREATE TABLE "locations" (
  "locationCode" character(7) NOT NULL,
  "locationName" character(32) NOT NULL,
  "startDate" date NOT NULL,
  "endDate" date NOT NULL,
  "easting" character(6) NOT NULL,
  "northing" character(6) NOT NULL,
  "timingPointType" character(2) NOT NULL,
  "zone" character varying NOT NULL,
  "stanoxCode" character(5) NOT NULL,
  "offNetwork" boolean NOT NULL,
  "forceLPB" character(2) NOT NULL
);
COMMENT ON COLUMN "locations"."locationCode" IS 'TIPLOC';
COMMENT ON COLUMN "locations"."easting" IS 'Ordnance Survey reference ';
COMMENT ON COLUMN "locations"."northing" IS 'Ordnance Survey reference ';
COMMENT ON COLUMN "locations"."timingPointType" IS 'TRUST, Mandatory or Optional ';
COMMENT ON COLUMN "locations"."zone" IS 'Zone responsible for maintaining the record ';
COMMENT ON COLUMN "locations"."stanoxCode" IS 'Station Number code ';
COMMENT ON COLUMN "locations"."offNetwork" IS 'Y if the location is off the Network Rail network, or N if it is on-network ';
COMMENT ON COLUMN "locations"."forceLPB" IS 'L if the running line code should appear in the timetable when approaching the location, P if the path should appear in the timetable when leaving the location, B for both, or space for neither ';
COMMENT ON TABLE "locations" IS 'BPLAN location records';

CREATE TABLE "links" (
  "linkType" character(12) NOT NULL,
  "originLocation" character(7) NOT NULL,
  "destinationLocation" character(7) NOT NULL,
  "runningLineCode" character(3) NOT NULL,
  "addtionalLinkData" jsonb NULL
);
COMMENT ON COLUMN "links"."linkType" IS 'NETWORK or TIMING';
COMMENT ON COLUMN "links"."originLocation" IS 'TIPLOC of the start of the link';
COMMENT ON COLUMN "links"."destinationLocation" IS 'TIPLOC of the end of the link';
COMMENT ON COLUMN "links"."runningLineCode" IS ' 	e.g. FL, SL to distinguish parallel running lines ';
COMMENT ON COLUMN "links"."addtionalLinkData" IS 'Other data about the link specific to the type';

-- 2020-01-10 23:03:53.792485+00

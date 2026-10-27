-- סוגי האירוע הוחלפו: ניו בורן, סמאש קייק, חלאקה, משפחות.
-- בקשות ישנות שסוג האירוע שלהן כבר לא קיים עוברות ל"FAMILY".
CREATE TYPE "EventType_new" AS ENUM ('NEWBORN', 'SMASH_CAKE', 'CHALLAH_PHOTOSHOOT', 'FAMILY');

ALTER TABLE "BookingRequest"
  ALTER COLUMN "eventType" TYPE "EventType_new"
  USING (
    CASE "eventType"::text
      WHEN 'CHALLAH_PHOTOSHOOT' THEN 'CHALLAH_PHOTOSHOOT'
      ELSE 'FAMILY'
    END
  )::"EventType_new";

DROP TYPE "EventType";
ALTER TYPE "EventType_new" RENAME TO "EventType";

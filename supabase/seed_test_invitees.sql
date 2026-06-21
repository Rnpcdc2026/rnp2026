-- Données de test : 10 invités fictifs pour l'événement RNP 2026
-- Idempotent : ON CONFLICT (event_id, email) DO NOTHING

INSERT INTO invitations (event_id, email, first_name, last_name, entity, registered, sent_at)
SELECT id, 'marie.dubois@cdc-habitat.fr', 'Marie', 'Dubois', 'CDC Habitat Sud', false, NULL
FROM events WHERE slug = 'rnp-2026'
ON CONFLICT (event_id, email) DO NOTHING;

INSERT INTO invitations (event_id, email, first_name, last_name, entity, registered, sent_at)
SELECT id, 'jp.martin@cdc-habitat.fr', 'Jean-Pierre', 'Martin', 'CDC Habitat Île-de-France', false, NULL
FROM events WHERE slug = 'rnp-2026'
ON CONFLICT (event_id, email) DO NOTHING;

INSERT INTO invitations (event_id, email, first_name, last_name, entity, registered, sent_at)
SELECT id, 'sophie.lambert@adestia.fr', 'Sophie', 'Lambert', 'Adestia', false, NULL
FROM events WHERE slug = 'rnp-2026'
ON CONFLICT (event_id, email) DO NOTHING;

INSERT INTO invitations (event_id, email, first_name, last_name, entity, registered, sent_at)
SELECT id, 'antoine.rousseau@cdc-habitat.fr', 'Antoine', 'Rousseau', 'CDC Habitat Grand Ouest', false, NULL
FROM events WHERE slug = 'rnp-2026'
ON CONFLICT (event_id, email) DO NOTHING;

INSERT INTO invitations (event_id, email, first_name, last_name, entity, registered, sent_at)
SELECT id, 'claire.petit@cdc-habitat.fr', 'Claire', 'Petit', 'Direction Générale', false, NULL
FROM events WHERE slug = 'rnp-2026'
ON CONFLICT (event_id, email) DO NOTHING;

INSERT INTO invitations (event_id, email, first_name, last_name, entity, registered, sent_at)
SELECT id, 'thomas.moreau@cdc-habitat.fr', 'Thomas', 'Moreau', 'CDC Habitat Méditerranée', false, NULL
FROM events WHERE slug = 'rnp-2026'
ON CONFLICT (event_id, email) DO NOTHING;

INSERT INTO invitations (event_id, email, first_name, last_name, entity, registered, sent_at)
SELECT id, 'isabelle.garcia@cdc-habitat.fr', 'Isabelle', 'Garcia', 'CDC Habitat Nord-Est', false, NULL
FROM events WHERE slug = 'rnp-2026'
ON CONFLICT (event_id, email) DO NOTHING;

INSERT INTO invitations (event_id, email, first_name, last_name, entity, registered, sent_at)
SELECT id, 'nicolas.bernard@cdc-habitat.fr', 'Nicolas', 'Bernard', 'CDC Habitat Sud-Ouest', false, NULL
FROM events WHERE slug = 'rnp-2026'
ON CONFLICT (event_id, email) DO NOTHING;

INSERT INTO invitations (event_id, email, first_name, last_name, entity, registered, sent_at)
SELECT id, 'emilie.fontaine@cdc-habitat.fr', 'Émilie', 'Fontaine', 'Adestia', false, NULL
FROM events WHERE slug = 'rnp-2026'
ON CONFLICT (event_id, email) DO NOTHING;

INSERT INTO invitations (event_id, email, first_name, last_name, entity, registered, sent_at)
SELECT id, 'francois.lefevre@cdc-habitat.fr', 'François', 'Lefèvre', 'Direction Patrimoine', false, NULL
FROM events WHERE slug = 'rnp-2026'
ON CONFLICT (event_id, email) DO NOTHING;
